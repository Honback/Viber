import { eq } from "drizzle-orm";
import { type NextRequest } from "next/server";

import { db } from "@/db";
import { profiles } from "@/db/schema";
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

    const existingProfile = await db.query.profiles.findFirst({
      where: eq(profiles.email, email)
    });

    if (existingProfile?.passwordSetAt) {
      throw new Error("이미 비밀번호가 설정된 계정입니다. 아래 로그인 폼을 이용하거나 비밀번호 재설정을 요청해 주세요.");
    }

    const supabase = createPublicSupabaseClient();
    const redirectTo = buildRequestUrl(request, "/auth/callback", {
      flow: "setup",
      next
    });

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: redirectTo.toString()
      }
    });

    if (error) {
      throw new Error(error.message);
    }

    return createRedirectResponse("/auth/sign-in", {
      notice: "이메일 확인 링크를 보냈습니다. 링크를 열어 비밀번호 설정을 이어가세요.",
      next
    });
  } catch (error) {
    return createRedirectResponse("/auth/sign-in", {
      error: error instanceof Error ? error.message : "이메일 확인 링크 발송에 실패했습니다.",
      next
    });
  }
}
