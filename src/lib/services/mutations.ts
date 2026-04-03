import { and, desc, eq, gt, inArray, ne, sql } from "drizzle-orm";

import { db } from "@/db";
import type {
  ProjectPostStatus,
  ProjectStatus,
  ReportStatus,
  VerificationState
} from "@/db/schema";
import {
  comments,
  domainVerifications,
  linkHealthChecks,
  magicLinks,
  moderationActions,
  projectClickEvents,
  projectOwners,
  projectPosts,
  projects,
  projectSaves,
  projectTags,
  rateLimitEvents,
  reports,
  tags,
  viewImpressionCounters
} from "@/db/schema";
import type { SessionProfile } from "@/lib/auth/session";
import { prepareMarkdownField, preparePlainTextField } from "@/lib/content/markdown";
import {
  sendProjectClaimLinkEmail,
  sendProjectCommentNotifications,
  sendProjectModerationNotifications
} from "@/lib/services/mail-notifications";
import { getDomainVerificationTarget, lookupDomainVerificationTokens } from "@/lib/domain-verification";
import { policyContent } from "@/lib/policies";
import { countLinks, parseCsvList } from "@/lib/http";
import { createOpaqueToken, hashValue } from "@/lib/utils/crypto";
import { slugify, truncate } from "@/lib/utils/strings";
import { normalizeUrl } from "@/lib/utils/urls";
import type { AnalysisEventKind, RankingClickSource } from "@/lib/utils/ranking";

const CLAIM_TOKEN_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 7;
const COMMENT_EDIT_WINDOW_MS = 1000 * 60 * 15;
const VIEW_EVENT_DEDUP_WINDOW_MS = 1000 * 60 * 60 * 24;
const POST_BURST_WINDOW_MS = 1000 * 60 * 60 * 12;
const MODERATION_COOLDOWN_WINDOW_MS = 1000 * 60 * 60 * 24 * 30;

const blockedTermList = ["casino", "bet", "porn", "adult", "loan", "torrent"];

type ProjectWriteAccess = {
  isAdmin: boolean;
  isOwner: boolean;
  canManage: boolean;
};

function buildPosterDataUrl(title: string, label: string) {
  const safeTitle = truncate(title, 24);
  const safeLabel = truncate(label, 18);

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 760">
      <rect width="1200" height="760" fill="#f6f3ee"/>
      <rect x="40" y="40" width="1120" height="680" rx="28" fill="#fffdf8" stroke="#e5ddd0"/>
      <rect x="86" y="86" width="220" height="588" rx="24" fill="#d76542"/>
      <rect x="360" y="120" width="210" height="38" rx="19" fill="#efe7db"/>
      <text x="465" y="145" text-anchor="middle" fill="#475569" font-size="18" font-weight="700" font-family="Arial">${safeLabel}</text>
      <text x="360" y="296" fill="#111827" font-size="84" font-weight="700" font-family="Arial">${safeTitle}</text>
      <text x="360" y="362" fill="#5b6472" font-size="28" font-family="Arial">바로 눌러보고 피드백을 모으는 프로젝트 페이지</text>
      <rect x="360" y="430" width="180" height="58" rx="18" fill="#111827"/>
      <text x="450" y="467" text-anchor="middle" fill="#fff" font-size="24" font-weight="700" font-family="Arial">Try</text>
    </svg>
  `)}`;
}

function containsBlockedTerms(...values: string[]) {
  const joined = values.join(" ").toLowerCase();
  return blockedTermList.some((term) => joined.includes(term));
}

function hasTooManyLinks(values: string[], maxLinks: number) {
  return values.reduce((total, value) => total + countLinks(value), 0) > maxLinks;
}

async function consumeRateLimit(bucket: string, identifier: string, limit: number, ttlSeconds: number) {
  const cutoff = new Date(Date.now() - ttlSeconds * 1000);
  const rows = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(rateLimitEvents)
    .where(
      and(
        eq(rateLimitEvents.bucket, bucket),
        eq(rateLimitEvents.identifier, identifier),
        gt(rateLimitEvents.createdAt, cutoff)
      )
    );

  const currentCount = rows[0]?.count ?? 0;

  if (currentCount >= limit) {
    throw new Error("요청이 너무 빠릅니다. 잠시 후 다시 시도해 주세요.");
  }

  await db.insert(rateLimitEvents).values({
    bucket,
    identifier,
    ttlSeconds
  });
}

async function getProjectById(projectId: string) {
  const project = await db.query.projects.findFirst({
    where: eq(projects.id, projectId),
    with: {
      owners: true,
      posts: {
        orderBy: [desc(projectPosts.createdAt)]
      }
    }
  });

  if (!project) {
    throw new Error("프로젝트를 찾을 수 없습니다.");
  }

  return project;
}

async function getProjectWriteAccess(projectId: string, user: SessionProfile): Promise<ProjectWriteAccess> {
  if (user.role === "admin") {
    return {
      isAdmin: true,
      isOwner: false,
      canManage: true
    };
  }

  const owner = await db.query.projectOwners.findFirst({
    where: and(eq(projectOwners.projectId, projectId), eq(projectOwners.userId, user.id)),
    columns: {
      id: true
    }
  });

  return {
    isAdmin: false,
    isOwner: Boolean(owner),
    canManage: Boolean(owner)
  };
}

async function requireOwnerOrAdmin(projectId: string, user: SessionProfile) {
  const access = await getProjectWriteAccess(projectId, user);

  if (!access.canManage) {
    throw new Error("프로젝트 소유자만 접근할 수 있습니다.");
  }

  return access;
}

async function generateUniqueSlug(title: string) {
  const baseSlug = slugify(title) || `project-${createOpaqueToken(3)}`;
  let attempt = baseSlug;
  let suffix = 2;

  while (true) {
    const existing = await db.query.projects.findFirst({
      where: eq(projects.slug, attempt),
      columns: { id: true }
    });

    if (!existing) {
      return attempt;
    }

    attempt = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}

async function ensureUniqueProjectUrls(liveUrl: string, githubUrl?: string | null, excludeProjectId?: string) {
  const liveUrlNormalized = normalizeUrl(liveUrl);
  const githubUrlNormalized = githubUrl ? normalizeUrl(githubUrl) : null;

  const duplicateLive = await db.query.projects.findFirst({
    where: excludeProjectId
      ? and(eq(projects.liveUrlNormalized, liveUrlNormalized), ne(projects.id, excludeProjectId))
      : eq(projects.liveUrlNormalized, liveUrlNormalized),
    columns: { id: true, slug: true, title: true }
  });

  if (duplicateLive) {
    throw new Error(`같은 라이브 URL을 가진 프로젝트가 이미 있습니다: ${duplicateLive.title}`);
  }

  if (githubUrlNormalized) {
    const duplicateGithub = await db.query.projects.findFirst({
      where: excludeProjectId
        ? and(eq(projects.githubUrlNormalized, githubUrlNormalized), ne(projects.id, excludeProjectId))
        : eq(projects.githubUrlNormalized, githubUrlNormalized),
      columns: { id: true, slug: true, title: true }
    });

    if (duplicateGithub) {
      throw new Error(`같은 GitHub 저장소를 가진 프로젝트가 이미 있습니다: ${duplicateGithub.title}`);
    }
  }

  return { liveUrlNormalized, githubUrlNormalized };
}

type TagDatabase = Pick<typeof db, "insert" | "query">;

async function ensureTags(projectId: string, rawTags: string[], database: TagDatabase = db) {
  const normalizedTags = rawTags
    .map((value) => value.trim())
    .filter(Boolean)
    .slice(0, 8)
    .map((value) => ({
      slug: slugify(value),
      name: value
    }))
    .filter((value) => value.slug);

  const dedupedTags = Array.from(new Map(normalizedTags.map((tag) => [tag.slug, tag])).values());

  if (!dedupedTags.length) {
    return;
  }

  const existingTags = await database.query.tags.findMany({
    where: inArray(
      tags.slug,
      dedupedTags.map((tag) => tag.slug)
    )
  });

  const existingBySlug = new Map(existingTags.map((tag) => [tag.slug, tag]));
  const tagsToInsert = dedupedTags.filter((tag) => !existingBySlug.has(tag.slug));

  if (tagsToInsert.length) {
    await database.insert(tags).values(tagsToInsert);
  }

  const finalTags = await database.query.tags.findMany({
    where: inArray(
      tags.slug,
      dedupedTags.map((tag) => tag.slug)
    )
  });

  await database.insert(projectTags).values(
    finalTags.map((tag) => ({
      projectId,
      tagId: tag.id
    }))
  );
}

function determineVerificationState(input: {
  verificationMethod: "email" | "github";
  githubUrl?: string | null;
  viewer?: SessionProfile | null;
}): VerificationState {
  if (input.verificationMethod === "github" && input.viewer?.githubUsername && input.githubUrl) {
    return "github_verified";
  }

  return "unverified";
}

function getFallbackVerificationState(githubUrl?: string | null, user?: SessionProfile | null): VerificationState {
  return githubUrl && user?.githubUsername ? "github_verified" : "unverified";
}

function shouldFlagForModeration(values: string[]) {
  if (containsBlockedTerms(...values)) return true;
  if (hasTooManyLinks(values, 4)) return true;
  return false;
}

async function shouldAutoPublishProjectPost(projectId: string, values: string[]) {
  const project = await db.query.projects.findFirst({
    where: eq(projects.id, projectId),
    columns: {
      id: true,
      status: true
    }
  });

  if (!project || project.status !== "published") {
    return false;
  }

  if (shouldFlagForModeration(values)) {
    return false;
  }

  const recentPosts = await db.query.projectPosts.findMany({
    where: and(eq(projectPosts.projectId, projectId), gt(projectPosts.createdAt, new Date(Date.now() - POST_BURST_WINDOW_MS))),
    columns: { id: true }
  });

  if (recentPosts.length >= 3) {
    return false;
  }

  const recentModerationRows = await db.query.moderationActions.findMany({
    where: and(
      eq(moderationActions.targetType, "project"),
      eq(moderationActions.targetId, projectId),
      gt(moderationActions.createdAt, new Date(Date.now() - MODERATION_COOLDOWN_WINDOW_MS))
    ),
    columns: {
      action: true
    },
    orderBy: [desc(moderationActions.createdAt)],
    limit: 10
  });

  const blockingActions = new Set(["limit", "hide", "reject", "request_changes", "mark_duplicate"]);
  return !recentModerationRows.some((row) => blockingActions.has(row.action));
}

function deriveProjectModerationAction(currentStatus: ProjectStatus, nextStatus: ProjectStatus) {
  if (nextStatus === "published") {
    return currentStatus === "pending" ? "publish" : "restore";
  }

  if (nextStatus === "limited") return "limit";
  if (nextStatus === "hidden") return "hide";
  if (nextStatus === "rejected") return "reject";
  if (nextStatus === "archived") return "archive";
  return "request_changes";
}

function canTransitionProjectStatus(current: ProjectStatus, next: ProjectStatus) {
  const map: Record<ProjectStatus, ProjectStatus[]> = {
    pending: ["published", "limited", "hidden", "rejected"],
    published: ["limited", "hidden", "archived"],
    limited: ["published", "hidden", "archived"],
    hidden: ["published", "limited", "archived"],
    rejected: ["pending"],
    archived: ["published", "limited", "hidden"]
  };

  return map[current]?.includes(next) ?? false;
}

function sanitizeCsvList(value: string | undefined) {
  return parseCsvList(value)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 8);
}

function normalizeOptionalPlainText(value: string | null | undefined, label: string, maxLength: number) {
  const normalized = preparePlainTextField(value ?? "", {
    label,
    maxLength,
    allowEmpty: true
  });

  return normalized || null;
}

function resolveOutboundTargetFromSource(source: RankingClickSource) {
  if (source === "detail_github") return "github";
  if (source === "detail_demo") return "demo";
  if (source === "detail_docs") return "docs";
  return "live";
}

function normalizeOptionalMarkdown(value: string | null | undefined, label: string, maxLength: number, maxLinks: number) {
  const normalized = prepareMarkdownField(value ?? "", {
    label,
    maxLength,
    maxLinks,
    allowEmpty: true
  });

  return normalized || null;
}

export async function toggleSaveProject(projectId: string, userId: string) {
  const project = await db.query.projects.findFirst({
    where: eq(projects.id, projectId),
    columns: {
      id: true,
      slug: true
    }
  });

  if (!project) {
    throw new Error("프로젝트를 찾을 수 없습니다.");
  }

  const existing = await db.query.projectSaves.findFirst({
    where: and(eq(projectSaves.projectId, projectId), eq(projectSaves.userId, userId))
  });

  if (existing) {
    await db.delete(projectSaves).where(and(eq(projectSaves.projectId, projectId), eq(projectSaves.userId, userId)));
    return {
      saved: false,
      slug: project.slug
    };
  }

  await db.insert(projectSaves).values({
    projectId,
    userId
  });

  return {
    saved: true,
    slug: project.slug
  };
}

export async function recordProjectClick(input: {
  projectId: string;
  source: RankingClickSource;
  sessionHash: string;
  userId?: string | null;
}) {
  const project = await db.query.projects.findFirst({
    where: eq(projects.id, input.projectId),
    columns: {
      id: true,
      slug: true,
      liveUrl: true,
      githubUrl: true,
      demoUrl: true,
      docsUrl: true
    }
  });

  if (!project) {
    throw new Error("프로젝트를 찾을 수 없습니다.");
  }

  const target = resolveOutboundTargetFromSource(input.source);
  const targetUrl =
    target === "github"
      ? project.githubUrl
      : target === "demo"
        ? project.demoUrl
        : target === "docs"
          ? project.docsUrl
          : project.liveUrl;

  if (!targetUrl) {
    throw new Error("선택한 링크가 아직 등록되지 않았습니다.");
  }

  await db.insert(projectClickEvents).values({
    projectId: input.projectId,
    source: input.source,
    sessionHash: input.sessionHash,
    userId: input.userId ?? null
  });

  return {
    slug: project.slug,
    targetUrl
  };
}

export async function recordProjectAnalysisEvent(input: {
  projectId: string;
  kind: AnalysisEventKind;
  source: string;
  sessionHash: string;
}) {
  const project = await db.query.projects.findFirst({
    where: eq(projects.id, input.projectId),
    columns: {
      id: true
    }
  });

  if (!project) {
    throw new Error("프로젝트를 찾을 수 없습니다.");
  }

  const eventSource = `${input.kind}:${input.source}`;
  const recent = await db.query.viewImpressionCounters.findFirst({
    where: and(
      eq(viewImpressionCounters.projectId, input.projectId),
      eq(viewImpressionCounters.source, eventSource),
      eq(viewImpressionCounters.sessionHash, input.sessionHash),
      gt(viewImpressionCounters.createdAt, new Date(Date.now() - VIEW_EVENT_DEDUP_WINDOW_MS))
    ),
    columns: { id: true }
  });

  if (recent) {
    return;
  }

  await db.insert(viewImpressionCounters).values({
    projectId: input.projectId,
    source: eventSource,
    sessionHash: input.sessionHash
  });
}

export async function createComment(input: {
  projectId: string;
  user?: SessionProfile | null;
  guestName?: string | null;
  guestSessionHash?: string | null;
  bodyMd: string;
  postId?: string | null;
  parentId?: string | null;
  rateLimitIdentifier: string;
}) {
  const isGuest = !input.user;
  const guestName = input.guestName
    ? preparePlainTextField(input.guestName, {
        label: "닉네임",
        minLength: 2,
        maxLength: 40
      })
    : null;

  if (isGuest && (!guestName || !input.guestSessionHash)) {
    throw new Error("비회원 댓글에는 닉네임과 방문자 세션 정보가 필요합니다.");
  }

  if (!isGuest && (guestName || input.guestSessionHash)) {
    throw new Error("로그인 댓글과 비회원 댓글 정보를 함께 사용할 수 없습니다.");
  }

  await consumeRateLimit("comment:create", input.rateLimitIdentifier, isGuest ? 4 : 8, 60);

  const normalizedBody = prepareMarkdownField(input.bodyMd, {
    label: "댓글",
    maxLength: 1000,
    maxLinks: 2
  });

  if (containsBlockedTerms(normalizedBody) || hasTooManyLinks([normalizedBody], 2)) {
    throw new Error("댓글 내용이 운영 기준에 맞지 않습니다.");
  }

  const project = await db.query.projects.findFirst({
    where: eq(projects.id, input.projectId),
    columns: {
      id: true,
      title: true,
      slug: true,
      status: true
    }
  });

  if (!project || !["published", "limited", "archived"].includes(project.status)) {
    throw new Error("댓글을 작성할 수 없는 프로젝트입니다.");
  }

  let linkedPostTitle: string | null = null;

  if (input.postId) {
    const post = await db.query.projectPosts.findFirst({
      where: and(eq(projectPosts.id, input.postId), eq(projectPosts.projectId, input.projectId)),
      columns: { id: true, title: true }
    });

    if (!post) {
      throw new Error("연결된 활동을 찾을 수 없습니다.");
    }

    linkedPostTitle = post.title;
  }

  if (input.parentId) {
    const parent = await db.query.comments.findFirst({
      where: and(eq(comments.id, input.parentId), eq(comments.projectId, input.projectId))
    });

    if (!parent) {
      throw new Error("원본 댓글을 찾을 수 없습니다.");
    }

    if (parent.parentId) {
      throw new Error("대댓글은 한 단계까지만 허용됩니다.");
    }
  }

  const [created] = await db
    .insert(comments)
    .values({
      projectId: input.projectId,
      postId: input.postId ?? null,
      parentId: input.parentId ?? null,
      userId: input.user?.id ?? null,
      guestName,
      guestSessionHash: input.user ? null : input.guestSessionHash ?? null,
      bodyMd: normalizedBody,
      status: "active"
    })
    .returning({
      id: comments.id
    });

  await sendProjectCommentNotifications({
    projectId: project.id,
    projectSlug: project.slug,
    projectTitle: project.title,
    actorName: input.user?.displayName ?? guestName ?? "비회원",
    actorEmail: input.user?.email ?? null,
    commentBody: normalizedBody,
    postTitle: linkedPostTitle
  });

  return {
    commentId: created.id,
    slug: project.slug
  };
}

export async function updateCommentBody(input: {
  commentId: string;
  user: SessionProfile;
  bodyMd: string;
}) {
  const normalizedBody = prepareMarkdownField(input.bodyMd, {
    label: "댓글",
    maxLength: 1000,
    maxLinks: 2
  });

  const comment = await db.query.comments.findFirst({
    where: eq(comments.id, input.commentId),
    with: {
      project: {
        columns: { slug: true }
      }
    }
  });

  if (!comment) {
    throw new Error("댓글을 찾을 수 없습니다.");
  }

  if (comment.userId !== input.user.id && input.user.role !== "admin") {
    throw new Error("본인 댓글만 수정할 수 있습니다.");
  }

  if (Date.now() - new Date(comment.createdAt).getTime() > COMMENT_EDIT_WINDOW_MS && input.user.role !== "admin") {
    throw new Error("댓글 수정 가능 시간이 지났습니다.");
  }

  if (containsBlockedTerms(normalizedBody) || hasTooManyLinks([normalizedBody], 2)) {
    throw new Error("댓글 내용이 운영 기준에 맞지 않습니다.");
  }

  await db
    .update(comments)
    .set({
      bodyMd: normalizedBody,
      updatedAt: new Date()
    })
    .where(eq(comments.id, input.commentId));

  return {
    slug: comment.project.slug
  };
}

export async function softDeleteComment(input: {
  commentId: string;
  user: SessionProfile;
}) {
  const comment = await db.query.comments.findFirst({
    where: eq(comments.id, input.commentId),
    with: {
      project: {
        columns: { slug: true }
      }
    }
  });

  if (!comment) {
    throw new Error("댓글을 찾을 수 없습니다.");
  }

  if (comment.userId !== input.user.id && input.user.role !== "admin") {
    throw new Error("본인 댓글만 삭제할 수 있습니다.");
  }

  await db
    .update(comments)
    .set({
      status: "deleted",
      bodyMd: "삭제된 댓글입니다.",
      updatedAt: new Date()
    })
    .where(eq(comments.id, input.commentId));

  return {
    slug: comment.project.slug
  };
}

export async function createReport(input: {
  reporterUserId?: string | null;
  targetType: "project" | "post" | "comment";
  targetId: string;
  reason: string;
  note?: string | null;
  rateLimitIdentifier: string;
}) {
  await consumeRateLimit("report:create", input.rateLimitIdentifier, 5, 60);

  const [created] = await db
    .insert(reports)
    .values({
      reporterUserId: input.reporterUserId ?? null,
      targetType: input.targetType,
      targetId: input.targetId,
      reason: input.reason,
      note: input.note ?? null,
      status: "open"
    })
    .returning({
      id: reports.id
    });

  return created.id;
}

export async function submitLaunchProject(input: {
  title: string;
  tagline: string;
  shortDescription: string;
  overviewMd: string;
  problemMd: string;
  targetUsersMd: string;
  whyMadeMd?: string | null;
  stage: "alpha" | "beta" | "live";
  category: string;
  platform: "web" | "mobile" | "desktop";
  pricingModel: "free" | "freemium" | "paid" | "custom";
  pricingNote?: string | null;
  liveUrl: string;
  githubUrl?: string | null;
  demoUrl?: string | null;
  docsUrl?: string | null;
  makerAlias: string;
  coverImageUrl?: string | null;
  galleryCsv?: string;
  aiToolsCsv?: string;
  tagCsv?: string;
  isOpenSource: boolean;
  noSignupRequired: boolean;
  isSoloMaker: boolean;
  ownerEmail?: string | null;
  verificationMethod: "email" | "github";
  viewer?: SessionProfile | null;
}) {
  const title = preparePlainTextField(input.title, {
    label: "프로젝트 이름",
    minLength: 2,
    maxLength: 80
  });
  const tagline = preparePlainTextField(input.tagline, {
    label: "한 줄 소개",
    minLength: 10,
    maxLength: 120
  });
  const shortDescription = preparePlainTextField(input.shortDescription, {
    label: "짧은 설명",
    minLength: 20,
    maxLength: 220
  });
  const overviewMd = prepareMarkdownField(input.overviewMd, {
    label: "무엇인지",
    maxLength: 3000,
    maxLinks: 5
  });
  const problemMd = prepareMarkdownField(input.problemMd, {
    label: "어떤 문제를 푸는지",
    maxLength: 3000,
    maxLinks: 5
  });
  const targetUsersMd = prepareMarkdownField(input.targetUsersMd, {
    label: "누구를 위한 것인지",
    maxLength: 3000,
    maxLinks: 5
  });
  const whyMadeMd = normalizeOptionalMarkdown(input.whyMadeMd, "왜 만들었는지", 3000, 5);
  const makerAlias = preparePlainTextField(input.makerAlias, {
    label: "메이커 별칭",
    minLength: 2,
    maxLength: 80
  });
  const pricingNote = normalizeOptionalPlainText(input.pricingNote, "가격 메모", 120);
  const contentFields = [title, tagline, shortDescription, overviewMd, problemMd, targetUsersMd, whyMadeMd ?? ""];

  if (shouldFlagForModeration(contentFields)) {
    throw new Error("입력한 내용이 운영 정책에 따라 제출 보류되었습니다. 문구와 링크를 정리한 뒤 다시 시도해 주세요.");
  }

  if (!input.viewer && input.verificationMethod !== "email") {
    throw new Error("비회원 제출은 이메일 소유권 확인만 사용할 수 있습니다.");
  }

  if (!input.viewer && !input.ownerEmail) {
    throw new Error("비회원 제출에는 소유권 연결용 이메일이 필요합니다.");
  }

  const { liveUrlNormalized, githubUrlNormalized } = await ensureUniqueProjectUrls(input.liveUrl, input.githubUrl ?? null);
  const now = new Date();
  const slug = await generateUniqueSlug(title);
  const gallery = sanitizeCsvList(input.galleryCsv);
  const aiTools = sanitizeCsvList(input.aiToolsCsv);
  const tagCandidates = sanitizeCsvList(input.tagCsv);
  const coverImageUrl = input.coverImageUrl?.trim() || buildPosterDataUrl(title, input.category);
  const verificationState = determineVerificationState({
    verificationMethod: input.verificationMethod,
    githubUrl: input.githubUrl,
    viewer: input.viewer
  });
  const claimToken = !input.viewer ? createOpaqueToken(24) : null;
  const projectStatus: ProjectStatus = input.viewer ? "published" : "pending";
  const launchStatus: ProjectPostStatus = input.viewer ? "published" : "pending";

  const result = await db.transaction(async (tx) => {
    const [project] = await tx
      .insert(projects)
      .values({
        slug,
        title,
        tagline,
        shortDescription,
        overviewMd,
        problemMd,
        targetUsersMd,
        whyMadeMd,
        stage: input.stage,
        category: input.category,
        platform: input.platform,
        pricingModel: input.pricingModel,
        pricingNote,
        liveUrl: input.liveUrl,
        liveUrlNormalized,
        githubUrl: input.githubUrl ?? null,
        githubUrlNormalized,
        demoUrl: input.demoUrl ?? null,
        docsUrl: input.docsUrl ?? null,
        makerAlias,
        coverImageUrl,
        galleryJson: gallery.length ? gallery : [coverImageUrl],
        isOpenSource: input.isOpenSource,
        noSignupRequired: input.noSignupRequired,
        isSoloMaker: input.isSoloMaker,
        aiToolsJson: aiTools,
        verificationState,
        status: projectStatus,
        publishedAt: input.viewer ? now : null,
        lastActivityAt: now
      })
      .returning({
        id: projects.id,
        slug: projects.slug
      });

    await tx.insert(projectPosts).values({
      projectId: project.id,
      authorUserId: input.viewer?.id ?? null,
      type: "launch",
      title: `${title} 공개`,
      summary: truncate(shortDescription, 140),
      bodyMd: overviewMd,
      mediaJson: gallery.length ? gallery : [coverImageUrl],
      status: launchStatus,
      publishedAt: input.viewer ? now : null
    });

    await tx.insert(projectOwners).values({
      projectId: project.id,
      userId: input.viewer?.id ?? null,
      verificationMethod: input.viewer ? input.verificationMethod : "email",
      emailHash: input.ownerEmail ? hashValue(input.ownerEmail.toLowerCase()) : null,
      claimTokenHash: claimToken ? hashValue(claimToken) : null,
      claimTokenExpiresAt: claimToken ? new Date(Date.now() + CLAIM_TOKEN_MAX_AGE_MS) : null,
      isPrimary: true,
      claimedAt: input.viewer ? now : null
    });

    await tx.insert(linkHealthChecks).values({
      projectId: project.id,
      status: "unknown",
      note: "아직 링크 상태를 검사하지 않았습니다."
    });

    const fallbackTags = [...tagCandidates, input.category, input.platform, input.stage];
    await ensureTags(project.id, fallbackTags, tx);

    if (!input.viewer && input.ownerEmail) {
      await tx.insert(magicLinks).values({
        email: input.ownerEmail.toLowerCase(),
        tokenHash: hashValue(claimToken!),
        purpose: "project_claim",
        metadataJson: {
          projectId: project.id
        },
        expiresAt: new Date(Date.now() + CLAIM_TOKEN_MAX_AGE_MS)
      });
    }

    return project;
  });

  const claimEmailDelivery =
    !input.viewer && input.ownerEmail && claimToken
      ? await sendProjectClaimLinkEmail({
          recipient: input.ownerEmail,
          rawToken: claimToken,
          projectTitle: title,
          slug: result.slug
        })
      : null;

  return {
    projectId: result.id,
    slug: result.slug,
    claimToken,
    status: projectStatus,
    claimEmailDelivery
  };
}

export async function updateProject(input: {
  projectId: string;
  title: string;
  tagline: string;
  shortDescription: string;
  overviewMd: string;
  problemMd: string;
  targetUsersMd: string;
  whyMadeMd?: string | null;
  stage: "alpha" | "beta" | "live";
  category: string;
  platform: "web" | "mobile" | "desktop";
  pricingModel: "free" | "freemium" | "paid" | "custom";
  pricingNote?: string | null;
  liveUrl: string;
  githubUrl?: string | null;
  demoUrl?: string | null;
  docsUrl?: string | null;
  makerAlias: string;
  coverImageUrl?: string | null;
  galleryCsv?: string;
  aiToolsCsv?: string;
  tagCsv?: string;
  isOpenSource: boolean;
  noSignupRequired: boolean;
  isSoloMaker: boolean;
  user: SessionProfile;
}) {
  await requireOwnerOrAdmin(input.projectId, input.user);

  const existingProject = await db.query.projects.findFirst({
    where: eq(projects.id, input.projectId),
    columns: {
      id: true,
      slug: true,
      liveUrlNormalized: true,
      verificationState: true,
      coverImageUrl: true
    },
    with: {
      domainVerifications: {
        orderBy: [desc(domainVerifications.updatedAt)],
        limit: 1
      }
    }
  });

  if (!existingProject) {
    throw new Error("프로젝트를 찾을 수 없습니다.");
  }

  const title = preparePlainTextField(input.title, {
    label: "프로젝트 이름",
    minLength: 2,
    maxLength: 80
  });
  const tagline = preparePlainTextField(input.tagline, {
    label: "한 줄 소개",
    minLength: 10,
    maxLength: 120
  });
  const shortDescription = preparePlainTextField(input.shortDescription, {
    label: "짧은 설명",
    minLength: 20,
    maxLength: 220
  });
  const overviewMd = prepareMarkdownField(input.overviewMd, {
    label: "무엇인지",
    maxLength: 3000,
    maxLinks: 5
  });
  const problemMd = prepareMarkdownField(input.problemMd, {
    label: "어떤 문제를 푸는지",
    maxLength: 3000,
    maxLinks: 5
  });
  const targetUsersMd = prepareMarkdownField(input.targetUsersMd, {
    label: "누구를 위한 것인지",
    maxLength: 3000,
    maxLinks: 5
  });
  const whyMadeMd = normalizeOptionalMarkdown(input.whyMadeMd, "왜 만들었는지", 3000, 5);
  const makerAlias = preparePlainTextField(input.makerAlias, {
    label: "메이커 별칭",
    minLength: 2,
    maxLength: 80
  });
  const pricingNote = normalizeOptionalPlainText(input.pricingNote, "가격 메모", 120);
  const contentFields = [title, tagline, shortDescription, overviewMd, problemMd, targetUsersMd, whyMadeMd ?? ""];

  if (shouldFlagForModeration(contentFields)) {
    throw new Error("입력한 내용이 운영 정책에 맞지 않습니다. 문구와 링크를 정리한 뒤 다시 저장해 주세요.");
  }

  const { liveUrlNormalized, githubUrlNormalized } = await ensureUniqueProjectUrls(
    input.liveUrl,
    input.githubUrl ?? null,
    input.projectId
  );

  const gallery = sanitizeCsvList(input.galleryCsv);
  const aiTools = sanitizeCsvList(input.aiToolsCsv);
  const tagCandidates = sanitizeCsvList(input.tagCsv);
  const coverImageUrl =
    input.coverImageUrl?.trim() || existingProject.coverImageUrl || buildPosterDataUrl(title, input.category);
  const liveUrlChanged = existingProject.liveUrlNormalized !== liveUrlNormalized;
  const previousDomainVerification = existingProject.domainVerifications[0] ?? null;
  const fallbackVerificationState = getFallbackVerificationState(input.githubUrl, input.user);
  const previousTarget = (() => {
    try {
      return getDomainVerificationTarget(existingProject.liveUrlNormalized);
    } catch {
      return null;
    }
  })();
  const nextTarget = (() => {
    try {
      return getDomainVerificationTarget(input.liveUrl);
    } catch {
      return null;
    }
  })();
  const canKeepDomainVerification =
    existingProject.verificationState === "domain_verified" &&
    previousDomainVerification?.status === "verified" &&
    previousTarget?.registrableDomain &&
    nextTarget?.registrableDomain &&
    previousTarget.registrableDomain === nextTarget.registrableDomain;
  const verificationState: VerificationState = canKeepDomainVerification ? "domain_verified" : fallbackVerificationState;

  await db.transaction(async (tx) => {
    await tx
      .update(projects)
      .set({
        title,
        tagline,
        shortDescription,
        overviewMd,
        problemMd,
        targetUsersMd,
        whyMadeMd,
        stage: input.stage,
        category: input.category,
        platform: input.platform,
        pricingModel: input.pricingModel,
        pricingNote,
        liveUrl: input.liveUrl,
        liveUrlNormalized,
        githubUrl: input.githubUrl ?? null,
        githubUrlNormalized,
        demoUrl: input.demoUrl ?? null,
        docsUrl: input.docsUrl ?? null,
        makerAlias,
        coverImageUrl,
        galleryJson: gallery.length ? gallery : [coverImageUrl],
        isOpenSource: input.isOpenSource,
        noSignupRequired: input.noSignupRequired,
        isSoloMaker: input.isSoloMaker,
        aiToolsJson: aiTools,
        verificationState,
        updatedAt: new Date()
      })
      .where(eq(projects.id, input.projectId));

    await tx.delete(projectTags).where(eq(projectTags.projectId, input.projectId));
    await ensureTags(input.projectId, [...tagCandidates, input.category, input.platform, input.stage], tx);

    if (liveUrlChanged) {
      await tx.insert(linkHealthChecks).values({
        projectId: input.projectId,
        status: "unknown",
        note: "라이브 URL이 변경되어 링크 상태를 다시 확인해야 합니다."
      });

      if (!canKeepDomainVerification && previousDomainVerification) {
        await tx
          .update(domainVerifications)
          .set({
            status: "revoked",
            lastError: "라이브 URL 또는 검증 대상 도메인이 변경되어 기존 도메인 검증을 무효화했습니다.",
            updatedAt: new Date()
          })
          .where(eq(domainVerifications.id, previousDomainVerification.id));
      }
    }
  });

  return {
    slug: existingProject.slug
  };
}

export async function submitProjectPost(input: {
  projectId: string;
  kind: "update" | "feedback";
  title: string;
  summary: string;
  bodyMd: string;
  requestedFeedbackMd?: string | null;
  mediaCsv?: string;
  user: SessionProfile;
}) {
  const project = await getProjectById(input.projectId);
  const access = await getProjectWriteAccess(input.projectId, input.user);
  const isMemberFeedback = input.kind === "feedback" && !access.canManage;

  if (input.kind === "update" && !access.canManage) {
    throw new Error("업데이트는 프로젝트 소유자만 작성할 수 있습니다.");
  }

  if (isMemberFeedback && !["published", "limited", "archived"].includes(project.status)) {
    throw new Error("구조화된 피드백은 현재 공개 중인 프로젝트에서만 작성할 수 있습니다.");
  }

  const title = preparePlainTextField(input.title, {
    label: "활동 제목",
    minLength: 2,
    maxLength: 120
  });
  const summary = preparePlainTextField(input.summary, {
    label: "활동 요약",
    minLength: 10,
    maxLength: 240
  });
  const bodyMd = prepareMarkdownField(input.bodyMd, {
    label: "활동 본문",
    maxLength: 5000,
    maxLinks: 5
  });
  const requestedFeedbackMd = normalizeOptionalMarkdown(input.requestedFeedbackMd, "원하는 피드백", 5000, 5);

  if (input.kind === "feedback" && access.canManage && !requestedFeedbackMd) {
    throw new Error("피드백 요청 활동에는 원하는 피드백 내용을 함께 입력해 주세요.");
  }

  const values = [title, summary, bodyMd, requestedFeedbackMd ?? ""];
  const autoPublish = isMemberFeedback ? false : await shouldAutoPublishProjectPost(input.projectId, values);
  const status: ProjectPostStatus = autoPublish ? "published" : "pending";
  const publishedAt = autoPublish ? new Date() : null;
  const media = sanitizeCsvList(input.mediaCsv);

  const [created] = await db
    .insert(projectPosts)
    .values({
      projectId: input.projectId,
      authorUserId: input.user.id,
      type: input.kind,
      title,
      summary,
      bodyMd,
      requestedFeedbackMd: input.kind === "feedback" ? requestedFeedbackMd : null,
      mediaJson: media,
      status,
      publishedAt
    })
    .returning({
      id: projectPosts.id
    });

  await db
    .update(projects)
    .set({
      lastActivityAt: new Date(),
      updatedAt: new Date()
    })
    .where(eq(projects.id, input.projectId));

  return {
    postId: created.id,
    status,
    slug: project.slug
  };
}

export async function reviewClaimToken(rawToken: string) {
  const tokenHash = hashValue(rawToken);

  const owner = await db.query.projectOwners.findFirst({
    where: and(eq(projectOwners.claimTokenHash, tokenHash), gt(projectOwners.claimTokenExpiresAt, new Date())),
    with: {
      project: {
        columns: {
          id: true,
          slug: true,
          title: true
        }
      }
    }
  });

  if (!owner) {
    return null;
  }

  return {
    ownerId: owner.id,
    projectId: owner.project.id,
    slug: owner.project.slug,
    title: owner.project.title,
    alreadyClaimed: Boolean(owner.userId)
  };
}

export async function claimProjectOwnership(rawToken: string, user: SessionProfile) {
  const tokenHash = hashValue(rawToken);

  const owner = await db.query.projectOwners.findFirst({
    where: and(eq(projectOwners.claimTokenHash, tokenHash), gt(projectOwners.claimTokenExpiresAt, new Date())),
    with: {
      project: {
        columns: {
          id: true,
          slug: true,
          githubUrl: true
        }
      }
    }
  });

  if (!owner) {
    throw new Error("유효하지 않거나 만료된 claim 링크입니다.");
  }

  if (owner.userId && owner.userId !== user.id) {
    throw new Error("이미 다른 계정에 연결된 claim 링크입니다.");
  }

  const verificationState: VerificationState =
    owner.verificationMethod === "github" && user.githubUsername && owner.project.githubUrl ? "github_verified" : "unverified";
  const now = new Date();

  await db.transaction(async (tx) => {
    await tx
      .update(projectOwners)
      .set({
        userId: user.id,
        claimedAt: now,
        claimTokenHash: null,
        claimTokenExpiresAt: null
      })
      .where(eq(projectOwners.id, owner.id));

    await tx
      .update(magicLinks)
      .set({
        consumedAt: now
      })
      .where(eq(magicLinks.tokenHash, tokenHash));

    await tx
      .update(projectPosts)
      .set({
        authorUserId: user.id
      })
      .where(and(eq(projectPosts.projectId, owner.project.id), sql`${projectPosts.authorUserId} is null`));

    await tx
      .update(projects)
      .set({
        verificationState,
        status: "published",
        publishedAt: now,
        lastActivityAt: now,
        updatedAt: now
      })
      .where(eq(projects.id, owner.project.id));

    await tx
      .update(projectPosts)
      .set({
        status: "published",
        publishedAt: now
      })
      .where(and(eq(projectPosts.projectId, owner.project.id), eq(projectPosts.type, "launch"), eq(projectPosts.status, "pending")));
  });

  return {
    slug: owner.project.slug
  };
}

export async function issueProjectDomainVerification(input: {
  projectId: string;
  user: SessionProfile;
}) {
  await requireOwnerOrAdmin(input.projectId, input.user);

  const project = await db.query.projects.findFirst({
    where: eq(projects.id, input.projectId),
    columns: {
      id: true,
      slug: true,
      title: true,
      liveUrl: true
    }
  });

  if (!project) {
    throw new Error("프로젝트를 찾을 수 없습니다.");
  }

  const target = getDomainVerificationTarget(project.liveUrl);
  const token = createOpaqueToken(20);
  const now = new Date();

  await db
    .insert(domainVerifications)
    .values({
      projectId: project.id,
      registrableDomain: target.registrableDomain,
      recordName: target.recordName,
      token,
      status: "pending",
      lastCheckedAt: null,
      verifiedAt: null,
      lastError: null,
      updatedAt: now
    })
    .onConflictDoUpdate({
      target: domainVerifications.projectId,
      set: {
        registrableDomain: target.registrableDomain,
        recordName: target.recordName,
        token,
        status: "pending",
        lastCheckedAt: null,
        verifiedAt: null,
        lastError: null,
        updatedAt: now
      }
    });

  return {
    slug: project.slug,
    title: project.title,
    registrableDomain: target.registrableDomain,
    recordName: target.recordName,
    token
  };
}

export async function verifyProjectDomainVerification(input: {
  projectId: string;
  user: SessionProfile;
}) {
  await requireOwnerOrAdmin(input.projectId, input.user);

  const project = await db.query.projects.findFirst({
    where: eq(projects.id, input.projectId),
    columns: {
      id: true,
      slug: true,
      title: true,
      liveUrl: true,
      githubUrl: true
    },
    with: {
      domainVerifications: {
        orderBy: [desc(domainVerifications.updatedAt)],
        limit: 1
      }
    }
  });

  if (!project) {
    throw new Error("프로젝트를 찾을 수 없습니다.");
  }

  const current = project.domainVerifications[0] ?? null;

  if (!current) {
    throw new Error("먼저 도메인 검증 토큰을 발급해 주세요.");
  }

  const target = getDomainVerificationTarget(project.liveUrl);

  if (current.registrableDomain !== target.registrableDomain || current.recordName !== target.recordName) {
    throw new Error("라이브 URL이 변경되어 기존 토큰이 맞지 않습니다. 새 토큰을 다시 발급해 주세요.");
  }

  const values = await lookupDomainVerificationTokens(current.recordName);
  const now = new Date();

  if (!values.includes(current.token)) {
    await db
      .update(domainVerifications)
      .set({
        status: "failed",
        lastCheckedAt: now,
        lastError: "DNS TXT 레코드에서 현재 토큰을 찾지 못했습니다. DNS 전파 후 다시 확인해 주세요.",
        updatedAt: now
      })
      .where(eq(domainVerifications.id, current.id));

    throw new Error("DNS TXT 레코드에서 현재 토큰을 찾지 못했습니다. DNS 전파 후 다시 확인해 주세요.");
  }

  await db.transaction(async (tx) => {
    await tx
      .update(domainVerifications)
      .set({
        status: "verified",
        lastCheckedAt: now,
        verifiedAt: now,
        lastError: null,
        updatedAt: now
      })
      .where(eq(domainVerifications.id, current.id));

    await tx
      .update(projects)
      .set({
        verificationState: "domain_verified",
        updatedAt: now
      })
      .where(eq(projects.id, project.id));
  });

  return {
    slug: project.slug,
    registrableDomain: current.registrableDomain
  };
}

export async function moderateProjectStatus(input: {
  projectId: string;
  nextStatus: ProjectStatus;
  reason?: string | null;
  admin: SessionProfile;
}) {
  const project = await db.query.projects.findFirst({
    where: eq(projects.id, input.projectId),
    columns: {
      id: true,
      title: true,
      slug: true,
      status: true,
      publishedAt: true,
      featured: true,
      featuredOrder: true
    }
  });

  if (!project) {
    throw new Error("프로젝트를 찾을 수 없습니다.");
  }

  const currentStatus = project.status as ProjectStatus;

  if (!canTransitionProjectStatus(currentStatus, input.nextStatus)) {
    throw new Error(`현재 상태 ${currentStatus} 에서 ${input.nextStatus} 로 전환할 수 없습니다.`);
  }

  await db.transaction(async (tx) => {
    await tx
      .update(projects)
      .set({
        status: input.nextStatus,
        publishedAt: input.nextStatus === "published" ? project.publishedAt ?? new Date() : project.publishedAt,
        updatedAt: new Date(),
        featured: input.nextStatus === "published" ? project.featured : false,
        featuredOrder: input.nextStatus === "published" ? project.featuredOrder : null
      })
      .where(eq(projects.id, input.projectId));

    if (input.nextStatus === "published") {
      await tx
        .update(projectPosts)
        .set({
          status: "published",
          publishedAt: new Date()
        })
        .where(and(eq(projectPosts.projectId, input.projectId), eq(projectPosts.type, "launch"), eq(projectPosts.status, "pending")));
    }

    await tx.insert(moderationActions).values({
      adminUserId: input.admin.id,
      targetType: "project",
      targetId: input.projectId,
      action: deriveProjectModerationAction(currentStatus, input.nextStatus),
      reason: input.reason ?? null,
      metadataJson: {
        from: currentStatus,
        to: input.nextStatus
      }
    });
  });

  await sendProjectModerationNotifications({
    projectId: project.id,
    projectSlug: project.slug,
    projectTitle: project.title,
    nextStatus: input.nextStatus,
    reason: input.reason ?? null,
    contextType: "project"
  });

  return {
    slug: project.slug
  };
}

export async function moderatePostStatus(input: {
  postId: string;
  nextStatus: ProjectPostStatus;
  reason?: string | null;
  admin: SessionProfile;
}) {
  const post = await db.query.projectPosts.findFirst({
    where: eq(projectPosts.id, input.postId),
    with: {
      project: {
        columns: {
          id: true,
          title: true,
          slug: true,
          status: true,
          publishedAt: true
        }
      }
    }
  });

  if (!post) {
    throw new Error("활동을 찾을 수 없습니다.");
  }

  await db.transaction(async (tx) => {
    await tx
      .update(projectPosts)
      .set({
        status: input.nextStatus,
        publishedAt: input.nextStatus === "published" ? post.publishedAt ?? new Date() : post.publishedAt
      })
      .where(eq(projectPosts.id, input.postId));

    if (post.type === "launch" && post.project.status === "pending" && input.nextStatus === "published") {
      await tx
        .update(projects)
        .set({
          status: "published",
          publishedAt: post.project.publishedAt ?? new Date(),
          lastActivityAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(projects.id, post.project.id));
    }

    await tx.insert(moderationActions).values({
      adminUserId: input.admin.id,
      targetType: "post",
      targetId: input.postId,
      action: input.nextStatus === "published" ? "publish" : input.nextStatus === "hidden" ? "hide" : "reject",
      reason: input.reason ?? null,
      metadataJson: {
        postType: post.type,
        to: input.nextStatus
      }
    });
  });

  await sendProjectModerationNotifications({
    projectId: post.project.id,
    projectSlug: post.project.slug,
    projectTitle: post.project.title,
    nextStatus: input.nextStatus,
    reason: input.reason ?? null,
    contextTitle: post.title,
    contextType: "post"
  });

  return {
    slug: post.project.slug
  };
}

export async function updateReportStatus(input: {
  reportId: string;
  nextStatus: ReportStatus;
  reason?: string | null;
  admin: SessionProfile;
}) {
  const report = await db.query.reports.findFirst({
    where: eq(reports.id, input.reportId),
    columns: {
      id: true
    }
  });

  if (!report) {
    throw new Error("신고를 찾을 수 없습니다.");
  }

  await db.transaction(async (tx) => {
    await tx
      .update(reports)
      .set({
        status: input.nextStatus
      })
      .where(eq(reports.id, input.reportId));

    await tx.insert(moderationActions).values({
      adminUserId: input.admin.id,
      targetType: "report",
      targetId: input.reportId,
      action: input.nextStatus === "resolved" ? "resolve_report" : "reject_report",
      reason: input.reason ?? null,
      metadataJson: {
        to: input.nextStatus
      }
    });
  });
}

export async function setProjectFeature(input: {
  projectId: string;
  featured: boolean;
  order?: number | null;
  admin: SessionProfile;
}) {
  const project = await db.query.projects.findFirst({
    where: eq(projects.id, input.projectId),
    columns: {
      id: true,
      slug: true,
      status: true
    }
  });

  if (!project) {
    throw new Error("프로젝트를 찾을 수 없습니다.");
  }

  if (input.featured && project.status !== "published") {
    throw new Error("공개 상태 프로젝트만 피처드로 지정할 수 있습니다.");
  }

  await db.transaction(async (tx) => {
    await tx
      .update(projects)
      .set({
        featured: input.featured,
        featuredOrder: input.featured ? input.order ?? 1 : null,
        updatedAt: new Date()
      })
      .where(eq(projects.id, input.projectId));

    await tx.insert(moderationActions).values({
      adminUserId: input.admin.id,
      targetType: "project",
      targetId: input.projectId,
      action: input.featured ? "feature" : "unfeature",
      reason: null,
      metadataJson: {
        order: input.featured ? input.order ?? 1 : null
      }
    });
  });

  return {
    slug: project.slug
  };
}

export function getPolicyParagraphs() {
  return policyContent;
}
