import { revalidatePath } from "next/cache";

import { getCurrentProfile } from "@/lib/auth/session";
import { getVisitorSessionHash } from "@/lib/auth/visitor";
import { createRedirectResponse, parseOptionalString, parseRequiredString } from "@/lib/http";
import { verifyTurnstileToken } from "@/lib/security/turnstile";
import { createComment } from "@/lib/services/mutations";
import { commentActionSchema } from "@/lib/validations/forms";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const formData = await request.formData();
  const redirectTo = parseRequiredString(formData.get("redirectTo")) || `/p/${id}`;

  try {
    const parsed = commentActionSchema.parse({
      bodyMd: parseRequiredString(formData.get("bodyMd")),
      postId: parseOptionalString(formData.get("postId")) ?? "",
      parentId: parseOptionalString(formData.get("parentId")) ?? "",
      guestName: parseOptionalString(formData.get("guestName")) ?? "",
      turnstileToken: parseOptionalString(formData.get("turnstileToken")) ?? "",
      redirectTo
    });
    const viewer = await getCurrentProfile();
    const rateLimitIdentifier = await getVisitorSessionHash(viewer?.id);

    if (!viewer) {
      const remoteIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
      await verifyTurnstileToken(parsed.turnstileToken, remoteIp);
    }

    const result = await createComment({
      projectId: id,
      user: viewer,
      guestName: viewer ? null : parsed.guestName || null,
      guestSessionHash: viewer ? null : rateLimitIdentifier,
      bodyMd: parsed.bodyMd,
      postId: parsed.postId || null,
      parentId: parsed.parentId || null,
      rateLimitIdentifier
    });

    revalidatePath(`/p/${result.slug}`);

    return createRedirectResponse(parsed.redirectTo, { notice: "댓글을 등록했습니다." });
  } catch (error) {
    return createRedirectResponse(redirectTo, {
      error: error instanceof Error ? error.message : "댓글 등록에 실패했습니다."
    });
  }
}
