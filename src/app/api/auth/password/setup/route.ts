import { type NextRequest } from "next/server";

import { buildPasswordSetupPath, buildSignInPath, ensureProfileForSupabaseUser, markProfilePasswordConfigured } from "@/lib/auth/session";
import { createRedirectResponse, parseOptionalString, parseRequiredString } from "@/lib/http";
import { createSupabaseRouteClient } from "@/lib/supabase/route";
import { ensureAbsoluteUrl } from "@/lib/utils/urls";

function validatePassword(password: string, confirmPassword: string) {
  if (password.length < 8) {
    return "비밀번호는 8자 이상이어야 합니다.";
  }

  if (password !== confirmPassword) {
    return "비밀번호 확인이 일치하지 않습니다.";
  }

  return null;
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const password = parseRequiredString(formData.get("password"));
  const confirmPassword = parseRequiredString(formData.get("confirmPassword"));
  const mode = parseOptionalString(formData.get("mode")) === "recovery" ? "recovery" : "setup";
  const next = ensureAbsoluteUrl(parseOptionalString(formData.get("next")) ?? "/me/projects");

  const validationError = validatePassword(password, confirmPassword);
  if (validationError) {
    return createRedirectResponse(buildPasswordSetupPath(next, { mode, error: validationError }));
  }

  try {
    const { supabase, applySupabaseCookies } = createSupabaseRouteClient(request);
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return createRedirectResponse(buildSignInPath(next, "비밀번호 설정 링크를 다시 요청해 주세요."));
    }

    const { error } = await supabase.auth.updateUser({
      password
    });

    if (error) {
      throw new Error(error.message);
    }

    const profile = await ensureProfileForSupabaseUser(user);
    await markProfilePasswordConfigured(profile.id);

    return applySupabaseCookies(
      createRedirectResponse(next, {
        notice: mode === "recovery" ? "비밀번호를 변경했습니다." : "비밀번호를 설정했습니다. 다음부터는 이메일과 비밀번호로 로그인할 수 있습니다."
      })
    );
  } catch (error) {
    return createRedirectResponse(
      buildPasswordSetupPath(next, {
        mode,
        error: error instanceof Error ? error.message : "비밀번호 저장에 실패했습니다."
      })
    );
  }
}
