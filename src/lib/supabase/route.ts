import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { getSupabasePublishableKey, getSupabaseUrl, shouldUseSecureCookies } from "@/lib/supabase/shared";

export function createSupabaseRouteClient(request: NextRequest) {
  let cookieResponse = NextResponse.next({
    request
  });

  const supabase = createServerClient(getSupabaseUrl(), getSupabasePublishableKey(), {
    cookieOptions: {
      secure: shouldUseSecureCookies()
    },
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const cookie of cookiesToSet) {
          request.cookies.set(cookie.name, cookie.value);
        }

        cookieResponse = NextResponse.next({
          request
        });

        for (const cookie of cookiesToSet) {
          cookieResponse.cookies.set(cookie.name, cookie.value, cookie.options);
        }
      }
    }
  });

  function applySupabaseCookies<T extends NextResponse>(response: T) {
    for (const cookie of cookieResponse.cookies.getAll()) {
      const { name, value, ...options } = cookie;
      response.cookies.set(name, value, options);
    }

    return response;
  }

  return {
    supabase,
    applySupabaseCookies
  };
}
