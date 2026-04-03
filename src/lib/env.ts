import { z } from "zod";
import {
  CLOUDFLARE_TURNSTILE_TEST_SECRET_KEY,
  CLOUDFLARE_TURNSTILE_TEST_SITE_KEY,
  LOCAL_TURNSTILE_BYPASS_TOKEN
} from "@/lib/security/turnstile-constants";

const optionalNonEmptyString = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}, z.string().min(1).optional());

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_URL: optionalNonEmptyString.pipe(z.string().url().optional()),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: optionalNonEmptyString,
  SUPABASE_SERVICE_ROLE_KEY: optionalNonEmptyString,
  TURNSTILE_SITE_KEY: optionalNonEmptyString,
  TURNSTILE_SECRET_KEY: optionalNonEmptyString,
  RESEND_API_KEY: optionalNonEmptyString,
  MAIL_FROM: optionalNonEmptyString,
  MAIL_FROM_NAME: optionalNonEmptyString,
  MAIL_DELIVERY_MODE: z.string().optional().default(""),
  SUPABASE_STORAGE_BUCKET: z.string().optional().default(""),
  SUPABASE_STORAGE_MAX_FILE_BYTES: z.coerce.number().int().positive().optional().default(10 * 1024 * 1024),
  JOBS_RUNNER_TOKEN: z.string().optional().default(""),
  ADMIN_BOOTSTRAP_EMAILS: z.string().optional().default("")
});

const parsed = envSchema.safeParse({
  DATABASE_URL: process.env.DATABASE_URL,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  TURNSTILE_SITE_KEY: process.env.TURNSTILE_SITE_KEY,
  TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  MAIL_FROM: process.env.MAIL_FROM,
  MAIL_FROM_NAME: process.env.MAIL_FROM_NAME,
  MAIL_DELIVERY_MODE: process.env.MAIL_DELIVERY_MODE,
  SUPABASE_STORAGE_BUCKET: process.env.SUPABASE_STORAGE_BUCKET,
  SUPABASE_STORAGE_MAX_FILE_BYTES: process.env.SUPABASE_STORAGE_MAX_FILE_BYTES,
  JOBS_RUNNER_TOKEN: process.env.JOBS_RUNNER_TOKEN,
  ADMIN_BOOTSTRAP_EMAILS: process.env.ADMIN_BOOTSTRAP_EMAILS
});

if (!parsed.success) {
  throw new Error(`환경변수가 올바르지 않습니다: ${parsed.error.message}`);
}

export const env = parsed.data;

export const adminBootstrapEmails = env.ADMIN_BOOTSTRAP_EMAILS.split(",")
  .map((value) => value.trim().toLowerCase())
  .filter(Boolean);

function isLocalAppUrl(url: string) {
  try {
    const hostname = new URL(url).hostname;
    return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "0.0.0.0";
  } catch {
    return false;
  }
}

const shouldUseTurnstileTestKeys = !env.TURNSTILE_SITE_KEY && !env.TURNSTILE_SECRET_KEY && isLocalAppUrl(env.NEXT_PUBLIC_APP_URL);

export const turnstileSiteKey = env.TURNSTILE_SITE_KEY ?? (shouldUseTurnstileTestKeys ? CLOUDFLARE_TURNSTILE_TEST_SITE_KEY : null);
export const turnstileSecretKey = env.TURNSTILE_SECRET_KEY ?? (shouldUseTurnstileTestKeys ? CLOUDFLARE_TURNSTILE_TEST_SECRET_KEY : null);
export const isTurnstileConfigured = Boolean(turnstileSiteKey && turnstileSecretKey);
export const isTurnstileUsingTestKeys = shouldUseTurnstileTestKeys;
export const turnstileBypassToken = shouldUseTurnstileTestKeys ? LOCAL_TURNSTILE_BYPASS_TOKEN : null;
export const jobsRunnerToken = env.JOBS_RUNNER_TOKEN.trim() || null;
export const isLocalAppRuntime = isLocalAppUrl(env.NEXT_PUBLIC_APP_URL);
export const resendApiKey = env.RESEND_API_KEY ?? null;
export const mailFrom = env.MAIL_FROM ?? null;
export const mailFromName = env.MAIL_FROM_NAME?.trim() || "VibeHub";
export const mailDeliveryMode = env.MAIL_DELIVERY_MODE.trim() || (isLocalAppRuntime ? "simulate" : "live");
export const supabaseStorageBucket = env.SUPABASE_STORAGE_BUCKET.trim() || "project-media";
export const supabaseStorageMaxFileBytes = env.SUPABASE_STORAGE_MAX_FILE_BYTES;
