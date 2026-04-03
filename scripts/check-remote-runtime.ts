import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";

import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import postgres from "postgres";

import * as schema from "../src/db/schema";
import { linkHealthChecks, projectOwners, projectPosts, projects } from "../src/db/schema";

type ProfileStore = {
  production: {
    runtimeDatabaseUrl: string;
    migrationDatabaseUrl: string;
  };
};

function loadProfileStore() {
  const storePath = path.join(process.cwd(), ".env.db-profiles.json");

  if (!fs.existsSync(storePath)) {
    throw new Error(".env.db-profiles.json 이 없습니다. 먼저 db profile 명령을 한 번 실행하세요.");
  }

  return JSON.parse(fs.readFileSync(storePath, "utf8")) as ProfileStore;
}

function waitForServerReady(child: ReturnType<typeof spawn>) {
  return new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error("원격 런타임 서버가 제시간에 준비되지 않았습니다."));
    }, 30000);

    const onData = (chunk: Buffer | string) => {
      const text = chunk.toString();

      if (text.includes("Ready")) {
        clearTimeout(timeout);
        child.stdout?.off("data", onData);
        child.stderr?.off("data", onData);
        resolve();
      }
    };

    child.stdout?.on("data", onData);
    child.stderr?.on("data", onData);
    child.once("exit", (code) => {
      clearTimeout(timeout);
      reject(new Error(`원격 런타임 서버가 준비 전에 종료되었습니다. code=${code ?? "unknown"}`));
    });
  });
}

async function assertOk(url: string) {
  const response = await fetch(url, { redirect: "manual" });

  if (!response.ok) {
    throw new Error(`${url} 응답 실패: ${response.status}`);
  }

  return response;
}

async function main() {
  const { production } = loadProfileStore();
  const runtimeUrl = production.runtimeDatabaseUrl;
  const migrationUrl = production.migrationDatabaseUrl;

  if (!runtimeUrl || !migrationUrl) {
    throw new Error("운영 DB 연결 문자열이 저장되어 있지 않습니다.");
  }

  const sql = postgres(migrationUrl, {
    max: 1,
    prepare: false,
    ssl: "require",
  });

  const db = drizzle(sql, { schema, casing: "snake_case" });
  const projectId = crypto.randomUUID();
  const postId = crypto.randomUUID();
  const ownerId = crypto.randomUUID();
  const slug = `remote-smoke-${Date.now()}`;
  const liveUrl = `https://${slug}.vibehub.co.kr`;
  const appUrl = "http://127.0.0.1:3101";

  const child = spawn("npm", ["run", "start", "--", "--hostname", "127.0.0.1", "--port", "3101"], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      DATABASE_URL: runtimeUrl,
      MIGRATION_DATABASE_URL: migrationUrl,
      NEXT_PUBLIC_APP_URL: appUrl,
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  try {
    await db.insert(projects).values({
      id: projectId,
      slug,
      title: "Remote Runtime Smoke",
      tagline: "운영 DB 런타임 점검용 임시 프로젝트",
      shortDescription: "운영 DB를 바라보는 앱 서버가 실제 프로젝트를 읽을 수 있는지 확인합니다.",
      overviewMd: "운영 DB runtime 검증용 overview",
      problemMd: "운영 DB runtime 검증용 problem",
      targetUsersMd: "운영 배포 전 smoke test를 보는 운영자",
      whyMadeMd: "원격 DB 구동 검증",
      stage: "beta",
      category: "productivity",
      platform: "web",
      pricingModel: "free",
      pricingNote: "Smoke test only",
      liveUrl,
      liveUrlNormalized: liveUrl.toLowerCase(),
      githubUrl: null,
      githubUrlNormalized: null,
      demoUrl: null,
      docsUrl: null,
      makerAlias: "Smoke Bot",
      coverImageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=80",
      galleryJson: [],
      isOpenSource: false,
      noSignupRequired: true,
      isSoloMaker: true,
      aiToolsJson: [],
      verificationState: "unverified",
      status: "published",
      featured: false,
      featuredOrder: null,
      publishedAt: new Date(),
      lastActivityAt: new Date(),
    });

    await db.insert(projectOwners).values({
      id: ownerId,
      projectId,
      userId: null,
      verificationMethod: "email",
      isPrimary: true,
      claimedAt: null,
    });

    await db.insert(projectPosts).values({
      id: postId,
      projectId,
      authorUserId: null,
      type: "launch",
      title: "Remote smoke launch",
      summary: "운영 DB 런타임에서 읽히는지 확인합니다.",
      bodyMd: "운영 DB smoke test",
      requestedFeedbackMd: null,
      mediaJson: [],
      status: "published",
      publishedAt: new Date(),
    });

    await db.insert(linkHealthChecks).values({
      projectId,
      status: "healthy",
      httpStatus: 200,
      failureCount: 0,
      note: "remote runtime smoke",
    });

    await waitForServerReady(child);

    await assertOk(`${appUrl}/`);
    await assertOk(`${appUrl}/projects`);
    await assertOk(`${appUrl}/submit`);
    await assertOk(`${appUrl}/auth/sign-in`);

    const listResponse = await assertOk(`${appUrl}/api/projects`);
    const listJson = (await listResponse.json()) as { items: Array<{ slug: string }> };

    if (!listJson.items.some((item) => item.slug === slug)) {
      throw new Error("원격 API 목록에서 임시 프로젝트를 찾지 못했습니다.");
    }

    const detailResponse = await assertOk(`${appUrl}/api/projects/${slug}`);
    const detailJson = (await detailResponse.json()) as { slug?: string };

    if (detailJson.slug !== slug) {
      throw new Error("원격 API 상세 응답이 예상 slug와 다릅니다.");
    }

    await assertOk(`${appUrl}/p/${slug}`);

    console.log(
      JSON.stringify(
        {
          ok: true,
          appUrl,
          slug,
          checked: ["/", "/projects", "/submit", "/auth/sign-in", `/api/projects`, `/api/projects/${slug}`, `/p/${slug}`],
        },
        null,
        2,
      ),
    );
  } finally {
    child.kill("SIGINT");
    await db.delete(linkHealthChecks).where(eq(linkHealthChecks.projectId, projectId));
    await db.delete(projectPosts).where(eq(projectPosts.id, postId));
    await db.delete(projectOwners).where(eq(projectOwners.id, ownerId));
    await db.delete(projects).where(eq(projects.id, projectId));
    await sql.end({ timeout: 5 });
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
