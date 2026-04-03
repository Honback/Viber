import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { requireCurrentProfile } from "@/lib/auth/session";
import { createRedirectResponse, parseCheckbox, parseRequiredString } from "@/lib/http";
import { getMultipleFiles, getSingleFile, uploadProjectImageSet } from "@/lib/storage/project-media";
import { getProjectDetailBySlug } from "@/lib/services/read-models";
import { updateProject } from "@/lib/services/mutations";
import { projectUpdateSchema } from "@/lib/validations/forms";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, context: RouteContext) {
  const { id } = await context.params;
  const project = await getProjectDetailBySlug(id);

  if (!project) {
    return NextResponse.json({ error: "프로젝트를 찾을 수 없습니다." }, { status: 404 });
  }

  return NextResponse.json(project);
}

export async function PATCH(request: Request, context: RouteContext) {
  const viewer = await requireCurrentProfile();
  const { id } = await context.params;

  try {
    const body = await request.json();
    const parsed = projectUpdateSchema.parse(body);
    const result = await updateProject({
      projectId: id,
      ...parsed,
      user: viewer
    });

    revalidatePath(`/p/${result.slug}`);
    revalidatePath("/projects");
    revalidatePath("/me/projects");
    revalidatePath("/admin/projects");

    return NextResponse.json({
      ok: true,
      slug: result.slug
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "프로젝트 수정에 실패했습니다."
      },
      {
        status: 400
      }
    );
  }
}

export async function POST(request: Request, context: RouteContext) {
  const viewer = await requireCurrentProfile();
  const { id } = await context.params;
  const formData = await request.formData();

  try {
    const coverImageFile = getSingleFile(formData, "coverImageFile");
    const galleryFiles = getMultipleFiles(formData, "galleryFiles");
    const uploadedImages =
      coverImageFile || galleryFiles.length
        ? await uploadProjectImageSet({
            scopeKey: `project-${id}`,
            coverFile: coverImageFile,
            galleryFiles
          })
        : null;

    const parsed = projectUpdateSchema.parse({
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
      isOpenSource: parseCheckbox(formData.get("isOpenSource")),
      noSignupRequired: parseCheckbox(formData.get("noSignupRequired")),
      isSoloMaker: parseCheckbox(formData.get("isSoloMaker")),
      redirectTo: parseRequiredString(formData.get("redirectTo")) || "/me/projects"
    });

    const result = await updateProject({
      projectId: id,
      ...parsed,
      user: viewer
    });

    revalidatePath(`/p/${result.slug}`);
    revalidatePath("/projects");
    revalidatePath("/me/projects");
    revalidatePath("/admin/projects");

    return createRedirectResponse(parsed.redirectTo, {
      notice: "프로젝트 정보를 저장했습니다."
    });
  } catch (error) {
    return createRedirectResponse("/me/projects", {
      error: error instanceof Error ? error.message : "프로젝트 수정에 실패했습니다."
    });
  }
}
