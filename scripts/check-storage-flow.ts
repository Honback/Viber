import { loadLocalEnv } from "../tests/e2e/load-env";

loadLocalEnv();

const ONE_BY_ONE_PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9p6s4XcAAAAASUVORK5CYII=";

async function main() {
  const { eq } = await import("drizzle-orm");
  const { db, sql } = await import("../src/db");
  const { profiles, projectPosts, projects } = await import("../src/db/schema");
  const { uploadProjectImageSet, uploadProjectPostMedia } = await import("../src/lib/storage/project-media");
  const { submitLaunchProject, submitProjectPost } = await import("../src/lib/services/mutations");

  const admin = await db.query.profiles.findFirst({
    where: eq(profiles.email, "scheduler-admin@example.com")
  });

  if (!admin) {
    throw new Error("관리자 프로필을 찾지 못했습니다. scheduler-admin@example.com 계정을 먼저 준비해 주세요.");
  }

  const stamp = Date.now();
  const coverFile = new File([Buffer.from(ONE_BY_ONE_PNG_BASE64, "base64")], `cover-${stamp}.png`, {
    type: "image/png"
  });
  const galleryFiles = [
    new File([Buffer.from(ONE_BY_ONE_PNG_BASE64, "base64")], `gallery-a-${stamp}.png`, {
      type: "image/png"
    }),
    new File([Buffer.from(ONE_BY_ONE_PNG_BASE64, "base64")], `gallery-b-${stamp}.png`, {
      type: "image/png"
    })
  ];

  const uploadedImages = await uploadProjectImageSet({
    scopeKey: `check-${stamp}`,
    coverFile,
    galleryFiles
  });

  const submitResult = await submitLaunchProject({
    title: `스토리지 검증 프로젝트 ${stamp}`,
    tagline: "Supabase Storage 파일 업로드와 공개 URL 반영을 검증하는 프로젝트입니다.",
    shortDescription: "서버 업로드 후 프로젝트 대표 이미지와 갤러리에 Supabase Storage 공개 URL이 저장되는지 확인합니다.",
    overviewMd: "로그인한 멤버 업로드만 허용하는 Storage 흐름을 검증합니다.",
    problemMd: "직접 URL 입력이 아니라 파일 업로드로 대표 이미지와 갤러리를 관리해야 합니다.",
    targetUsersMd: "프로젝트를 운영하고 직접 시각 자료를 올리는 메이커를 대상으로 합니다.",
    whyMadeMd: "Storage 업로드 검증용입니다.",
    stage: "beta",
    category: "workflow",
    platform: "web",
    pricingModel: "free",
    pricingNote: "검증 전용",
    liveUrl: `https://storage-flow-${stamp}.example.com`,
    githubUrl: "",
    demoUrl: "",
    docsUrl: "",
    makerAlias: "스토리지테스트",
    coverImageUrl: uploadedImages.coverImageUrl ?? "",
    galleryCsv: uploadedImages.galleryUrls.join(", "),
    aiToolsCsv: "Supabase Storage",
    tagCsv: "storage, upload, media",
    isOpenSource: false,
    noSignupRequired: true,
    isSoloMaker: true,
    verificationMethod: "email",
    viewer: admin
  });

  const postMediaUrls = await uploadProjectPostMedia({
    scopeKey: `project-${submitResult.projectId}`,
    files: [
      new File([Buffer.from(ONE_BY_ONE_PNG_BASE64, "base64")], `post-${stamp}.png`, {
        type: "image/png"
      })
    ]
  });

  const postResult = await submitProjectPost({
    projectId: submitResult.projectId,
    kind: "update",
    title: "스토리지 업로드 검증 업데이트",
    summary: "첨부 이미지가 Storage 공개 URL로 저장되는지 확인합니다.",
    bodyMd: "Storage 공개 버킷 URL이 활동 미디어에도 반영되어야 합니다.",
    mediaCsv: postMediaUrls.join(", "),
    user: admin
  });

  const project = await db.query.projects.findFirst({
    where: eq(projects.id, submitResult.projectId),
    columns: {
      id: true,
      slug: true,
      coverImageUrl: true,
      galleryJson: true
    }
  });

  const post = await db.query.projectPosts.findFirst({
    where: eq(projectPosts.id, postResult.postId),
    columns: {
      id: true,
      mediaJson: true
    }
  });

  if (!project || !post) {
    throw new Error("업로드 검증 후 프로젝트 또는 활동을 다시 찾지 못했습니다.");
  }

  const publicUrlResponse = await fetch(project.coverImageUrl);

  console.log(
    JSON.stringify(
      {
        project,
        post,
        coverAccessible: publicUrlResponse.ok,
        coverStatus: publicUrlResponse.status
      },
      null,
      2
    )
  );

  await sql.end();
}

main().catch(async (error) => {
  const { sql } = await import("../src/db");
  console.error(error instanceof Error ? error.message : error);
  await sql.end();
  process.exit(1);
});
