import { revalidatePath } from "next/cache";

import { requireCurrentProfile } from "@/lib/auth/session";
import { createRedirectResponse, parseOptionalString, parseRequiredString } from "@/lib/http";
import { submitProjectPost } from "@/lib/services/mutations";
import { postSubmissionSchema } from "@/lib/validations/forms";

export async function POST(request: Request) {
  const viewer = await requireCurrentProfile();
  const formData = await request.formData();
  const initialRedirectTo = parseOptionalString(formData.get("redirectTo")) ?? "/me/projects";

  try {
    const parsed = postSubmissionSchema.parse({
      kind: parseRequiredString(formData.get("kind")),
      projectId: parseRequiredString(formData.get("projectId")),
      title: parseRequiredString(formData.get("title")),
      summary: parseRequiredString(formData.get("summary")),
      bodyMd: parseRequiredString(formData.get("bodyMd")),
      requestedFeedbackMd: parseRequiredString(formData.get("requestedFeedbackMd")),
      mediaCsv: parseRequiredString(formData.get("mediaCsv")),
      redirectTo: initialRedirectTo
    });

    const { redirectTo, ...submission } = parsed;
    const result = await submitProjectPost({
      ...submission,
      user: viewer
    });

    revalidatePath(`/p/${result.slug}`);
    revalidatePath("/me/projects");

    return createRedirectResponse(redirectTo, {
      notice:
        result.status === "published"
          ? "활동을 바로 공개했습니다."
          : parsed.kind === "feedback"
            ? "피드백을 등록했고 검토 대기 상태로 저장했습니다."
            : "활동을 등록했고 공개 전 상태로 저장했습니다."
    });
  } catch (error) {
    return createRedirectResponse(initialRedirectTo, {
      error: error instanceof Error ? error.message : "활동 추가에 실패했습니다."
    });
  }
}
