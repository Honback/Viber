import { type NextRequest } from "next/server";

import { createRedirectResponse, parseOptionalString, parseRequiredString } from "@/lib/http";
import { ensureAbsoluteUrl } from "@/lib/utils/urls";
import { ensureProfileForSupabaseUser, getSupabaseLoginState, markProfilePasswordConfigured } from "@/lib/auth/session";
import { createSupabaseRouteClient } from "@/lib/supabase/route";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const email = parseRequiredString(formData.get("email")).toLowerCase();
  const password = parseRequiredString(formData.get("password"));
  const next = ensureAbsoluteUrl(parseOptionalString(formData.get("next")) ?? "/me/projects");

  try {
    const state = await getSupabaseLoginState();

    if (!state.configured) {
      throw new Error("Supabase Auth가 아직 설정되지 않았습니다.");
    }

    if (!email || !password) {
      throw new Error("이메일과 비밀번호를 모두 입력해 주세요.");
    }

    const { supabase, applySupabaseCookies } = createSupabaseRouteClient(request);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error || !data.user) {
      throw new Error(error?.message ?? "이메일 또는 비밀번호가 올바르지 않습니다.");
    }

    const profile = await ensureProfileForSupabaseUser(data.user);

    if (!profile.passwordSetAt) {
      await markProfilePasswordConfigured(profile.id);
      return applySupabaseCookies(createRedirectResponse(next, { notice: "비밀번호 계정 상태를 확인하고 로그인했습니다." }));
    }

    return applySupabaseCookies(createRedirectResponse(next, { notice: "로그인했습니다." }));
  } catch (error) {
    return createRedirectResponse("/auth/sign-in", {
      error: error instanceof Error ? error.message : "로그인에 실패했습니다.",
      next
    });
  }
}
