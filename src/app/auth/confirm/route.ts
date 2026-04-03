import { type NextRequest } from "next/server";

import { buildPostVerificationPath, ensureProfileForSupabaseUser } from "@/lib/auth/session";
import { createRedirectResponse } from "@/lib/http";
import { createSupabaseRouteClient } from "@/lib/supabase/route";
import { isSupabaseConfigured } from "@/lib/supabase/shared";
import { ensureAbsoluteUrl } from "@/lib/utils/urls";

type VerifyType = "signup" | "invite" | "magiclink" | "recovery" | "email_change";
type AuthFlow = "setup" | "recovery" | "login";

function normalizeVerifyType(value: string | null): VerifyType | null {
  if (value === "signup" || value === "invite" || value === "magiclink" || value === "recovery" || value === "email_change") {
    return value;
  }

  return null;
}

function normalizeFlow(value: string | null): AuthFlow {
  if (value === "setup" || value === "recovery") {
    return value;
  }

  return "login";
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const nextPath = ensureAbsoluteUrl(requestUrl.searchParams.get("next") ?? "/me/projects");
  const flow = normalizeFlow(requestUrl.searchParams.get("flow"));
  const code = requestUrl.searchParams.get("code");
  const tokenHash = requestUrl.searchParams.get("token_hash") ?? requestUrl.searchParams.get("token");
  const verifyType = normalizeVerifyType(requestUrl.searchParams.get("type"));

  if (!isSupabaseConfigured()) {
    return createRedirectResponse("/auth/sign-in", { error: "Supabase Auth가 아직 설정되지 않았습니다." });
  }

  if (!code && (!tokenHash || !verifyType)) {
    return createRedirectResponse("/auth/sign-in", { error: "유효한 이메일 인증 토큰이 없습니다.", next: nextPath });
  }

  const { supabase, applySupabaseCookies } = createSupabaseRouteClient(request);
  const { error } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : await supabase.auth.verifyOtp({
        token_hash: tokenHash!,
        type: verifyType!
      });

  if (error) {
    return createRedirectResponse("/auth/sign-in", { error: error.message, next: nextPath });
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return createRedirectResponse("/auth/sign-in", { error: "로그인 세션을 확인하지 못했습니다.", next: nextPath });
  }

  const profile = await ensureProfileForSupabaseUser(user);
  const destination = buildPostVerificationPath(nextPath, {
    flow,
    passwordSetAt: profile.passwordSetAt
  });

  return applySupabaseCookies(createRedirectResponse(destination));
}
