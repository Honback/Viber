import { revalidatePath } from "next/cache";

import { requireCurrentProfile } from "@/lib/auth/session";
import { createRedirectResponse, parseRequiredString } from "@/lib/http";
import { claimProjectOwnership } from "@/lib/services/mutations";
import { claimActionSchema } from "@/lib/validations/forms";

type RouteContext = {
  params: Promise<{ token: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { token } = await context.params;
  const viewer = await requireCurrentProfile(`/claim/${token}`);
  const formData = await request.formData();

  try {
    const parsed = claimActionSchema.parse({
      redirectTo: parseRequiredString(formData.get("redirectTo"))
    });
    const result = await claimProjectOwnership(token, viewer);

    revalidatePath(parsed.redirectTo);
    revalidatePath(`/p/${result.slug}`);

    return createRedirectResponse(parsed.redirectTo, {
      notice: "프로젝트 소유권을 연결했고 즉시 공개 상태로 전환했습니다."
    });
  } catch (error) {
    return createRedirectResponse(`/claim/${token}`, {
      error: error instanceof Error ? error.message : "claim 처리에 실패했습니다."
    });
  }
}
