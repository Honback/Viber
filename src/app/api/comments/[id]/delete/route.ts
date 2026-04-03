import { revalidatePath } from "next/cache";

import { requireCurrentProfile } from "@/lib/auth/session";
import { createRedirectResponse, parseRequiredString } from "@/lib/http";
import { softDeleteComment } from "@/lib/services/mutations";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const viewer = await requireCurrentProfile();
  const { id } = await context.params;
  const formData = await request.formData();

  try {
    const result = await softDeleteComment({
      commentId: id,
      user: viewer
    });
    revalidatePath(`/p/${result.slug}`);

    return createRedirectResponse(parseRequiredString(formData.get("redirectTo")), {
      notice: "댓글을 삭제했습니다."
    });
  } catch (error) {
    return createRedirectResponse("/", {
      error: error instanceof Error ? error.message : "댓글 삭제에 실패했습니다."
    });
  }
}
