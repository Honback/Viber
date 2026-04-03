import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { requireAdminProfile } from "@/lib/auth/session";
import { createRedirectResponse, parseOptionalString } from "@/lib/http";
import { moderateProjectStatus } from "@/lib/services/mutations";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const admin = await requireAdminProfile();
  const { id } = await context.params;

  try {
    await moderateProjectStatus({
      projectId: id,
      nextStatus: "archived",
      reason: "admin archive endpoint",
      admin
    });

    revalidatePath("/");
    revalidatePath("/projects");
    revalidatePath("/admin/projects");
    revalidatePath("/admin/moderation");

    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      return NextResponse.json({ ok: true });
    }

    const formData = await request.formData();
    const redirectTo = parseOptionalString(formData.get("redirectTo")) ?? "/admin/projects";

    return createRedirectResponse(redirectTo, {
      notice: "프로젝트를 보관 상태로 전환했습니다."
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "보관 처리에 실패했습니다."
      },
      {
        status: 400
      }
    );
  }
}
