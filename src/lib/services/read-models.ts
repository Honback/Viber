import { desc, eq, inArray } from "drizzle-orm";

import { db } from "@/db";
import type {
  CommentStatus,
  ProjectPostStatus,
  ProjectPostType,
  ProjectStatus,
  VerificationState
} from "@/db/schema";
import {
  comments,
  linkHealthChecks,
  projectOwners,
  projectPosts,
  projectRankSnapshots,
  projects,
  projectSaves,
  reports
} from "@/db/schema";
import { projectPostLabels, projectStatusLabels, verificationLabels } from "@/lib/constants";
import { calculateTrendingScoreV1, rankingClickSources } from "@/lib/utils/ranking";
import { getUrlHostname } from "@/lib/utils/urls";

const homeStatuses: ProjectStatus[] = ["published"];
const exploreStatuses: ProjectStatus[] = ["published", "limited", "archived"];
const activeCommentStatuses: CommentStatus[] = ["active", "deleted"];
const THIRTY_DAYS_MS = 1000 * 60 * 60 * 24 * 30;
const FOURTEEN_DAYS_MS = 1000 * 60 * 60 * 24 * 14;
const SEVEN_DAYS_MS = 1000 * 60 * 60 * 24 * 7;

type ProjectRecord = Awaited<ReturnType<typeof fetchProjectsWithRelations>>[number];

export type ProjectCardModel = {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  shortDescription: string;
  liveUrl: string;
  makerAlias: string;
  category: string;
  platform: string;
  stage: string;
  status: ProjectStatus;
  verificationState: VerificationState;
  coverImageUrl: string;
  gallery: string[];
  badges: string[];
  tags: { slug: string; name: string }[];
  latestActivityType: ProjectPostType | null;
  latestActivityTitle: string | null;
  latestActivityAt: Date;
  publishedAt: Date | null;
  metrics: {
    saves: number;
    comments: number;
    uniqueClicks: number;
    score: number;
  };
  featured: boolean;
  featuredOrder: number | null;
  linkHealth: {
    status: string;
    label: string;
    note: string | null;
  } | null;
};

export type ProjectCommentModel = {
  id: string;
  parentId: string | null;
  postId: string | null;
  bodyMd: string;
  status: CommentStatus;
  createdAt: Date;
  updatedAt: Date;
  author: {
    id: string;
    displayName: string;
  };
};

export type ProjectDuplicateCandidateModel = {
  id: string;
  slug: string;
  title: string;
  status: ProjectStatus;
  reason: string;
};

export type ProjectPostModel = {
  id: string;
  type: ProjectPostType;
  title: string;
  summary: string;
  bodyMd: string;
  requestedFeedbackMd: string | null;
  media: string[];
  status: ProjectPostStatus;
  publishedAt: Date | null;
};

export type ProjectDetailModel = ProjectCardModel & {
  overviewMd: string;
  problemMd: string;
  targetUsersMd: string;
  whyMadeMd: string | null;
  pricingModel: string;
  pricingNote: string | null;
  liveUrl: string;
  githubUrl: string | null;
  demoUrl: string | null;
  docsUrl: string | null;
  isOpenSource: boolean;
  noSignupRequired: boolean;
  isSoloMaker: boolean;
  aiTools: string[];
  owners: {
    id: string;
    verificationMethod: string;
    isPrimary: boolean;
    user: {
      id: string;
      displayName: string;
      githubUsername: string | null;
    } | null;
  }[];
  posts: ProjectPostModel[];
  comments: ProjectCommentModel[];
  relatedProjects: ProjectCardModel[];
};

export type OwnedProjectManagementModel = ProjectCardModel & {
  overviewMd: string;
  problemMd: string;
  targetUsersMd: string;
  whyMadeMd: string | null;
  pricingModel: string;
  pricingNote: string | null;
  liveUrl: string;
  githubUrl: string | null;
  demoUrl: string | null;
  docsUrl: string | null;
  isOpenSource: boolean;
  noSignupRequired: boolean;
  isSoloMaker: boolean;
  aiTools: string[];
  tagsCsv: string;
  galleryCsv: string;
  aiToolsCsv: string;
  claimPending: boolean;
};

export type AdminProjectListItemModel = ProjectCardModel & {
  liveUrlNormalized: string;
  githubUrlNormalized: string | null;
  ownersSummary: {
    total: number;
    claimed: number;
    primaryMethod: string | null;
  };
  claimPending: boolean;
  duplicateCandidates: ProjectDuplicateCandidateModel[];
};

export type ExploreFilters = {
  query?: string;
  category?: string;
  categories?: string[];
  platform?: string;
  stage?: string;
  pricing?: string;
  activity?: string;
  openSource?: boolean;
  noSignup?: boolean;
  soloMaker?: boolean;
  sort?: "trending" | "latest" | "updated" | "comments";
  page?: number;
  pageSize?: number;
};

async function fetchProjectsWithRelations(statuses?: ProjectStatus[]) {
  return db.query.projects.findMany({
    where: statuses ? inArray(projects.status, statuses) : undefined,
    orderBy: [desc(projects.updatedAt)],
    with: {
      tagLinks: {
        with: {
          tag: true
        }
      },
      posts: {
        orderBy: [desc(projectPosts.publishedAt), desc(projectPosts.createdAt)]
      },
      comments: {
        where: inArray(comments.status, activeCommentStatuses),
        orderBy: [desc(comments.createdAt)],
        with: {
          author: true
        }
      },
      saves: true,
      clickEvents: true,
      owners: {
        with: {
          user: true
        }
      },
      linkHealthChecks: {
        orderBy: [desc(linkHealthChecks.checkedAt)],
        limit: 1
      },
      rankSnapshots: {
        orderBy: [desc(projectRankSnapshots.computedAt)],
        limit: 1
      }
    }
  });
}

function getProjectBadges(project: ProjectRecord) {
  const badges = [project.platform === "desktop" ? "Desktop" : project.platform === "mobile" ? "Mobile" : "Web"];

  if (project.isOpenSource) badges.push("Open Source");
  if (project.noSignupRequired) badges.push("No Signup");
  if (project.pricingModel === "free") badges.push("Free");
  if (project.pricingModel === "freemium") badges.push("Freemium");
  if (project.stage === "beta") badges.push("Beta");
  if (project.stage === "alpha") badges.push("Alpha");
  if (project.isSoloMaker) badges.push("Solo Maker");

  return badges.slice(0, 3);
}

function getLinkHealthLabel(status: string) {
  if (status === "healthy") return "정상";
  if (status === "degraded") return "응답 불안정";
  if (status === "broken") return "죽은 링크";
  return "검사 전";
}

function getLatestPublishedPost(project: ProjectRecord, type?: ProjectPostType) {
  return (
    project.posts.find((post) => {
      if (post.status !== "published") {
        return false;
      }

      if (!type) {
        return true;
      }

      return post.type === type;
    }) ?? null
  );
}

function tokenizeTitle(title: string) {
  return new Set(
    title
      .toLowerCase()
      .split(/[^a-z0-9가-힣]+/i)
      .filter((token) => token.length >= 2)
  );
}

function buildDuplicateCandidateMap(items: ProjectRecord[]) {
  const duplicateMap = new Map<string, ProjectDuplicateCandidateModel[]>();
  const titleTokens = new Map(items.map((item) => [item.id, tokenizeTitle(item.title)]));
  const hostnames = new Map(items.map((item) => [item.id, getUrlHostname(item.liveUrlNormalized)]));

  for (const current of items) {
    const currentTokens = titleTokens.get(current.id) ?? new Set<string>();
    const currentHost = hostnames.get(current.id);
    const currentCandidates: ProjectDuplicateCandidateModel[] = [];

    for (const candidate of items) {
      if (candidate.id === current.id) {
        continue;
      }

      const candidateHost = hostnames.get(candidate.id);
      if (!currentHost || !candidateHost || currentHost !== candidateHost) {
        continue;
      }

      const candidateTokens = titleTokens.get(candidate.id) ?? new Set<string>();
      const overlappingTokenCount = [...currentTokens].filter((token) => candidateTokens.has(token)).length;
      const reason = overlappingTokenCount >= 2 ? "유사 제목 + 동일 도메인" : "동일 라이브 도메인";

      currentCandidates.push({
        id: candidate.id,
        slug: candidate.slug,
        title: candidate.title,
        status: candidate.status as ProjectStatus,
        reason
      });
    }

    duplicateMap.set(
      current.id,
      currentCandidates
        .sort((left, right) => left.title.localeCompare(right.title, "ko"))
        .slice(0, 3)
    );
  }

  return duplicateMap;
}

function buildFallbackScore(project: ProjectRecord) {
  const now = Date.now();
  const clickCutoff = now - SEVEN_DAYS_MS;
  const saveCutoff = now - THIRTY_DAYS_MS;
  const commentCutoff = now - THIRTY_DAYS_MS;

  const uniqueTryClicks7d = new Set(
    project.clickEvents
      .filter((event) => rankingClickSources.includes(event.source as (typeof rankingClickSources)[number]))
      .filter((event) => new Date(event.createdAt).getTime() >= clickCutoff)
      .map((event) => event.sessionHash)
  ).size;

  const newSaves30d = project.saves.filter((save) => new Date(save.createdAt).getTime() >= saveCutoff).length;
  const recentComments = project.comments.filter(
    (comment) => comment.status === "active" && new Date(comment.createdAt).getTime() >= commentCutoff
  );
  const uniqueCommenterCount = new Set(recentComments.map((comment) => comment.userId)).size;
  const commentSignal30d = Math.min(recentComments.length, uniqueCommenterCount * 2);
  const ranking = calculateTrendingScoreV1({
    uniqueTryClicks7d,
    newSaves30d,
    commentSignal30d,
    lastActivityAt: project.lastActivityAt ?? project.updatedAt
  });

  return {
    uniqueTryClicks7d,
    newSaves30d,
    commentSignal30d,
    finalScore: ranking.finalScore
  };
}

function mapProjectCard(project: ProjectRecord): ProjectCardModel {
  const latestPublishedPost = getLatestPublishedPost(project);
  const latestRankSnapshot = project.rankSnapshots[0] ?? null;
  const activeComments = project.comments.filter((comment) => comment.status === "active");
  const fallbackScore = buildFallbackScore(project);
  const lastHealth = project.linkHealthChecks[0] ?? null;

  return {
    id: project.id,
    slug: project.slug,
    title: project.title,
    tagline: project.tagline,
    shortDescription: project.shortDescription,
    liveUrl: project.liveUrl,
    makerAlias: project.makerAlias,
    category: project.category,
    platform: project.platform,
    stage: project.stage,
    status: project.status as ProjectStatus,
    verificationState: project.verificationState as VerificationState,
    coverImageUrl: project.coverImageUrl,
    gallery: project.galleryJson as string[],
    badges: getProjectBadges(project),
    tags: project.tagLinks.map((link) => ({
      slug: link.tag.slug,
      name: link.tag.name
    })),
    latestActivityType: (latestPublishedPost?.type as ProjectPostType | undefined) ?? null,
    latestActivityTitle: latestPublishedPost?.title ?? null,
    latestActivityAt: latestPublishedPost?.publishedAt ?? project.lastActivityAt ?? project.updatedAt,
    publishedAt: project.publishedAt,
    metrics: {
      saves: project.saves.length,
      comments: activeComments.length,
      uniqueClicks: latestRankSnapshot?.uniqueTryClicks7d ?? fallbackScore.uniqueTryClicks7d,
      score: latestRankSnapshot?.finalScore ?? fallbackScore.finalScore
    },
    featured: project.featured,
    featuredOrder: project.featuredOrder,
    linkHealth: lastHealth
      ? {
          status: lastHealth.status,
          label: getLinkHealthLabel(lastHealth.status),
          note: lastHealth.note ?? null
        }
      : null
  };
}

function mapOwnedProjectManagement(project: ProjectRecord): OwnedProjectManagementModel {
  const card = mapProjectCard(project);
  const ownerRows = project.owners;

  return {
    ...card,
    overviewMd: project.overviewMd,
    problemMd: project.problemMd,
    targetUsersMd: project.targetUsersMd,
    whyMadeMd: project.whyMadeMd,
    pricingModel: project.pricingModel,
    pricingNote: project.pricingNote,
    liveUrl: project.liveUrl,
    githubUrl: project.githubUrl,
    demoUrl: project.demoUrl,
    docsUrl: project.docsUrl,
    isOpenSource: project.isOpenSource,
    noSignupRequired: project.noSignupRequired,
    isSoloMaker: project.isSoloMaker,
    aiTools: project.aiToolsJson as string[],
    tagsCsv: project.tagLinks.map((link) => link.tag.name).join(", "),
    galleryCsv: (project.galleryJson as string[]).join(", "),
    aiToolsCsv: (project.aiToolsJson as string[]).join(", "),
    claimPending: ownerRows.some((owner) => !owner.userId && Boolean(owner.claimTokenHash))
  };
}

function mapAdminProjectListItem(
  project: ProjectRecord,
  duplicateCandidates: ProjectDuplicateCandidateModel[]
): AdminProjectListItemModel {
  const card = mapProjectCard(project);
  const claimedOwners = project.owners.filter((owner) => Boolean(owner.userId));
  const primaryOwner = project.owners.find((owner) => owner.isPrimary) ?? project.owners[0] ?? null;

  return {
    ...card,
    liveUrlNormalized: project.liveUrlNormalized,
    githubUrlNormalized: project.githubUrlNormalized,
    ownersSummary: {
      total: project.owners.length,
      claimed: claimedOwners.length,
      primaryMethod: primaryOwner?.verificationMethod ?? null
    },
    claimPending: project.owners.some((owner) => !owner.userId && Boolean(owner.claimTokenHash)),
    duplicateCandidates
  };
}

function sortProjectCards(items: ProjectCardModel[], sort: ExploreFilters["sort"]) {
  if (sort === "latest") {
    return [...items].sort((left, right) => (right.publishedAt?.getTime() ?? 0) - (left.publishedAt?.getTime() ?? 0));
  }

  if (sort === "updated") {
    return [...items].sort((left, right) => right.latestActivityAt.getTime() - left.latestActivityAt.getTime());
  }

  if (sort === "comments") {
    return [...items].sort((left, right) => right.metrics.comments - left.metrics.comments);
  }

  return [...items].sort((left, right) => {
    if (right.metrics.score !== left.metrics.score) {
      return right.metrics.score - left.metrics.score;
    }

    const activityDelta = right.latestActivityAt.getTime() - left.latestActivityAt.getTime();
    if (activityDelta !== 0) {
      return activityDelta;
    }

    return (right.publishedAt?.getTime() ?? 0) - (left.publishedAt?.getTime() ?? 0);
  });
}

function filterProjectCards(items: ProjectCardModel[], filters: ExploreFilters) {
  const query = filters.query?.trim().toLowerCase();

  return items.filter((item) => {
    const activeCategories = filters.categories?.filter((c) => c !== "all") ?? [];
    if (activeCategories.length > 0 && !activeCategories.includes(item.category)) return false;
    if (activeCategories.length === 0 && filters.category && filters.category !== "all" && item.category !== filters.category) return false;
    if (filters.platform && filters.platform !== "all" && item.platform !== filters.platform) return false;
    if (filters.stage && filters.stage !== "all" && item.stage !== filters.stage) return false;
    if (filters.pricing && filters.pricing !== "all" && item.badges.every((badge) => badge.toLowerCase() !== filters.pricing?.toLowerCase())) {
      return false;
    }
    if (filters.activity && filters.activity !== "all" && item.latestActivityType !== filters.activity) return false;
    if (filters.openSource && !item.badges.includes("Open Source")) return false;
    if (filters.noSignup && !item.badges.includes("No Signup")) return false;
    if (filters.soloMaker && !item.badges.includes("Solo Maker")) return false;
    if (!query) return true;

    const haystack = [
      item.title,
      item.tagline,
      item.shortDescription,
      item.makerAlias,
      item.category,
      item.platform,
      ...item.tags.map((tag) => tag.slug),
      ...item.tags.map((tag) => tag.name)
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(query);
  });
}

function isWithin(date: Date | null | undefined, durationMs: number) {
  if (!date) {
    return false;
  }

  return Date.now() - date.getTime() <= durationMs;
}

export async function getViewerState(userId?: string | null) {
  if (!userId) {
    return {
      savedProjectIds: [],
      ownedProjectIds: []
    };
  }

  const [savedRows, ownerRows] = await Promise.all([
    db.select({ projectId: projectSaves.projectId }).from(projectSaves).where(eq(projectSaves.userId, userId)),
    db.select({ projectId: projectOwners.projectId }).from(projectOwners).where(eq(projectOwners.userId, userId))
  ]);

  return {
    savedProjectIds: savedRows.map((row) => row.projectId),
    ownedProjectIds: ownerRows.map((row) => row.projectId)
  };
}

export async function getHomepageData() {
  const records = await fetchProjectsWithRelations(homeStatuses);
  const cards = sortProjectCards(records.map(mapProjectCard), "trending");
  const recordById = new Map(records.map((record) => [record.id, record]));

  return {
    featured: [...cards].filter((project) => project.featured).sort((left, right) => (left.featuredOrder ?? 99) - (right.featuredOrder ?? 99)),
    launches: [...cards]
      .filter((project) => isWithin(project.publishedAt, THIRTY_DAYS_MS))
      .sort((left, right) => (right.publishedAt?.getTime() ?? 0) - (left.publishedAt?.getTime() ?? 0))
      .slice(0, 6),
    feedback: [...cards]
      .filter((project) => {
        const record = recordById.get(project.id);
        const feedbackPost = record ? getLatestPublishedPost(record, "feedback") : null;
        return isWithin(feedbackPost?.publishedAt ?? null, FOURTEEN_DAYS_MS);
      })
      .sort((left, right) => {
        const leftRecord = recordById.get(left.id);
        const rightRecord = recordById.get(right.id);
        const leftDate = getLatestPublishedPost(leftRecord!, "feedback")?.publishedAt?.getTime() ?? 0;
        const rightDate = getLatestPublishedPost(rightRecord!, "feedback")?.publishedAt?.getTime() ?? 0;
        return rightDate - leftDate;
      })
      .slice(0, 6),
    updates: [...cards]
      .filter((project) => {
        const record = recordById.get(project.id);
        const updatePost = record ? getLatestPublishedPost(record, "update") : null;
        return isWithin(updatePost?.publishedAt ?? null, FOURTEEN_DAYS_MS);
      })
      .sort((left, right) => {
        const leftRecord = recordById.get(left.id);
        const rightRecord = recordById.get(right.id);
        const leftDate = getLatestPublishedPost(leftRecord!, "update")?.publishedAt?.getTime() ?? 0;
        const rightDate = getLatestPublishedPost(rightRecord!, "update")?.publishedAt?.getTime() ?? 0;
        return rightDate - leftDate;
      })
      .slice(0, 6),
    tags: Array.from(new Map(cards.flatMap((project) => project.tags).map((tag) => [tag.slug, tag])).values()).slice(0, 8)
  };
}

export async function getExploreData(filters: ExploreFilters = {}) {
  const records = await fetchProjectsWithRelations(exploreStatuses);
  const cards = records
    .map(mapProjectCard)
    .filter((project) => {
      const hasDirectSearchContext = Boolean(
        filters.query?.trim() ||
          (filters.categories?.filter((c) => c !== "all").length ?? 0) > 0 ||
          (filters.category && filters.category !== "all") ||
          (filters.platform && filters.platform !== "all") ||
          (filters.stage && filters.stage !== "all") ||
          (filters.pricing && filters.pricing !== "all") ||
          (filters.activity && filters.activity !== "all") ||
          filters.openSource ||
          filters.noSignup ||
          filters.soloMaker
      );

      if (project.status === "published") return true;
      return hasDirectSearchContext;
    });

  const filtered = sortProjectCards(filterProjectCards(cards, filters), filters.sort ?? "trending");
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.max(1, Math.min(filters.pageSize ?? 9, 24));
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  return {
    items: filtered.slice((page - 1) * pageSize, page * pageSize),
    total: filtered.length,
    page,
    pageSize,
    totalPages
  };
}

export async function getProjectDetailBySlug(slug: string) {
  const project = await db.query.projects.findFirst({
    where: eq(projects.slug, slug),
    with: {
      tagLinks: { with: { tag: true } },
      posts: { orderBy: [desc(projectPosts.publishedAt), desc(projectPosts.createdAt)] },
      comments: {
        orderBy: [desc(comments.createdAt)],
        with: { author: true }
      },
      saves: true,
      clickEvents: true,
      owners: { with: { user: true } },
      linkHealthChecks: { orderBy: [desc(linkHealthChecks.checkedAt)], limit: 1 },
      rankSnapshots: { orderBy: [desc(projectRankSnapshots.computedAt)], limit: 1 }
    }
  });

  if (!project) {
    return null;
  }

  const card = mapProjectCard(project);
  const publicProjectCards = (await fetchProjectsWithRelations(exploreStatuses)).map(mapProjectCard);
  const relatedProjects = publicProjectCards
    .filter((item) => item.id !== card.id && item.tags.some((tag) => card.tags.some((current) => current.slug === tag.slug)))
    .slice(0, 3);

  return {
    ...card,
    overviewMd: project.overviewMd,
    problemMd: project.problemMd,
    targetUsersMd: project.targetUsersMd,
    whyMadeMd: project.whyMadeMd,
    pricingModel: project.pricingModel,
    pricingNote: project.pricingNote,
    liveUrl: project.liveUrl,
    githubUrl: project.githubUrl,
    demoUrl: project.demoUrl,
    docsUrl: project.docsUrl,
    isOpenSource: project.isOpenSource,
    noSignupRequired: project.noSignupRequired,
    isSoloMaker: project.isSoloMaker,
    aiTools: project.aiToolsJson as string[],
    owners: project.owners.map((owner) => ({
      id: owner.id,
      verificationMethod: owner.verificationMethod,
      isPrimary: owner.isPrimary,
      user: owner.user
        ? {
            id: owner.user.id,
            displayName: owner.user.displayName,
            githubUsername: owner.user.githubUsername
          }
        : null
    })),
    posts: project.posts.map((post) => ({
      id: post.id,
      type: post.type as ProjectPostType,
      title: post.title,
      summary: post.summary,
      bodyMd: post.bodyMd,
      requestedFeedbackMd: post.requestedFeedbackMd,
      media: post.mediaJson as string[],
      status: post.status as ProjectPostStatus,
      publishedAt: post.publishedAt
    })),
    comments: project.comments.map((comment) => ({
      id: comment.id,
      parentId: comment.parentId,
      postId: comment.postId,
      bodyMd: comment.bodyMd,
      status: comment.status as CommentStatus,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      author: {
        id: comment.author.id,
        displayName: comment.author.displayName
      }
    })),
    relatedProjects
  } satisfies ProjectDetailModel;
}

export async function getSavedProjects(userId: string) {
  const records = await fetchProjectsWithRelations(exploreStatuses);
  return records
    .map(mapProjectCard)
    .filter((project) => records.find((record) => record.id === project.id)?.saves.some((save) => save.userId === userId));
}

export async function getOwnedProjects(userId: string) {
  const records = await db.query.projects.findMany({
    orderBy: [desc(projects.updatedAt)],
    with: {
      tagLinks: { with: { tag: true } },
      posts: { orderBy: [desc(projectPosts.createdAt)] },
      comments: { with: { author: true } },
      saves: true,
      clickEvents: true,
      owners: {
        where: eq(projectOwners.userId, userId),
        with: {
          user: true
        }
      },
      linkHealthChecks: { orderBy: [desc(linkHealthChecks.checkedAt)], limit: 1 },
      rankSnapshots: { orderBy: [desc(projectRankSnapshots.computedAt)], limit: 1 }
    }
  });

  return records.filter((project) => project.owners.length > 0).map(mapProjectCard);
}

export async function getOwnedProjectManagementData(userId: string) {
  const records = await db.query.projects.findMany({
    orderBy: [desc(projects.updatedAt)],
    with: {
      tagLinks: { with: { tag: true } },
      posts: { orderBy: [desc(projectPosts.createdAt)] },
      comments: { with: { author: true } },
      saves: true,
      clickEvents: true,
      owners: {
        where: eq(projectOwners.userId, userId),
        with: {
          user: true
        }
      },
      linkHealthChecks: { orderBy: [desc(linkHealthChecks.checkedAt)], limit: 1 },
      rankSnapshots: { orderBy: [desc(projectRankSnapshots.computedAt)], limit: 1 }
    }
  });

  return records.filter((project) => project.owners.length > 0).map(mapOwnedProjectManagement);
}

export async function getProjectMetaBySlug(slug: string) {
  const project = await db.query.projects.findFirst({
    where: eq(projects.slug, slug),
    columns: {
      id: true,
      title: true,
      tagline: true,
      shortDescription: true,
      category: true,
      platform: true,
      stage: true,
      status: true,
      coverImageUrl: true,
    },
    with: {
      tagLinks: { with: { tag: true } },
    },
  });
  if (!project) return null;
  return {
    title: project.title,
    tagline: project.tagline,
    shortDescription: project.shortDescription,
    category: project.category,
    platform: project.platform,
    stage: project.stage,
    status: project.status,
    coverImageUrl: project.coverImageUrl,
    tags: project.tagLinks.map((link) => link.tag),
  };
}

export async function getTagPageData(tagSlug: string) {
  const records = await fetchProjectsWithRelations(exploreStatuses);
  return records.map(mapProjectCard).filter((project) => project.tags.some((tag) => tag.slug === tagSlug));
}

export async function getModerationQueue() {
  const [pendingProjectRecords, linkIssueRecords, pendingPosts, openReports] = await Promise.all([
    fetchProjectsWithRelations(["pending"]),
    fetchProjectsWithRelations(["published", "limited", "archived"]),
    db.query.projectPosts.findMany({
      where: eq(projectPosts.status, "pending"),
      orderBy: [desc(projectPosts.createdAt)],
      with: {
        project: true
      }
    }),
    db.query.reports.findMany({
      where: eq(reports.status, "open"),
      orderBy: [desc(reports.createdAt)]
    })
  ]);

  const claimPendingProjects = pendingProjectRecords.filter((project) =>
    project.owners.some((owner) => !owner.userId && Boolean(owner.claimTokenHash))
  );
  const moderationPendingProjects = pendingProjectRecords.filter(
    (project) => !claimPendingProjects.some((claimPending) => claimPending.id === project.id)
  );
  const claimPendingIds = new Set(claimPendingProjects.map((project) => project.id));
  const linkIssueProjects = linkIssueRecords
    .filter((project) => {
      const latestStatus = project.linkHealthChecks[0]?.status;
      return latestStatus === "degraded" || latestStatus === "broken";
    })
    .map(mapProjectCard)
    .sort((left, right) => right.latestActivityAt.getTime() - left.latestActivityAt.getTime());

  return {
    pendingProjects: moderationPendingProjects.map(mapProjectCard),
    claimPendingProjects: claimPendingProjects.map(mapProjectCard),
    linkIssueProjects,
    pendingPosts: pendingPosts.filter((post) => !claimPendingIds.has(post.projectId)),
    openReports
  };
}

export async function getAdminProjectsData() {
  const records = await fetchProjectsWithRelations();
  return records.map(mapProjectCard);
}

export async function getAdminProjectListData(filters?: {
  query?: string;
  status?: string;
  verification?: string;
  link?: string;
}) {
  const records = await fetchProjectsWithRelations();
  const duplicateMap = buildDuplicateCandidateMap(records);

  return records
    .filter((project) => {
      if (filters?.status && filters.status !== "all" && project.status !== filters.status) {
        return false;
      }

      if (filters?.verification && filters.verification !== "all" && project.verificationState !== filters.verification) {
        return false;
      }

      const latestHealth = project.linkHealthChecks[0]?.status ?? "unknown";
      if (filters?.link && filters.link !== "all" && latestHealth !== filters.link) {
        return false;
      }

      const query = filters?.query?.trim().toLowerCase();
      if (!query) {
        return true;
      }

      return [
        project.title,
        project.tagline,
        project.shortDescription,
        project.slug,
        project.makerAlias,
        project.liveUrl,
        project.githubUrl ?? "",
        ...project.tagLinks.map((link) => link.tag.slug),
        ...project.tagLinks.map((link) => link.tag.name)
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    })
    .map((project) => mapAdminProjectListItem(project, duplicateMap.get(project.id) ?? []))
    .sort((left, right) => {
      const statusDelta = left.status.localeCompare(right.status, "ko");
      if (statusDelta !== 0) {
        return statusDelta;
      }

      return right.latestActivityAt.getTime() - left.latestActivityAt.getTime();
    });
}

export function getProjectStatusLabel(status: ProjectStatus) {
  return projectStatusLabels[status];
}

export function getVerificationLabel(state: VerificationState) {
  return verificationLabels[state];
}

export function getProjectPostTypeLabel(type: ProjectPostType) {
  return projectPostLabels[type];
}
