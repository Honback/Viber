import { revalidatePath } from "next/cache";

import { getCurrentProfile } from "@/lib/auth/session";
import { getVisitorSessionHash } from "@/lib/auth/visitor";
import { createRedirectResponse, parseOptionalString, parseRequiredString } from "@/lib/http";
import { verifyTurnstileToken } from "@/lib/security/turnstile";
import { createReport } from "@/lib/services/mutations";
import { reportActionSchema } from "@/lib/validations/forms";

export async function POST(request: Request) {
  const viewer = await getCurrentProfile();
  const formData = await request.formData();

  try {
    const parsed = reportActionSchema.parse({
      targetType: parseRequiredString(formData.get("targetType")),
      targetId: parseRequiredString(formData.get("targetId")),
      reason: parseRequiredString(formData.get("reason")),
      note: parseOptionalString(formData.get("note")) ?? "",
      turnstileToken: parseOptionalString(formData.get("turnstileToken")) ?? "",
      redirectTo: parseRequiredString(formData.get("redirectTo"))
    });

    const remoteIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
    await verifyTurnstileToken(parsed.turnstileToken, remoteIp);

    const rateLimitIdentifier = await getVisitorSessionHash(viewer?.id);
    await createReport({
      reporterUserId: viewer?.id,
      targetType: parsed.targetType,
      targetId: parsed.targetId,
      reason: parsed.reason,
      note: parsed.note || null,
      rateLimitIdentifier
    });

    revalidatePath(parsed.redirectTo);

    return createRedirectResponse(parsed.redirectTo, { notice: "신고가 접수되었습니다." });
  } catch (error) {
    return createRedirectResponse("/", {
      error: error instanceof Error ? error.message : "신고 접수에 실패했습니다."
    });
  }
}
