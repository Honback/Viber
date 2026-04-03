import { revalidatePath } from "next/cache";

import { buildSignInPath, getCurrentProfile } from "@/lib/auth/session";
import { createRedirectResponse, parseRequiredString } from "@/lib/http";
import { toggleSaveProject } from "@/lib/services/mutations";
import { saveActionSchema } from "@/lib/validations/forms";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const formData = await request.formData();

  try {
    const parsed = saveActionSchema.parse({
      redirectTo: parseRequiredString(formData.get("redirectTo"))
    });
    const viewer = await getCurrentProfile();

    if (!viewer) {
      return createRedirectResponse(buildSignInPath(parsed.redirectTo));
    }

    const result = await toggleSaveProject(id, viewer.id);
    revalidatePath(parsed.redirectTo);
    revalidatePath("/me/saved");

    return createRedirectResponse(parsed.redirectTo, {
      notice: result.saved ? "저장 목록에 추가했습니다." : "저장 목록에서 제거했습니다."
    });
  } catch (error) {
    return createRedirectResponse("/projects", {
      error: error instanceof Error ? error.message : "저장 처리에 실패했습니다."
    });
  }
}
