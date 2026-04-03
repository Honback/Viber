import { z } from "zod";
import { analysisEventKinds, rankingClickSources } from "@/lib/utils/ranking";

export const saveActionSchema = z.object({
  redirectTo: z.string().optional().default("/")
});

export const clickActionSchema = z.object({
  source: z.string().trim().min(2).max(64),
  target: z.enum(["live", "github", "demo", "docs"]).default("live")
});

export const outboundClickSchema = z.object({
  source: z.enum(rankingClickSources)
});

export const projectEventSchema = z.object({
  kind: z.enum(analysisEventKinds),
  source: z.string().trim().min(2).max(64)
});

export const reportActionSchema = z.object({
  targetType: z.enum(["project", "post", "comment"]),
  targetId: z.string().uuid(),
  reason: z.string().trim().min(2).max(64),
  note: z.string().trim().max(500).optional().or(z.literal("")),
  turnstileToken: z.string().trim().optional().or(z.literal("")),
  redirectTo: z.string().optional().default("/")
});

export const commentActionSchema = z.object({
  postId: z.string().uuid().optional().or(z.literal("")),
  parentId: z.string().uuid().optional().or(z.literal("")),
  guestName: z.string().trim().min(2).max(40).optional().or(z.literal("")),
  turnstileToken: z.string().trim().optional().or(z.literal("")),
  bodyMd: z.string().trim().min(2).max(1000),
  redirectTo: z.string().optional().default("/")
});

export const commentUpdateSchema = z.object({
  bodyMd: z.string().trim().min(2).max(1000),
  redirectTo: z.string().optional().default("/")
});

export const moderationProjectSchema = z.object({
  targetType: z.enum(["project", "post", "report"]),
  targetId: z.string().uuid(),
  action: z.string().trim().min(2).max(64),
  reason: z.string().trim().max(500).optional().or(z.literal("")),
  redirectTo: z.string().optional().default("/admin/moderation"),
  featuredOrder: z.coerce.number().int().min(1).max(12).optional()
});

export const claimActionSchema = z.object({
  redirectTo: z.string().optional().default("/me/projects")
});

export const launchSubmissionSchema = z.object({
  kind: z.literal("launch"),
  title: z.string().trim().min(2).max(80),
  tagline: z.string().trim().min(10).max(120),
  shortDescription: z.string().trim().min(20).max(220),
  overviewMd: z.string().trim().min(20).max(3000),
  problemMd: z.string().trim().min(20).max(3000),
  targetUsersMd: z.string().trim().min(20).max(3000),
  whyMadeMd: z.string().trim().max(3000).optional().or(z.literal("")),
  stage: z.enum(["alpha", "beta", "live"]),
  category: z.string().trim().min(2).max(80),
  platform: z.enum(["web", "mobile", "desktop"]),
  pricingModel: z.enum(["free", "freemium", "paid", "custom"]),
  pricingNote: z.string().trim().max(120).optional().or(z.literal("")),
  liveUrl: z.string().url(),
  githubUrl: z.string().url().optional().or(z.literal("")),
  demoUrl: z.string().url().optional().or(z.literal("")),
  docsUrl: z.string().url().optional().or(z.literal("")),
  makerAlias: z.string().trim().min(2).max(80),
  coverImageUrl: z.string().trim().url().max(5000).optional().or(z.literal("")),
  galleryCsv: z.string().optional().default(""),
  aiToolsCsv: z.string().optional().default(""),
  tagCsv: z.string().optional().default(""),
  ownerEmail: z.string().email().optional().or(z.literal("")),
  verificationMethod: z.enum(["email", "github"]).default("email"),
  turnstileToken: z.string().trim().optional().or(z.literal("")),
  isOpenSource: z.boolean().optional().default(false),
  noSignupRequired: z.boolean().optional().default(false),
  isSoloMaker: z.boolean().optional().default(false)
});

export const postSubmissionSchema = z.object({
  kind: z.enum(["update", "feedback"]),
  projectId: z.string().uuid(),
  title: z.string().trim().min(2).max(120),
  summary: z.string().trim().min(10).max(240),
  bodyMd: z.string().trim().min(20).max(5000),
  requestedFeedbackMd: z.string().trim().max(5000).optional().or(z.literal("")),
  mediaCsv: z.string().optional().default(""),
  redirectTo: z.string().optional().default("/me/projects")
});

export const projectUpdateSchema = z.object({
  title: z.string().trim().min(2).max(80),
  tagline: z.string().trim().min(10).max(120),
  shortDescription: z.string().trim().min(20).max(220),
  overviewMd: z.string().trim().min(20).max(3000),
  problemMd: z.string().trim().min(20).max(3000),
  targetUsersMd: z.string().trim().min(20).max(3000),
  whyMadeMd: z.string().trim().max(3000).optional().or(z.literal("")),
  stage: z.enum(["alpha", "beta", "live"]),
  category: z.string().trim().min(2).max(80),
  platform: z.enum(["web", "mobile", "desktop"]),
  pricingModel: z.enum(["free", "freemium", "paid", "custom"]),
  pricingNote: z.string().trim().max(120).optional().or(z.literal("")),
  liveUrl: z.string().url(),
  githubUrl: z.string().url().optional().or(z.literal("")),
  demoUrl: z.string().url().optional().or(z.literal("")),
  docsUrl: z.string().url().optional().or(z.literal("")),
  makerAlias: z.string().trim().min(2).max(80),
  coverImageUrl: z.string().trim().url().max(5000).optional().or(z.literal("")),
  galleryCsv: z.string().optional().default(""),
  aiToolsCsv: z.string().optional().default(""),
  tagCsv: z.string().optional().default(""),
  isOpenSource: z.boolean().optional().default(false),
  noSignupRequired: z.boolean().optional().default(false),
  isSoloMaker: z.boolean().optional().default(false),
  redirectTo: z.string().optional().default("/me/projects")
});
