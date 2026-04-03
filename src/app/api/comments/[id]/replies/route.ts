import { revalidatePath } from "next/cache";

import { getCurrentProfile } from "@/lib/auth/session";
import { getVisitorSessionHash } from "@/lib/auth/visitor";
import { createRedirectResponse, parseOptionalString, parseRequiredString } from "@/lib/http";
import { verifyTurnstileToken } from "@/lib/security/turnstile";
import { createComment } from "@/lib/services/mutations";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const formData = await request.formData();
  const projectId = parseRequiredString(formData.get("projectId"));
  const redirectTo = parseRequiredString(formData.get("redirectTo"));
  const bodyMd = parseRequiredString(formData.get("bodyMd"));
  const guestName = parseOptionalString(formData.get("guestName")) ?? "";
  const turnstileToken = parseOptionalString(formData.get("turnstileToken")) ?? "";

  try {
    const viewer = await getCurrentProfile();
    const rateLimitIdentifier = await getVisitorSessionHash(viewer?.id);

    if (!viewer) {
      const remoteIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
      await verifyTurnstileToken(turnstileToken, remoteIp);
    }

    const result = await createComment({
      projectId,
      user: viewer,
      guestName: viewer ? null : guestName || null,
      guestSessionHash: viewer ? null : rateLimitIdentifier,
      bodyMd,
      parentId: id,
      rateLimitIdentifier
    });

    revalidatePath(`/p/${result.slug}`);

    return createRedirectResponse(redirectTo, {
      notice: "답글을 등록했습니다."
    });
  } catch (error) {
    return createRedirectResponse(redirectTo, {
      error: error instanceof Error ? error.message : "답글 등록에 실패했습니다."
    });
  }
}
