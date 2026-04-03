import { loadLocalEnv } from "../tests/e2e/load-env";

loadLocalEnv();

async function main() {
  const { desc, eq } = await import("drizzle-orm");
  const { db, sql } = await import("../src/db");
  const { emailDeliveries, profiles, projects } = await import("../src/db/schema");
  const { createComment, moderateProjectStatus, submitLaunchProject } = await import("../src/lib/services/mutations");

  const stamp = Date.now();
  const ownerEmail = `mail-owner-${stamp}@example.com`;
  const liveUrl = `https://mail-flow-${stamp}.example.com`;

  const admin = await db.query.profiles.findFirst({
    where: eq(profiles.email, "scheduler-admin@example.com")
  });

  if (!admin) {
    throw new Error("관리자 프로필을 찾지 못했습니다. scheduler-admin@example.com 계정을 먼저 준비해 주세요.");
  }

  const submitResult = await submitLaunchProject({
    title: `메일 검증 프로젝트 ${stamp}`,
    tagline: "메일 로그에 claim, 댓글, 운영 상태 변경을 남기는 검증용 프로젝트입니다.",
    shortDescription: "로컬 simulate 메일 로그가 실제 코드 경로에서 생성되는지 확인하는 검증 프로젝트입니다.",
    overviewMd: "메일 발송 레이어와 관리자 메일 기록 페이지를 검증하기 위한 프로젝트입니다.",
    problemMd: "claim 링크, 댓글 알림, 운영 상태 변경 메일이 로컬에서도 검증되어야 합니다.",
    targetUsersMd: "서비스 운영자와 메이커가 메일 기록을 함께 확인하는 상황을 가정합니다.",
    whyMadeMd: "Resend 앱 메일 연동 검증용으로 생성했습니다.",
    stage: "beta",
    category: "workflow",
    platform: "web",
    pricingModel: "free",
    pricingNote: "검증 전용",
    liveUrl,
    githubUrl: "",
    demoUrl: "",
    docsUrl: "",
    makerAlias: "메일테스트",
    coverImageUrl: "",
    galleryCsv: "",
    aiToolsCsv: "Resend, Supabase",
    tagCsv: "mail, resend, ops",
    isOpenSource: false,
    noSignupRequired: true,
    isSoloMaker: true,
    ownerEmail,
    verificationMethod: "email",
    viewer: null
  });

  const project = await db.query.projects.findFirst({
    where: eq(projects.id, submitResult.projectId),
    columns: {
      id: true,
      slug: true,
      title: true
    }
  });

  if (!project) {
    throw new Error("생성된 프로젝트를 다시 찾지 못했습니다.");
  }

  await moderateProjectStatus({
    projectId: project.id,
    nextStatus: "published",
    reason: "메일 검증을 위한 공개 전환",
    admin
  });

  await createComment({
    projectId: project.id,
    guestName: "메일검증방문자",
    guestSessionHash: `guest-${stamp}`,
    bodyMd: "로컬 메일 로그에 댓글 알림이 남는지 확인합니다.",
    rateLimitIdentifier: `mail-comment-${stamp}`
  });

  const deliveries = await db.query.emailDeliveries.findMany({
    orderBy: [desc(emailDeliveries.createdAt)],
    limit: 6
  });

  console.log(
    JSON.stringify(
      {
        project,
        ownerEmail,
        submitResult,
        deliveries: deliveries.map((delivery) => ({
          id: delivery.id,
          template: delivery.template,
          status: delivery.status,
          recipient: delivery.recipient,
          subject: delivery.subject,
          error: delivery.error,
          metadata: delivery.metadataJson
        }))
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
