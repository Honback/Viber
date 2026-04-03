import { eq } from "drizzle-orm";

import { loadLocalEnv } from "../tests/e2e/load-env";

loadLocalEnv();

async function main() {
  const { db, sql } = await import("../src/db");
  const { profiles, projects, projectOwners } = await import("../src/db/schema");
  const { submitLaunchProject, issueProjectDomainVerification } = await import("../src/lib/services/mutations");

  const owner =
    (await db.query.profiles.findFirst({
      where: eq(profiles.email, "kky3127@naver.com")
    })) ??
    (await db.query.profiles.findFirst({
      where: eq(profiles.email, "scheduler-admin@example.com")
    }));

  if (!owner) {
    throw new Error("도메인 검증 흐름을 확인할 owner 프로필이 없습니다.");
  }

  const existingOwnedProject = await db.query.projects.findFirst({
    where: eq(projects.liveUrlNormalized, "https://vibehub.co.kr/"),
    with: {
      owners: true
    }
  });

  let projectId = existingOwnedProject?.id ?? null;
  let slug = existingOwnedProject?.slug ?? null;
  let title = existingOwnedProject?.title ?? null;

  if (!existingOwnedProject || !existingOwnedProject.owners.some((row) => row.userId === owner.id)) {
    const stamp = Date.now();
    const created = await submitLaunchProject({
      title: `도메인 확인 테스트 ${stamp}`,
      tagline: "DNS TXT 기반 도메인 확인 흐름을 검증하기 위한 테스트 프로젝트입니다.",
      shortDescription: "live URL 에 연결된 도메인으로 TXT 레코드 확인을 검증하는 테스트 프로젝트입니다.",
      overviewMd: "도메인 확인 기능을 로컬에서 검증하기 위한 프로젝트입니다.",
      problemMd: "프로젝트 소유자가 실제 서비스 도메인을 제어하는지 확인해야 합니다.",
      targetUsersMd: "직접 DNS 를 제어하는 프로젝트 owner",
      whyMadeMd: "domain_verified 배지를 점검하기 위해 만들었습니다.",
      stage: "live",
      category: "developer-tools",
      platform: "web",
      pricingModel: "free",
      pricingNote: "검증용",
      liveUrl: "https://vibehub.co.kr",
      githubUrl: "",
      demoUrl: "",
      docsUrl: "",
      makerAlias: owner.displayName,
      coverImageUrl: "",
      galleryCsv: "",
      aiToolsCsv: "Supabase, DNS",
      tagCsv: "domain, verification, dns",
      isOpenSource: false,
      noSignupRequired: false,
      isSoloMaker: true,
      verificationMethod: "email",
      viewer: owner
    });

    projectId = created.projectId;
    slug = created.slug;
    title = `도메인 확인 테스트 ${stamp}`;
  }

  if (!projectId || !slug || !title) {
    throw new Error("검증용 프로젝트를 준비하지 못했습니다.");
  }

  const ownerLink = await db.query.projectOwners.findFirst({
    where: eq(projectOwners.projectId, projectId)
  });

  if (!ownerLink?.userId) {
    throw new Error("검증용 프로젝트 owner 연결을 찾지 못했습니다.");
  }

  const issued = await issueProjectDomainVerification({
    projectId,
    user: owner
  });

  console.log(
    JSON.stringify(
      {
        ownerEmail: owner.email,
        projectId,
        slug,
        title,
        verifyPage: "http://127.0.0.1:3000/me/projects",
        recordName: issued.recordName,
        token: issued.token,
        registrableDomain: issued.registrableDomain
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
