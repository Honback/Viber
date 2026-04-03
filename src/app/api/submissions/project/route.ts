import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";

import { getCurrentProfile } from "@/lib/auth/session";
import { createRedirectResponse, parseCheckbox, parseRequiredString } from "@/lib/http";
import { verifyTurnstileToken } from "@/lib/security/turnstile";
import { getMultipleFiles, getSingleFile, uploadProjectImageSet } from "@/lib/storage/project-media";
import { submitLaunchProject } from "@/lib/services/mutations";
import { launchSubmissionSchema } from "@/lib/validations/forms";

export async function POST(request: Request) {
  const viewer = await getCurrentProfile();
  const formData = await request.formData();

  try {
    const coverImageFile = getSingleFile(formData, "coverImageFile");
    const galleryFiles = getMultipleFiles(formData, "galleryFiles");

    if (!viewer && (coverImageFile || galleryFiles.length)) {
      throw new Error("이미지 파일 업로드는 로그인한 멤버만 사용할 수 있습니다. 비회원 제출은 이미지 URL만 입력해 주세요.");
    }

    const uploadedImages =
      viewer && (coverImageFile || galleryFiles.length)
        ? await uploadProjectImageSet({
            scopeKey: `draft-${viewer.id}-${randomUUID()}`,
            coverFile: coverImageFile,
            galleryFiles
          })
        : null;

    const parsed = launchSubmissionSchema.parse({
      kind: "launch",
      title: parseRequiredString(formData.get("title")),
      tagline: parseRequiredString(formData.get("tagline")),
      shortDescription: parseRequiredString(formData.get("shortDescription")),
      overviewMd: parseRequiredString(formData.get("overviewMd")),
      problemMd: parseRequiredString(formData.get("problemMd")),
      targetUsersMd: parseRequiredString(formData.get("targetUsersMd")),
      whyMadeMd: parseRequiredString(formData.get("whyMadeMd")),
      stage: parseRequiredString(formData.get("stage")),
      category: parseRequiredString(formData.get("category")),
      platform: parseRequiredString(formData.get("platform")),
      pricingModel: parseRequiredString(formData.get("pricingModel")),
      pricingNote: parseRequiredString(formData.get("pricingNote")),
      liveUrl: parseRequiredString(formData.get("liveUrl")),
      githubUrl: parseRequiredString(formData.get("githubUrl")),
      demoUrl: parseRequiredString(formData.get("demoUrl")),
      docsUrl: parseRequiredString(formData.get("docsUrl")),
      makerAlias: parseRequiredString(formData.get("makerAlias")),
      coverImageUrl: uploadedImages?.coverImageUrl ?? parseRequiredString(formData.get("coverImageUrl")),
      galleryCsv: uploadedImages?.galleryUrls.length ? uploadedImages.galleryUrls.join(", ") : parseRequiredString(formData.get("galleryCsv")),
      aiToolsCsv: parseRequiredString(formData.get("aiToolsCsv")),
      tagCsv: parseRequiredString(formData.get("tagCsv")),
      ownerEmail: parseRequiredString(formData.get("ownerEmail")),
      verificationMethod: parseRequiredString(formData.get("verificationMethod")),
      turnstileToken: parseRequiredString(formData.get("turnstileToken")),
      isOpenSource: parseCheckbox(formData.get("isOpenSource")),
      noSignupRequired: parseCheckbox(formData.get("noSignupRequired")),
      isSoloMaker: parseCheckbox(formData.get("isSoloMaker"))
    });

    const remoteIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
    await verifyTurnstileToken(parsed.turnstileToken, remoteIp);

    const result = await submitLaunchProject({
      ...parsed,
      viewer
    });

    revalidatePath("/");
    revalidatePath("/projects");
    revalidatePath("/submit");

    const targetPath = result.claimToken ? "/projects" : "/me/projects";
    const notice = result.claimToken
      ? result.claimEmailDelivery?.status === "failed"
        ? "제출은 저장했지만 claim 메일 발송에 실패했습니다. 관리자 메일 기록에서 상태를 확인해 주세요."
        : result.claimEmailDelivery?.status === "simulated"
          ? "제출을 저장했고 claim 메일을 로컬 메일 기록에 적재했습니다."
          : "제출을 저장했고 claim 메일을 보냈습니다. 메일의 링크로 소유권 연결을 완료해 주세요."
      : result.status === "published"
        ? "프로젝트를 공개했습니다. 바로 상세와 내 프로젝트 화면에서 확인할 수 있습니다."
        : "프로젝트를 제출했습니다. 처리 상태를 내 프로젝트에서 확인해 주세요.";

    return createRedirectResponse(targetPath, { notice });
  } catch (error) {
    return createRedirectResponse("/submit", {
      error: error instanceof Error ? error.message : "프로젝트 제출에 실패했습니다."
    });
  }
}
