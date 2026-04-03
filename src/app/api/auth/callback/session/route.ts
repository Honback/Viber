import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { buildPostVerificationPath, ensureProfileForSupabaseUser } from "@/lib/auth/session";
import { createSupabaseAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { createSupabaseRouteClient } from "@/lib/supabase/route";
import { isSupabaseConfigured } from "@/lib/supabase/shared";
import { ensureAbsoluteUrl } from "@/lib/utils/urls";

const callbackPayloadSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
  next: z.string().optional(),
  flow: z.enum(["setup", "recovery", "login"]).optional()
});

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase Auth가 아직 설정되지 않았습니다." }, { status: 503 });
  }

  try {
    const payload = callbackPayloadSchema.parse(await request.json());
    const nextPath = ensureAbsoluteUrl(payload.next ?? "/me/projects");
    const flow = payload.flow ?? "login";
    const { supabase, applySupabaseCookies } = createSupabaseRouteClient(request);
    const { error } = await supabase.auth.setSession({
      access_token: payload.accessToken,
      refresh_token: payload.refreshToken
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    let userErrorMessage: string | null = null;
    let user = null;

    if (isSupabaseAdminConfigured()) {
      const adminSupabase = createSupabaseAdminClient();
      const {
        data: { user: adminUser },
        error: adminUserError
      } = await adminSupabase.auth.getUser(payload.accessToken);

      user = adminUser;
      userErrorMessage = adminUserError?.message ?? null;
    }

    if (!user) {
      const {
        data: { user: routeUser },
        error: routeUserError
      } = await supabase.auth.getUser(payload.accessToken);

      user = routeUser;
      userErrorMessage = routeUserError?.message ?? userErrorMessage;
    }

    if (userErrorMessage && !user) {
      return NextResponse.json({ error: userErrorMessage }, { status: 401 });
    }

    if (!user) {
      return NextResponse.json({ error: "로그인 세션을 확인하지 못했습니다." }, { status: 401 });
    }

    const profile = await ensureProfileForSupabaseUser(user);
    const response = NextResponse.json({
      destination: buildPostVerificationPath(nextPath, {
        flow,
        passwordSetAt: profile.passwordSetAt
      })
    });

    return applySupabaseCookies(response);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "인증 세션을 저장하지 못했습니다."
      },
      { status: 400 }
    );
  }
}
