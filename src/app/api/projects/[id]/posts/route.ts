import { revalidatePath } from "next/cache";

import { requireCurrentProfile } from "@/lib/auth/session";
import { createRedirectResponse, parseOptionalString, parseRequiredString } from "@/lib/http";
import { getMultipleFiles, uploadProjectPostMedia } from "@/lib/storage/project-media";
import { submitProjectPost } from "@/lib/services/mutations";
import { postSubmissionSchema } from "@/lib/validations/forms";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const viewer = await requireCurrentProfile();
  const { id } = await context.params;
  const formData = await request.formData();
  const initialRedirectTo = parseOptionalString(formData.get("redirectTo")) ?? "/me/projects";

  try {
    const mediaFiles = getMultipleFiles(formData, "mediaFiles");
    const uploadedMedia = mediaFiles.length
      ? await uploadProjectPostMedia({
          scopeKey: `project-${id}`,
          files: mediaFiles
        })
      : [];

    const parsed = postSubmissionSchema.parse({
      kind: parseRequiredString(formData.get("kind")),
      projectId: id,
      title: parseRequiredString(formData.get("title")),
      summary: parseRequiredString(formData.get("summary")),
      bodyMd: parseRequiredString(formData.get("bodyMd")),
      requestedFeedbackMd: parseRequiredString(formData.get("requestedFeedbackMd")),
      mediaCsv: uploadedMedia.length ? uploadedMedia.join(", ") : parseRequiredString(formData.get("mediaCsv")),
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
