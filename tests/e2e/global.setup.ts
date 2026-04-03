import { execSync } from "node:child_process";

import { loadLocalEnv } from "./load-env";

loadLocalEnv();

const workspaceDir = process.cwd();
const adminBootstrapEmails = [process.env.ADMIN_BOOTSTRAP_EMAILS, "playwright-admin@example.com"]
  .filter(Boolean)
  .join(",");
const sharedEnv = {
  ...process.env,
  DATABASE_URL: process.env.DATABASE_URL ?? "postgres://postgres:postgres@127.0.0.1:54329/vibe_showcase",
  NEXT_PUBLIC_APP_URL: process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3100",
  ADMIN_BOOTSTRAP_EMAILS: adminBootstrapEmails
};

function run(command: string) {
  execSync(command, {
    cwd: workspaceDir,
    env: sharedEnv,
    stdio: "inherit"
  });
}

function getHealthStatus() {
  try {
    return execSync("docker inspect -f '{{if .State.Health}}{{.State.Health.Status}}{{else}}unknown{{end}}' vibe-showcase-postgres", {
      cwd: workspaceDir,
      env: sharedEnv,
      encoding: "utf8"
    }).trim();
  } catch {
    return "missing";
  }
}

async function waitForPostgres() {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const status = getHealthStatus();

    if (status === "healthy") {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 1_000));
  }

  throw new Error("Postgres 컨테이너가 healthy 상태가 되지 않았습니다.");
}

async function globalSetup() {
  run("docker compose up -d postgres");
  await waitForPostgres();
  run("npm run db:migrate");
  run("npm run db:seed");
}

export default globalSetup;
