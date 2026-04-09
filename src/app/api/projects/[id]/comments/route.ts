import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { db } from "@/db";
import { profiles } from "@/db/schema";
import { getCurrentProfile } from "@/lib/auth/session";
import { getVisitorSessionHash } from "@/lib/auth/visitor";
import { buildRedirectPath, parseOptionalString, parseRequiredString } from "@/lib/http";
import { createComment } from "@/lib/services/mutations";
import { commentActionSchema } from "@/lib/validations/forms";

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function getOrCreateGuestProfile(guestName: string) {
  const safeName = guestName.trim().slice(0, 30) || "익명";
  const guestEmail = `guest_${safeName.toLowerCase().replace(/[^a-z0-9가-힣]/g, "_")}@guest.vibeollio.com`;

  const existing = await db.select().from(profiles).where(eq(profiles.email, guestEmail)).limit(1);
  if (existing[0]) return existing[0];

  const [created] = await db
    .insert(profiles)
    .values({ email: guestEmail, displayName: safeName, role: "member" })
    .returning();
  return created;
}

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const formData = await request.formData();

  try {
    const parsed = commentActionSchema.parse({
      bodyMd: parseRequiredString(formData.get("bodyMd")),
      postId: parseOptionalString(formData.get("postId")) ?? "",
      parentId: parseOptionalString(formData.get("parentId")) ?? "",
      redirectTo: parseRequiredString(formData.get("redirectTo"))
    });

    let viewer = await getCurrentProfile();
    const guestName = parseOptionalString(formData.get("guestName"));

    // 비로그인 사용자: 게스트 프로필 생성
    if (!viewer && guestName) {
      viewer = await getOrCreateGuestProfile(guestName);
    }

    if (!viewer) {
      return NextResponse.redirect(
        new URL(buildRedirectPath(parsed.redirectTo, { error: "닉네임을 입력해주세요." }), request.url),
        { status: 303 }
      );
    }

    const rateLimitIdentifier = await getVisitorSessionHash(viewer.id);
    const result = await createComment({
      projectId: id,
      user: viewer,
      bodyMd: parsed.bodyMd,
      postId: parsed.postId || null,
      parentId: parsed.parentId || null,
      rateLimitIdentifier
    });

    revalidatePath(`/p/${result.slug}`);

    return NextResponse.redirect(new URL(buildRedirectPath(parsed.redirectTo, { notice: "댓글을 등록했습니다." }), request.url), { status: 303 });
  } catch (error) {
    return NextResponse.redirect(
      new URL(
        buildRedirectPath("/projects", {
          error: error instanceof Error ? error.message : "댓글 등록에 실패했습니다."
        }),
        request.url
      ),
      { status: 303 }
    );
  }
}
