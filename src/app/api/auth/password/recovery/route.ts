import { type NextRequest } from "next/server";

import { getSupabaseLoginState } from "@/lib/auth/session";
import { buildRequestUrl, createRedirectResponse, parseOptionalString, parseRequiredString } from "@/lib/http";
import { createPublicSupabaseClient } from "@/lib/supabase/shared";
import { ensureAbsoluteUrl } from "@/lib/utils/urls";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const email = parseRequiredString(formData.get("email")).toLowerCase();
  const next = ensureAbsoluteUrl(parseOptionalString(formData.get("next")) ?? "/me/projects");

  try {
    const state = await getSupabaseLoginState();

    if (!state.configured) {
      throw new Error("Supabase Auth가 아직 설정되지 않았습니다.");
    }

    if (!email) {
      throw new Error("이메일을 입력해 주세요.");
    }

    const supabase = createPublicSupabaseClient();
    const redirectTo = buildRequestUrl(request, "/auth/callback", {
      flow: "recovery",
      next
    });

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectTo.toString()
    });

    if (error) {
      throw new Error(error.message);
    }

    return createRedirectResponse("/auth/sign-in", {
      notice: "비밀번호 재설정 링크를 보냈습니다. 받은 편지함을 확인해 주세요.",
      next
    });
  } catch (error) {
    return createRedirectResponse("/auth/sign-in", {
      error: error instanceof Error ? error.message : "비밀번호 재설정 링크 발송에 실패했습니다.",
      next
    });
  }
}
