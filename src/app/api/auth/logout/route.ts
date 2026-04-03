import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { createRedirectResponse } from "@/lib/http";
import { LEGACY_SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { getSupabasePublishableKey, getSupabaseUrl, isSupabaseConfigured } from "@/lib/supabase/shared";

export async function POST(request: NextRequest) {
  const cookieResponse = NextResponse.next();

  if (isSupabaseConfigured()) {
    const supabase = createServerClient(getSupabaseUrl(), getSupabasePublishableKey(), {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const cookie of cookiesToSet) {
            cookieResponse.cookies.set(cookie.name, cookie.value, cookie.options);
          }
        }
      }
    });

    await supabase.auth.signOut();
  }

  const response = createRedirectResponse("/", { notice: "로그아웃했습니다." });

  for (const cookie of cookieResponse.cookies.getAll()) {
    response.cookies.set(cookie.name, cookie.value, cookie);
  }

  response.cookies.delete(LEGACY_SESSION_COOKIE_NAME);
  return response;
}
