import { revalidatePath } from "next/cache";

import { requireCurrentProfile } from "@/lib/auth/session";
import { createRedirectResponse } from "@/lib/http";
import { verifyProjectDomainVerification } from "@/lib/services/mutations";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const viewer = await requireCurrentProfile();
  const { id } = await context.params;
  const formData = await request.formData();
  const redirectTo = String(formData.get("redirectTo") ?? "/me/projects");

  try {
    const result = await verifyProjectDomainVerification({
      projectId: id,
      user: viewer
    });

    revalidatePath("/me/projects");
    revalidatePath("/admin/projects");
    revalidatePath(`/p/${result.slug}`);

    return createRedirectResponse(redirectTo, {
      notice: `${result.registrableDomain} 도메인 확인을 완료했습니다.`
    });
  } catch (error) {
    return createRedirectResponse(redirectTo, {
      error: error instanceof Error ? error.message : "도메인 확인에 실패했습니다."
    });
  }
}
