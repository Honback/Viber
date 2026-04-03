import { revalidatePath } from "next/cache";

import { requireCurrentProfile } from "@/lib/auth/session";
import { createRedirectResponse, parseRequiredString } from "@/lib/http";
import { updateCommentBody } from "@/lib/services/mutations";
import { commentUpdateSchema } from "@/lib/validations/forms";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const viewer = await requireCurrentProfile();
  const { id } = await context.params;
  const formData = await request.formData();

  try {
    const parsed = commentUpdateSchema.parse({
      bodyMd: parseRequiredString(formData.get("bodyMd")),
      redirectTo: parseRequiredString(formData.get("redirectTo"))
    });
    const result = await updateCommentBody({
      commentId: id,
      user: viewer,
      bodyMd: parsed.bodyMd
    });

    revalidatePath(`/p/${result.slug}`);

    return createRedirectResponse(parsed.redirectTo, { notice: "댓글을 수정했습니다." });
  } catch (error) {
    return createRedirectResponse("/", {
      error: error instanceof Error ? error.message : "댓글 수정에 실패했습니다."
    });
  }
}
