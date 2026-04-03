import { createClient } from "@supabase/supabase-js";

import { env } from "@/lib/env";

export function isSupabaseConfigured() {
  return Boolean(env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function getSupabaseUrl() {
  if (!env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error("Supabase URL이 설정되지 않았습니다.");
  }

  return env.NEXT_PUBLIC_SUPABASE_URL;
}

export function getSupabasePublishableKey() {
  if (!env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error("Supabase publishable key가 설정되지 않았습니다.");
  }

  return env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

export function shouldUseSecureCookies() {
  return env.NEXT_PUBLIC_APP_URL.startsWith("https://");
}

export function createPublicSupabaseClient() {
  return createClient(getSupabaseUrl(), getSupabasePublishableKey(), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  });
}
