import {
  type AnyPgColumn,
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

export const roleValues = ["member", "admin"] as const;
export const stageValues = ["alpha", "beta", "live"] as const;
export const platformValues = ["web", "mobile", "desktop"] as const;
export const pricingValues = ["free", "freemium", "paid", "custom"] as const;
export const verificationValues = ["unverified", "github_verified", "domain_verified"] as const;
export const projectStatusValues = ["pending", "published", "limited", "hidden", "rejected", "archived"] as const;
export const postTypeValues = ["launch", "update", "feedback"] as const;
export const postStatusValues = ["pending", "published", "hidden", "rejected"] as const;
export const commentStatusValues = ["active", "hidden", "deleted"] as const;
export const ownerVerificationValues = ["email", "github"] as const;
export const reportTargetValues = ["project", "post", "comment"] as const;
export const reportStatusValues = ["open", "reviewing", "resolved", "rejected"] as const;
export const linkHealthStatusValues = ["unknown", "healthy", "degraded", "broken"] as const;
export const emailDeliveryStatusValues = ["queued", "sent", "failed", "simulated"] as const;
export const domainVerificationStatusValues = ["pending", "verified", "failed", "revoked"] as const;

const roleCheck = sql.raw(`role in ('${roleValues.join("','")}')`);
const stageCheck = sql.raw(`stage in ('${stageValues.join("','")}')`);
const platformCheck = sql.raw(`platform in ('${platformValues.join("','")}')`);
const pricingCheck = sql.raw(`pricing_model in ('${pricingValues.join("','")}')`);
const verificationCheck = sql.raw(`verification_state in ('${verificationValues.join("','")}')`);
const projectStatusCheck = sql.raw(`status in ('${projectStatusValues.join("','")}')`);
const ownerVerificationCheck = sql.raw(`verification_method in ('${ownerVerificationValues.join("','")}')`);
const postTypeCheck = sql.raw(`type in ('${postTypeValues.join("','")}')`);
const postStatusCheck = sql.raw(`status in ('${postStatusValues.join("','")}')`);
const commentStatusCheck = sql.raw(`status in ('${commentStatusValues.join("','")}')`);
const commentAuthorIdentityCheck = sql.raw(
  "(user_id is not null and guest_name is null and guest_session_hash is null) or (user_id is null and guest_name is not null and guest_session_hash is not null)"
);
const reportTargetCheck = sql.raw(`target_type in ('${reportTargetValues.join("','")}')`);
const reportStatusCheck = sql.raw(`status in ('${reportStatusValues.join("','")}')`);
const linkHealthStatusCheck = sql.raw(`status in ('${linkHealthStatusValues.join("','")}')`);
const emailDeliveryStatusCheck = sql.raw(`status in ('${emailDeliveryStatusValues.join("','")}')`);
const domainVerificationStatusCheck = sql.raw(`status in ('${domainVerificationStatusValues.join("','")}')`);

export const profiles = pgTable(
  "profiles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: text("email").notNull(),
    displayName: text("display_name").notNull(),
    avatarUrl: text("avatar_url"),
    githubUsername: text("github_username"),
    role: text("role").notNull().default("member"),
    emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),
    passwordSetAt: timestamp("password_set_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    uniqueIndex("profiles_email_idx").on(table.email),
    check("profiles_role_check", roleCheck)
  ]
);

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    tagline: text("tagline").notNull(),
    shortDescription: text("short_description").notNull(),
    overviewMd: text("overview_md").notNull(),
    problemMd: text("problem_md").notNull(),
    targetUsersMd: text("target_users_md").notNull(),
    whyMadeMd: text("why_made_md"),
    stage: text("stage").notNull(),
    category: text("category").notNull(),
    platform: text("platform").notNull(),
    pricingModel: text("pricing_model").notNull(),
    pricingNote: text("pricing_note"),
    liveUrl: text("live_url").notNull(),
    liveUrlNormalized: text("live_url_normalized").notNull(),
    githubUrl: text("github_url"),
    githubUrlNormalized: text("github_url_normalized"),
    demoUrl: text("demo_url"),
    docsUrl: text("docs_url"),
    makerAlias: text("maker_alias").notNull(),
    coverImageUrl: text("cover_image_url").notNull(),
    galleryJson: jsonb("gallery_json").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
    isOpenSource: boolean("is_open_source").notNull().default(false),
    noSignupRequired: boolean("no_signup_required").notNull().default(false),
    isSoloMaker: boolean("is_solo_maker").notNull().default(false),
    aiToolsJson: jsonb("ai_tools_json").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
    verificationState: text("verification_state").notNull().default("unverified"),
    status: text("status").notNull().default("pending"),
    featured: boolean("featured").notNull().default(false),
    featuredOrder: integer("featured_order"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    lastActivityAt: timestamp("last_activity_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    uniqueIndex("projects_slug_idx").on(table.slug),
    uniqueIndex("projects_live_url_normalized_idx").on(table.liveUrlNormalized),
    uniqueIndex("projects_github_url_normalized_idx").on(table.githubUrlNormalized),
    index("projects_status_published_at_idx").on(table.status, table.publishedAt),
    index("projects_last_activity_idx").on(table.lastActivityAt),
    check("projects_stage_check", stageCheck),
    check("projects_platform_check", platformCheck),
    check("projects_pricing_check", pricingCheck),
    check("projects_verification_check", verificationCheck),
    check("projects_status_check", projectStatusCheck)
  ]
);

export const projectOwners = pgTable(
  "project_owners",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    userId: uuid("user_id").references(() => profiles.id, { onDelete: "set null" }),
    verificationMethod: text("verification_method").notNull(),
    emailHash: text("email_hash"),
    claimTokenHash: text("claim_token_hash"),
    claimTokenExpiresAt: timestamp("claim_token_expires_at", { withTimezone: true }),
    isPrimary: boolean("is_primary").notNull().default(false),
    claimedAt: timestamp("claimed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    unique("project_owners_project_user_unique").on(table.projectId, table.userId),
    index("project_owners_project_idx").on(table.projectId),
    check("project_owners_verification_check", ownerVerificationCheck)
  ]
);

export const projectPosts = pgTable(
  "project_posts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    authorUserId: uuid("author_user_id").references(() => profiles.id, { onDelete: "restrict" }),
    type: text("type").notNull(),
    title: text("title").notNull(),
    summary: text("summary").notNull(),
    bodyMd: text("body_md").notNull(),
    requestedFeedbackMd: text("requested_feedback_md"),
    mediaJson: jsonb("media_json").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
    status: text("status").notNull().default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    publishedAt: timestamp("published_at", { withTimezone: true })
  },
  (table) => [
    index("project_posts_project_published_idx").on(table.projectId, table.publishedAt),
    index("project_posts_author_created_idx").on(table.authorUserId, table.createdAt),
    check("project_posts_type_check", postTypeCheck),
    check("project_posts_status_check", postStatusCheck)
  ]
);

export const comments = pgTable(
  "comments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    postId: uuid("post_id").references(() => projectPosts.id, { onDelete: "cascade" }),
    parentId: uuid("parent_id").references((): AnyPgColumn => comments.id, { onDelete: "cascade" }),
    userId: uuid("user_id").references(() => profiles.id, { onDelete: "cascade" }),
    guestName: text("guest_name"),
    guestSessionHash: text("guest_session_hash"),
    bodyMd: text("body_md").notNull(),
    status: text("status").notNull().default("active"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    index("comments_project_created_idx").on(table.projectId, table.createdAt),
    index("comments_post_created_idx").on(table.postId, table.createdAt),
    index("comments_guest_session_created_idx").on(table.guestSessionHash, table.createdAt),
    check("comments_author_identity_check", commentAuthorIdentityCheck),
    check("comments_status_check", commentStatusCheck)
  ]
);

export const projectSaves = pgTable(
  "project_saves",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [primaryKey({ columns: [table.userId, table.projectId], name: "project_saves_pk" })]
);

export const projectClickEvents = pgTable(
  "project_click_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    source: text("source").notNull(),
    sessionHash: text("session_hash").notNull(),
    userId: uuid("user_id").references(() => profiles.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    index("project_click_events_project_created_idx").on(table.projectId, table.createdAt),
    index("project_click_events_project_session_idx").on(table.projectId, table.sessionHash)
  ]
);

export const tags = pgTable("tags", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull()
});

export const projectTags = pgTable(
  "project_tags",
  {
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [primaryKey({ columns: [table.projectId, table.tagId], name: "project_tags_pk" })]
);

export const reports = pgTable(
  "reports",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    reporterUserId: uuid("reporter_user_id").references(() => profiles.id, { onDelete: "set null" }),
    targetType: text("target_type").notNull(),
    targetId: uuid("target_id").notNull(),
    reason: text("reason").notNull(),
    note: text("note"),
    status: text("status").notNull().default("open"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    index("reports_target_idx").on(table.targetType, table.targetId),
    index("reports_status_idx").on(table.status, table.createdAt),
    check("reports_target_type_check", reportTargetCheck),
    check("reports_status_check", reportStatusCheck)
  ]
);

export const moderationActions = pgTable(
  "moderation_actions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    adminUserId: uuid("admin_user_id").references(() => profiles.id, { onDelete: "set null" }),
    targetType: text("target_type").notNull(),
    targetId: uuid("target_id").notNull(),
    action: text("action").notNull(),
    reason: text("reason"),
    metadataJson: jsonb("metadata_json").$type<Record<string, unknown>>().notNull().default(sql`'{}'::jsonb`),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [index("moderation_actions_target_idx").on(table.targetType, table.targetId)]
);

export const linkHealthChecks = pgTable(
  "link_health_checks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    status: text("status").notNull().default("unknown"),
    httpStatus: integer("http_status"),
    checkedAt: timestamp("checked_at", { withTimezone: true }).notNull().defaultNow(),
    failureCount: integer("failure_count").notNull().default(0),
    note: text("note")
  },
  (table) => [
    index("link_health_checks_project_checked_idx").on(table.projectId, table.checkedAt),
    check("link_health_checks_status_check", linkHealthStatusCheck)
  ]
);

export const projectRankSnapshots = pgTable(
  "project_rank_snapshots",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    finalScore: integer("final_score").notNull(),
    uniqueTryClicks7d: integer("unique_try_clicks_7d").notNull().default(0),
    newSaves30d: integer("new_saves_30d").notNull().default(0),
    commentSignal30d: integer("comment_signal_30d").notNull().default(0),
    freshnessMultiplier: integer("freshness_multiplier").notNull().default(100),
    qualityMultiplier: integer("quality_multiplier").notNull().default(100),
    rankPosition: integer("rank_position"),
    computedAt: timestamp("computed_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [index("project_rank_snapshots_project_computed_idx").on(table.projectId, table.computedAt)]
);

export const viewImpressionCounters = pgTable(
  "view_impression_counters",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    source: text("source").notNull(),
    sessionHash: text("session_hash").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    index("view_impression_counters_project_session_idx").on(table.projectId, table.sessionHash),
    index("view_impression_counters_project_source_created_idx").on(table.projectId, table.source, table.createdAt)
  ]
);

export const rateLimitEvents = pgTable(
  "rate_limit_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    bucket: text("bucket").notNull(),
    identifier: text("identifier").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    ttlSeconds: integer("ttl_seconds").notNull().default(60)
  },
  (table) => [index("rate_limit_events_bucket_identifier_idx").on(table.bucket, table.identifier, table.createdAt)]
);

export const magicLinks = pgTable(
  "magic_links",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: text("email").notNull(),
    tokenHash: text("token_hash").notNull(),
    purpose: text("purpose").notNull(),
    metadataJson: jsonb("metadata_json").$type<Record<string, unknown>>().notNull().default(sql`'{}'::jsonb`),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    consumedAt: timestamp("consumed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [index("magic_links_email_purpose_idx").on(table.email, table.purpose, table.createdAt)]
);

export const emailDeliveries = pgTable(
  "email_deliveries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    provider: text("provider").notNull().default("resend"),
    template: text("template").notNull(),
    status: text("status").notNull().default("queued"),
    recipient: text("recipient").notNull(),
    subject: text("subject").notNull(),
    fromEmail: text("from_email").notNull(),
    htmlBody: text("html_body").notNull(),
    textBody: text("text_body").notNull().default(""),
    metadataJson: jsonb("metadata_json").$type<Record<string, unknown>>().notNull().default(sql`'{}'::jsonb`),
    providerMessageId: text("provider_message_id"),
    error: text("error"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    sentAt: timestamp("sent_at", { withTimezone: true })
  },
  (table) => [
    index("email_deliveries_created_idx").on(table.createdAt),
    index("email_deliveries_recipient_idx").on(table.recipient, table.createdAt),
    index("email_deliveries_status_idx").on(table.status, table.createdAt),
    check("email_deliveries_status_check", emailDeliveryStatusCheck)
  ]
);

export const domainVerifications = pgTable(
  "domain_verifications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    registrableDomain: text("registrable_domain").notNull(),
    recordName: text("record_name").notNull(),
    token: text("token").notNull(),
    status: text("status").notNull().default("pending"),
    lastCheckedAt: timestamp("last_checked_at", { withTimezone: true }),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    lastError: text("last_error"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    uniqueIndex("domain_verifications_project_idx").on(table.projectId),
    index("domain_verifications_domain_status_idx").on(table.registrableDomain, table.status),
    check("domain_verifications_status_check", domainVerificationStatusCheck)
  ]
);

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [uniqueIndex("sessions_token_hash_idx").on(table.tokenHash)]
);

export const profilesRelations = relations(profiles, ({ many }) => ({
  projectOwners: many(projectOwners),
  projectPosts: many(projectPosts),
  comments: many(comments),
  saves: many(projectSaves),
  reports: many(reports),
  moderationActions: many(moderationActions),
  sessions: many(sessions)
}));

export const projectsRelations = relations(projects, ({ many }) => ({
  owners: many(projectOwners),
  posts: many(projectPosts),
  comments: many(comments),
  saves: many(projectSaves),
  clickEvents: many(projectClickEvents),
  tagLinks: many(projectTags),
  linkHealthChecks: many(linkHealthChecks),
  rankSnapshots: many(projectRankSnapshots),
  impressions: many(viewImpressionCounters),
  domainVerifications: many(domainVerifications)
}));

export const projectOwnersRelations = relations(projectOwners, ({ one }) => ({
  project: one(projects, {
    fields: [projectOwners.projectId],
    references: [projects.id]
  }),
  user: one(profiles, {
    fields: [projectOwners.userId],
    references: [profiles.id]
  })
}));

export const projectPostsRelations = relations(projectPosts, ({ one, many }) => ({
  project: one(projects, {
    fields: [projectPosts.projectId],
    references: [projects.id]
  }),
  author: one(profiles, {
    fields: [projectPosts.authorUserId],
    references: [profiles.id]
  }),
  comments: many(comments)
}));

export const commentsRelations = relations(comments, ({ one, many }) => ({
  project: one(projects, {
    fields: [comments.projectId],
    references: [projects.id]
  }),
  post: one(projectPosts, {
    fields: [comments.postId],
    references: [projectPosts.id]
  }),
  author: one(profiles, {
    fields: [comments.userId],
    references: [profiles.id]
  }),
  parent: one(comments, {
    fields: [comments.parentId],
    references: [comments.id],
    relationName: "comment_replies"
  }),
  replies: many(comments, {
    relationName: "comment_replies"
  })
}));

export const projectSavesRelations = relations(projectSaves, ({ one }) => ({
  project: one(projects, {
    fields: [projectSaves.projectId],
    references: [projects.id]
  }),
  user: one(profiles, {
    fields: [projectSaves.userId],
    references: [profiles.id]
  })
}));

export const projectClickEventsRelations = relations(projectClickEvents, ({ one }) => ({
  project: one(projects, {
    fields: [projectClickEvents.projectId],
    references: [projects.id]
  }),
  user: one(profiles, {
    fields: [projectClickEvents.userId],
    references: [profiles.id]
  })
}));

export const projectTagsRelations = relations(projectTags, ({ one }) => ({
  project: one(projects, {
    fields: [projectTags.projectId],
    references: [projects.id]
  }),
  tag: one(tags, {
    fields: [projectTags.tagId],
    references: [tags.id]
  })
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  projectLinks: many(projectTags)
}));

export const linkHealthChecksRelations = relations(linkHealthChecks, ({ one }) => ({
  project: one(projects, {
    fields: [linkHealthChecks.projectId],
    references: [projects.id]
  })
}));

export const projectRankSnapshotsRelations = relations(projectRankSnapshots, ({ one }) => ({
  project: one(projects, {
    fields: [projectRankSnapshots.projectId],
    references: [projects.id]
  })
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(profiles, {
    fields: [sessions.userId],
    references: [profiles.id]
  })
}));

export const domainVerificationsRelations = relations(domainVerifications, ({ one }) => ({
  project: one(projects, {
    fields: [domainVerifications.projectId],
    references: [projects.id]
  })
}));

export const reportsRelations = relations(reports, ({ one }) => ({
  reporter: one(profiles, {
    fields: [reports.reporterUserId],
    references: [profiles.id]
  })
}));

export const moderationActionsRelations = relations(moderationActions, ({ one }) => ({
  admin: one(profiles, {
    fields: [moderationActions.adminUserId],
    references: [profiles.id]
  })
}));

export type Role = (typeof roleValues)[number];
export type ProjectStage = (typeof stageValues)[number];
export type ProjectPlatform = (typeof platformValues)[number];
export type PricingModel = (typeof pricingValues)[number];
export type VerificationState = (typeof verificationValues)[number];
export type ProjectStatus = (typeof projectStatusValues)[number];
export type ProjectPostType = (typeof postTypeValues)[number];
export type ProjectPostStatus = (typeof postStatusValues)[number];
export type CommentStatus = (typeof commentStatusValues)[number];
export type ReportTargetType = (typeof reportTargetValues)[number];
export type ReportStatus = (typeof reportStatusValues)[number];
export type EmailDeliveryStatus = (typeof emailDeliveryStatusValues)[number];
export type DomainVerificationStatus = (typeof domainVerificationStatusValues)[number];
