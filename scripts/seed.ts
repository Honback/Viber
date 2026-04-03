import { sql as drizzleSql } from "drizzle-orm";

import { db, sql } from "../src/db";
import { getDbScope } from "./db-target-utils";
import {
  comments,
  linkHealthChecks,
  moderationActions,
  profiles,
  projectClickEvents,
  projectOwners,
  projectPosts,
  projectRankSnapshots,
  projects,
  projectSaves,
  projectTags,
  reports,
  tags,
} from "../src/db/schema";
import { defaultTagCatalog } from "../src/lib/constants";
import { demoUserIds, seedProfiles, seedProjects } from "../src/lib/seed-data";

async function main() {
  const dbScope = getDbScope(process.env.DATABASE_URL);
  const allowRemoteSeed = process.env.ALLOW_REMOTE_SEED === "true";

  if (dbScope === "remote" && !allowRemoteSeed) {
    throw new Error(
      "원격 DB에 seed를 실행할 수 없습니다. 로컬 개발 DB에서만 실행하거나, 정말 필요한 경우 ALLOW_REMOTE_SEED=true 를 명시하세요.",
    );
  }

  await db.transaction(async (tx) => {
    await tx.execute(drizzleSql.raw(`
      TRUNCATE TABLE
        "view_impression_counters",
        "rate_limit_events",
        "project_rank_snapshots",
        "link_health_checks",
        "moderation_actions",
        "reports",
        "project_click_events",
        "project_saves",
        "comments",
        "project_tags",
        "project_posts",
        "project_owners",
        "projects",
        "tags",
        "sessions",
        "magic_links",
        "profiles"
      RESTART IDENTITY CASCADE
    `));

    await tx.insert(profiles).values(
      seedProfiles.map((profile) => ({
        id: profile.id,
        email: profile.email,
        displayName: profile.displayName,
        githubUsername: profile.githubUsername,
        role: profile.role
      }))
    );

    const tagCatalog = [
      ...defaultTagCatalog.map((tag, index) => ({
        id: `00000000-0000-4000-8000-0000000008${String(index + 1).padStart(2, "0")}`,
        slug: tag.slug,
        name: tag.name
      })),
      { id: "00000000-0000-4000-8000-000000000891", slug: "productivity", name: "Productivity" },
      { id: "00000000-0000-4000-8000-000000000892", slug: "creator", name: "Creator" },
      { id: "00000000-0000-4000-8000-000000000893", slug: "health", name: "Health" },
      { id: "00000000-0000-4000-8000-000000000894", slug: "education", name: "Education" }
    ];

    await tx.insert(tags).values(tagCatalog);

    for (const project of seedProjects) {
      await tx.insert(projects).values({
        id: project.id,
        slug: project.slug,
        title: project.title,
        tagline: project.tagline,
        shortDescription: project.shortDescription,
        overviewMd: project.overviewMd,
        problemMd: project.problemMd,
        targetUsersMd: project.targetUsersMd,
        whyMadeMd: project.whyMadeMd,
        stage: project.stage,
        category: project.category,
        platform: project.platform,
        pricingModel: project.pricingModel,
        pricingNote: project.pricingNote,
        liveUrl: project.liveUrl,
        liveUrlNormalized: project.liveUrl.toLowerCase(),
        githubUrl: project.githubUrl,
        githubUrlNormalized: project.githubUrl ? project.githubUrl.toLowerCase() : null,
        demoUrl: project.demoUrl,
        docsUrl: project.docsUrl,
        makerAlias: project.makerAlias,
        coverImageUrl: project.coverImageUrl,
        galleryJson: project.gallery,
        isOpenSource: project.isOpenSource,
        noSignupRequired: project.noSignupRequired,
        isSoloMaker: project.isSoloMaker,
        aiToolsJson: project.aiTools,
        verificationState: project.verificationState,
        status: project.status,
        featured: project.featured ?? false,
        featuredOrder: project.featuredOrder ?? null,
        publishedAt: project.status === "pending" ? null : project.publishedAt,
        lastActivityAt: project.lastActivityAt
      });

      await tx.insert(projectOwners).values({
        projectId: project.id,
        userId: project.ownerUserId ?? null,
        verificationMethod: project.ownerVerificationMethod,
        isPrimary: true,
        claimedAt: project.ownerUserId ? project.publishedAt : null
      });

      await tx.insert(projectPosts).values(
        project.posts.map((post) => ({
          id: post.id,
          projectId: project.id,
          authorUserId: post.authorUserId ?? project.ownerUserId ?? null,
          type: post.type,
          title: post.title,
          summary: post.summary,
          bodyMd: post.bodyMd,
          requestedFeedbackMd: post.requestedFeedbackMd ?? null,
          mediaJson: post.media,
          status: post.status,
          publishedAt: post.status === "published" ? post.publishedAt : null
        }))
      );

      if (project.comments.length) {
        await tx.insert(comments).values(
          project.comments.map((comment) => ({
            id: comment.id,
            projectId: project.id,
            postId: comment.postId ?? null,
            parentId: comment.parentId ?? null,
            userId: "userId" in comment ? comment.userId : null,
            guestName: "guestName" in comment ? comment.guestName : null,
            guestSessionHash: "guestSessionHash" in comment ? comment.guestSessionHash : null,
            bodyMd: comment.bodyMd,
            status: comment.status ?? "active",
            createdAt: comment.createdAt,
            updatedAt: comment.createdAt
          }))
        );
      }

      await tx.insert(linkHealthChecks).values({
        projectId: project.id,
        status: project.linkHealth.status,
        httpStatus: project.linkHealth.httpStatus ?? null,
        failureCount: project.linkHealth.failureCount ?? 0,
        note: project.linkHealth.note ?? null
      });
    }

    const tagRows = await tx.select().from(tags);

    for (const project of seedProjects) {
      const projectTagValues = project.tags
        .map((slug) => tagRows.find((tag) => tag.slug === slug))
        .filter((tag): tag is typeof tagRows[number] => Boolean(tag))
        .map((tag) => ({
          projectId: project.id,
          tagId: tag.id
        }));

      if (projectTagValues.length) {
        await tx.insert(projectTags).values(projectTagValues);
      }
    }

    await tx.insert(projectSaves).values([
      { userId: demoUserIds.adminId, projectId: seedProjects[0].id },
      { userId: demoUserIds.adminId, projectId: seedProjects[1].id },
      { userId: demoUserIds.memberId, projectId: seedProjects[2].id }
    ]);

    await tx.insert(projectClickEvents).values(
      seedProjects.slice(0, 6).flatMap((project, index) => [
        {
          projectId: project.id,
          source: "home_try",
          sessionHash: `seed-home-${index + 1}`
        },
        {
          projectId: project.id,
          source: "detail_try",
          sessionHash: `seed-detail-${index + 1}`
        }
      ])
    );

    await tx.insert(projectRankSnapshots).values(
      seedProjects.slice(0, 6).map((project, index) => ({
        projectId: project.id,
        finalScore: (60 - index * 4) * 100,
        uniqueTryClicks7d: 16 - index,
        newSaves30d: 4 + Math.max(0, 5 - index),
        commentSignal30d: index < 2 ? 2 : 1,
        freshnessMultiplier: 100,
        qualityMultiplier: 100,
        rankPosition: index + 1
      }))
    );

    await tx.insert(reports).values({
      id: "00000000-0000-4000-8000-000000000701",
      reporterUserId: demoUserIds.adminId,
      targetType: "project",
      targetId: seedProjects[3].id,
      reason: "broken-link",
      note: "체험 링크 응답이 불안정합니다.",
      status: "open"
    });

    await tx.insert(moderationActions).values({
      id: "00000000-0000-4000-8000-000000000751",
      adminUserId: demoUserIds.adminId,
      targetType: "project",
      targetId: seedProjects[5].id,
      action: "archive",
      reason: "장기간 미운영 프로젝트 정리",
      metadataJson: {}
    });
  });

  const profileCount = await db.$count(profiles);
  const projectCount = await db.$count(projects);

  console.log(`seed complete: profiles=${profileCount}, projects=${projectCount}`);
  await sql.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
