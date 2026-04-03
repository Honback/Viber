import { eq } from "drizzle-orm";

import { db } from "@/db";
import { magicLinks, projectOwners, type ProjectPostStatus, type ProjectStatus } from "@/db/schema";
import { sendAppEmail } from "@/lib/email/service";
import { renderEmailTemplate } from "@/lib/email/templates";
import { env } from "@/lib/env";
import { projectStatusLabels } from "@/lib/constants";
import { buildAbsoluteAppUrl } from "@/lib/utils/urls";

type ProjectRecipient = {
  email: string;
  label: string;
};

async function getPendingOwnerEmail(claimTokenHash: string | null) {
  if (!claimTokenHash) {
    return null;
  }

  const row = await db.query.magicLinks.findFirst({
    where: eq(magicLinks.tokenHash, claimTokenHash),
    columns: {
      email: true
    }
  });

  return row?.email?.toLowerCase() ?? null;
}

export async function getProjectNotificationRecipients(projectId: string) {
  const owners = await db.query.projectOwners.findMany({
    where: eq(projectOwners.projectId, projectId),
    columns: {
      claimTokenHash: true
    },
    with: {
      user: {
        columns: {
          email: true,
          displayName: true
        }
      }
    }
  });

  const recipients = new Map<string, ProjectRecipient>();

  for (const owner of owners) {
    if (owner.user?.email) {
      recipients.set(owner.user.email.toLowerCase(), {
        email: owner.user.email.toLowerCase(),
        label: owner.user.displayName
      });
      continue;
    }

    const pendingEmail = await getPendingOwnerEmail(owner.claimTokenHash);

    if (pendingEmail) {
      recipients.set(pendingEmail, {
        email: pendingEmail,
        label: pendingEmail.split("@")[0] ?? "maker"
      });
    }
  }

  return [...recipients.values()];
}

function buildProjectUrl(slug: string, hash = "") {
  const suffix = hash ? `${hash.startsWith("#") ? hash : `#${hash}`}` : "";
  return buildAbsoluteAppUrl(env.NEXT_PUBLIC_APP_URL, `/p/${slug}${suffix}`);
}

function buildClaimUrl(rawToken: string) {
  return buildAbsoluteAppUrl(env.NEXT_PUBLIC_APP_URL, `/claim/${rawToken}`);
}

export async function sendProjectClaimLinkEmail(input: {
  recipient: string;
  rawToken: string;
  projectTitle: string;
  slug: string;
}) {
  const claimUrl = buildClaimUrl(input.rawToken);
  const rendered = renderEmailTemplate({
    title: "프로젝트 수정권 연결",
    intro: `${input.projectTitle} 제출이 저장되었습니다. 아래 버튼으로 이 프로젝트의 소유권을 현재 계정에 연결해 주세요.`,
    body: [
      "이 링크를 열면 나중에 프로젝트 설명 수정, 업데이트 작성, 공개 상태 확인을 이어갈 수 있습니다.",
      "링크가 만료되면 같은 이메일로 다시 제출해 새 claim 메일을 받을 수 있습니다."
    ],
    ctaLabel: "소유권 연결하기",
    ctaUrl: claimUrl,
    footer: [input.projectTitle, buildProjectUrl(input.slug)]
  });

  return sendAppEmail({
    template: "project-claim",
    recipient: input.recipient,
    subject: `[바이브 쇼케이스] ${input.projectTitle} 수정권 연결`,
    html: rendered.html,
    text: rendered.text,
    metadata: {
      projectTitle: input.projectTitle,
      projectSlug: input.slug,
      actionUrl: claimUrl
    }
  });
}

export async function sendProjectCommentNotifications(input: {
  projectId: string;
  projectSlug: string;
  projectTitle: string;
  actorName: string;
  actorEmail?: string | null;
  commentBody: string;
  postTitle?: string | null;
}) {
  const recipients = await getProjectNotificationRecipients(input.projectId);
  const filteredRecipients = recipients.filter((recipient) => recipient.email !== input.actorEmail?.toLowerCase());

  if (!filteredRecipients.length) {
    return [];
  }

  const projectUrl = buildProjectUrl(input.projectSlug, "comments");
  const excerpt = input.commentBody.length > 180 ? `${input.commentBody.slice(0, 180)}...` : input.commentBody;

  return Promise.all(
    filteredRecipients.map((recipient) => {
      const rendered = renderEmailTemplate({
        title: "새 댓글이 달렸습니다",
        intro: `${input.projectTitle} 에 새로운 피드백이 도착했습니다.`,
        body: [
          `${input.actorName} 님이 남긴 메시지입니다.`,
          excerpt,
          input.postTitle ? `연결된 활동: ${input.postTitle}` : "프로젝트 전체 댓글에 등록된 반응입니다."
        ],
        ctaLabel: "댓글 확인하기",
        ctaUrl: projectUrl,
        footer: [recipient.label]
      });

      return sendAppEmail({
        template: "project-comment",
        recipient: recipient.email,
        subject: `[바이브 쇼케이스] ${input.projectTitle} 에 새 댓글이 달렸습니다`,
        html: rendered.html,
        text: rendered.text,
        metadata: {
          projectId: input.projectId,
          projectSlug: input.projectSlug,
          projectTitle: input.projectTitle,
          actionUrl: projectUrl,
          actorName: input.actorName
        }
      });
    })
  );
}

function buildModerationSummary(input: {
  projectTitle: string;
  statusLabel: string;
  reason?: string | null;
  contextTitle?: string | null;
}) {
  return [
    `${input.projectTitle} 의 운영 상태가 ${input.statusLabel} 로 변경되었습니다.`,
    input.contextTitle ? `대상 항목: ${input.contextTitle}` : "",
    input.reason ? `운영 메모: ${input.reason}` : "운영 메모는 비어 있습니다."
  ].filter(Boolean);
}

const moderationStateLabels: Record<string, string> = {
  published: "공개",
  limited: "제한 공개",
  hidden: "비공개",
  rejected: "반려",
  archived: "보관",
  pending: "공개 전",
  reviewing: "검토 중",
  resolved: "해결"
};

export async function sendProjectModerationNotifications(input: {
  projectId: string;
  projectSlug: string;
  projectTitle: string;
  nextStatus: ProjectStatus | ProjectPostStatus;
  reason?: string | null;
  contextTitle?: string | null;
  contextType?: "project" | "post";
}) {
  const recipients = await getProjectNotificationRecipients(input.projectId);

  if (!recipients.length) {
    return [];
  }

  const isProjectStatus = Object.prototype.hasOwnProperty.call(projectStatusLabels, input.nextStatus);
  const statusLabel = isProjectStatus
    ? projectStatusLabels[input.nextStatus as ProjectStatus]
    : moderationStateLabels[input.nextStatus] ?? input.nextStatus;
  const projectUrl = buildProjectUrl(input.projectSlug);

  return Promise.all(
    recipients.map((recipient) => {
      const rendered = renderEmailTemplate({
        title: "운영 상태가 변경되었습니다",
        intro: `${input.projectTitle} 에 대해 운영 조치가 적용되었습니다.`,
        body: buildModerationSummary({
          projectTitle: input.projectTitle,
          statusLabel,
          reason: input.reason,
          contextTitle: input.contextTitle
        }),
        ctaLabel: "프로젝트 확인하기",
        ctaUrl: projectUrl,
        footer: [recipient.label]
      });

      return sendAppEmail({
        template: "moderation-status",
        recipient: recipient.email,
        subject: `[바이브 쇼케이스] ${input.projectTitle} 운영 상태 변경`,
        html: rendered.html,
        text: rendered.text,
        metadata: {
          projectId: input.projectId,
          projectSlug: input.projectSlug,
          projectTitle: input.projectTitle,
          actionUrl: projectUrl,
          nextStatus: input.nextStatus,
          reason: input.reason ?? null,
          contextTitle: input.contextTitle ?? null
        }
      });
    })
  );
}
