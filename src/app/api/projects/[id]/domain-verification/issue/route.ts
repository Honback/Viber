import { revalidatePath } from "next/cache";

import { requireCurrentProfile } from "@/lib/auth/session";
import { createRedirectResponse } from "@/lib/http";
import { issueProjectDomainVerification } from "@/lib/services/mutations";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const viewer = await requireCurrentProfile();
  const { id } = await context.params;
  const formData = await request.formData();
  const redirectTo = String(formData.get("redirectTo") ?? "/me/projects");

  try {
    const result = await issueProjectDomainVerification({
      projectId: id,
      user: viewer
    });

    revalidatePath("/me/projects");
    revalidatePath("/admin/projects");
    revalidatePath(`/p/${result.slug}`);

    return createRedirectResponse(redirectTo, {
      notice: `도메인 확인 토큰을 발급했습니다. ${result.recordName} TXT 레코드에 값을 추가한 뒤 다시 검증해 주세요.`
    });
  } catch (error) {
    return createRedirectResponse(redirectTo, {
      error: error instanceof Error ? error.message : "도메인 확인 토큰 발급에 실패했습니다."
    });
  }
}
