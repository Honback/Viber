import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { requireAdminProfile } from "@/lib/auth/session";
import { createRedirectResponse, parseOptionalString, parseRequiredString } from "@/lib/http";
import { setProjectFeature } from "@/lib/services/mutations";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function parseFeaturedOrder(value: FormDataEntryValue | null | undefined) {
  if (typeof value !== "string" || !value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function POST(request: Request, context: RouteContext) {
  const admin = await requireAdminProfile();
  const { id } = await context.params;

  try {
    const contentType = request.headers.get("content-type") ?? "";

    if (contentType.includes("application/json")) {
      const body = (await request.json()) as {
        featured?: boolean;
        order?: number | null;
      };

      await setProjectFeature({
        projectId: id,
        featured: Boolean(body.featured),
        order: body.order ?? null,
        admin
      });

      revalidatePath("/");
      revalidatePath("/admin/feature");
      revalidatePath("/admin/projects");

      return NextResponse.json({ ok: true });
    }

    const formData = await request.formData();
    const redirectTo = parseOptionalString(formData.get("redirectTo")) ?? "/admin/feature";
    const featured = parseRequiredString(formData.get("featured")) !== "false";
    const order = parseFeaturedOrder(formData.get("featuredOrder"));

    await setProjectFeature({
      projectId: id,
      featured,
      order,
      admin
    });

    revalidatePath("/");
    revalidatePath("/admin/feature");
    revalidatePath("/admin/projects");

    return createRedirectResponse(redirectTo, {
      notice: featured ? "피처드 지정이 반영되었습니다." : "피처드 지정이 해제되었습니다."
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "피처드 처리에 실패했습니다."
      },
      {
        status: 400
      }
    );
  }
}
