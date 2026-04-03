import { and, desc, eq, gt, inArray, isNull, lte } from "drizzle-orm";

import { db } from "@/db";
import {
  comments,
  linkHealthChecks,
  magicLinks,
  projectClickEvents,
  projectOwners,
  projectRankSnapshots,
  projects,
  projectSaves
} from "@/db/schema";
import { calculateTrendingScoreV1, rankingClickSources } from "@/lib/utils/ranking";

const SEVEN_DAYS_MS = 1000 * 60 * 60 * 24 * 7;
const THIRTY_DAYS_MS = 1000 * 60 * 60 * 24 * 30;
const LINK_CHECK_TIMEOUT_MS = 5000;

async function requestLink(url: string) {
  const headers = {
    "user-agent": "viber-link-check/1.0"
  };

  try {
    const headResponse = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: AbortSignal.timeout(LINK_CHECK_TIMEOUT_MS),
      headers
    });

    if (headResponse.status === 405 || headResponse.status === 501) {
      return fetch(url, {
        method: "GET",
        redirect: "follow",
        signal: AbortSignal.timeout(LINK_CHECK_TIMEOUT_MS),
        headers
      });
    }

    return headResponse;
  } catch {
    return fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: AbortSignal.timeout(LINK_CHECK_TIMEOUT_MS),
      headers
    });
  }
}

export async function recomputeProjectRankSnapshots() {
  const now = new Date();
  const clickCutoff = new Date(now.getTime() - SEVEN_DAYS_MS);
  const saveCutoff = new Date(now.getTime() - THIRTY_DAYS_MS);
  const commentCutoff = new Date(now.getTime() - THIRTY_DAYS_MS);

  const publishedProjects = await db.query.projects.findMany({
    where: eq(projects.status, "published"),
    with: {
      clickEvents: {
        where: and(inArray(projectClickEvents.source, [...rankingClickSources]), gt(projectClickEvents.createdAt, clickCutoff))
      },
      saves: {
        where: gt(projectSaves.createdAt, saveCutoff)
      },
      comments: {
        where: and(eq(comments.status, "active"), gt(comments.createdAt, commentCutoff))
      },
      linkHealthChecks: {
        orderBy: [desc(linkHealthChecks.checkedAt)],
        limit: 1
      }
    }
  });

  const scoredProjects = publishedProjects
    .filter((project) => project.liveUrl)
    .filter((project) => project.linkHealthChecks[0]?.status !== "broken")
    .map((project) => {
      const uniqueTryClicks7d = new Set(project.clickEvents.map((event) => event.sessionHash)).size;
      const newSaves30d = project.saves.length;
      const uniqueCommenterCount = new Set(
        project.comments.map((comment) => comment.userId ?? comment.guestSessionHash).filter((value): value is string => Boolean(value))
      ).size;
      const commentSignal30d = Math.min(project.comments.length, uniqueCommenterCount * 2);
      const ranking = calculateTrendingScoreV1({
        uniqueTryClicks7d,
        newSaves30d,
        commentSignal30d,
        lastActivityAt: project.lastActivityAt ?? project.updatedAt
      });

      return {
        projectId: project.id,
        lastActivityAt: project.lastActivityAt ?? project.updatedAt,
        publishedAt: project.publishedAt,
        finalScore: ranking.finalScore,
        uniqueTryClicks7d,
        newSaves30d,
        commentSignal30d,
        freshnessMultiplier: ranking.freshnessMultiplierBasisPoints,
        qualityMultiplier: ranking.qualityMultiplierBasisPoints
      };
    })
    .sort((left, right) => {
      if (right.finalScore !== left.finalScore) {
        return right.finalScore - left.finalScore;
      }

      const activityDelta = right.lastActivityAt.getTime() - left.lastActivityAt.getTime();
      if (activityDelta !== 0) {
        return activityDelta;
      }

      return (right.publishedAt?.getTime() ?? 0) - (left.publishedAt?.getTime() ?? 0);
    });

  if (!scoredProjects.length) {
    return {
      inserted: 0
    };
  }

  await db.insert(projectRankSnapshots).values(
    scoredProjects.map((project, index) => ({
      projectId: project.projectId,
      finalScore: project.finalScore,
      uniqueTryClicks7d: project.uniqueTryClicks7d,
      newSaves30d: project.newSaves30d,
      commentSignal30d: project.commentSignal30d,
      freshnessMultiplier: project.freshnessMultiplier,
      qualityMultiplier: project.qualityMultiplier,
      rankPosition: index + 1,
      computedAt: now
    }))
  );

  return {
    inserted: scoredProjects.length
  };
}

export async function cleanupExpiredPendingProjects() {
  const expiredOwners = await db.query.projectOwners.findMany({
    where: and(lte(projectOwners.claimTokenExpiresAt, new Date()), isNull(projectOwners.userId)),
    columns: {
      projectId: true,
      claimTokenHash: true
    },
    with: {
      project: {
        columns: {
          id: true,
          status: true
        }
      }
    }
  });

  const expiredProjectIds = expiredOwners.filter((owner) => owner.project.status === "pending").map((owner) => owner.projectId);
  const expiredTokenHashes = expiredOwners.map((owner) => owner.claimTokenHash).filter((value): value is string => Boolean(value));

  if (!expiredProjectIds.length) {
    return {
      deletedProjects: 0
    };
  }

  await db.transaction(async (tx) => {
    if (expiredTokenHashes.length) {
      await tx.delete(magicLinks).where(inArray(magicLinks.tokenHash, expiredTokenHashes));
    }

    await tx.delete(projects).where(inArray(projects.id, expiredProjectIds));
  });

  return {
    deletedProjects: expiredProjectIds.length
  };
}

export async function runLinkHealthChecks(options?: {
  limit?: number;
}) {
  const rows = await db.query.projects.findMany({
    where: inArray(projects.status, ["published", "limited", "archived"]),
    orderBy: [desc(projects.updatedAt)],
    limit: options?.limit ?? 50,
    columns: {
      id: true,
      liveUrl: true
    },
    with: {
      linkHealthChecks: {
        orderBy: [desc(linkHealthChecks.checkedAt)],
        limit: 1
      }
    }
  });

  let checked = 0;
  let healthy = 0;
  let degraded = 0;
  let broken = 0;

  for (const row of rows) {
    if (!row.liveUrl) {
      continue;
    }

    checked += 1;

    try {
      const response = await requestLink(row.liveUrl);
      const isHealthy = response.status >= 200 && response.status < 400;

      if (isHealthy) {
        healthy += 1;
        await db.insert(linkHealthChecks).values({
          projectId: row.id,
          status: "healthy",
          httpStatus: response.status,
          failureCount: 0,
          note: "최근 링크 점검에서 정상 응답을 확인했습니다."
        });
        continue;
      }

      const previousFailureCount = row.linkHealthChecks[0]?.failureCount ?? 0;
      const failureCount = previousFailureCount + 1;
      const nextStatus = failureCount >= 3 ? "broken" : "degraded";

      if (nextStatus === "broken") {
        broken += 1;
      } else {
        degraded += 1;
      }

      await db.insert(linkHealthChecks).values({
        projectId: row.id,
        status: nextStatus,
        httpStatus: response.status,
        failureCount,
        note:
          nextStatus === "broken"
            ? "링크 점검이 3회 이상 연속 실패해 운영 검토가 필요합니다."
            : "최근 링크 점검이 실패했습니다. 재시도 전까지 경고 상태로 유지됩니다."
      });
    } catch (error) {
      const previousFailureCount = row.linkHealthChecks[0]?.failureCount ?? 0;
      const failureCount = previousFailureCount + 1;
      const nextStatus = failureCount >= 3 ? "broken" : "degraded";

      if (nextStatus === "broken") {
        broken += 1;
      } else {
        degraded += 1;
      }

      await db.insert(linkHealthChecks).values({
        projectId: row.id,
        status: nextStatus,
        httpStatus: null,
        failureCount,
        note:
          error instanceof Error
            ? error.message
            : "링크 점검 중 알 수 없는 오류가 발생했습니다."
      });
    }
  }

  return {
    checked,
    healthy,
    degraded,
    broken
  };
}
