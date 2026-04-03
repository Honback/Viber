import { defineConfig, devices } from "@playwright/test";

import { loadLocalEnv } from "./tests/e2e/load-env";

loadLocalEnv();

const port = 3100;
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${port}`;
const adminBootstrapEmails = [process.env.ADMIN_BOOTSTRAP_EMAILS, "playwright-admin@example.com"]
  .filter(Boolean)
  .join(",");
const sharedEnv = {
  ...process.env,
  DATABASE_URL: process.env.DATABASE_URL ?? "postgres://postgres:postgres@127.0.0.1:54329/vibe_showcase",
  NEXT_PUBLIC_APP_URL: baseURL,
  PLAYWRIGHT_BASE_URL: baseURL,
  ADMIN_BOOTSTRAP_EMAILS: adminBootstrapEmails
};

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  retries: process.env.CI ? 2 : 0,
  globalSetup: "./tests/e2e/global.setup.ts",
  reporter: "list",
  use: {
    baseURL,
    trace: "retain-on-failure"
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"]
      }
    }
  ],
  webServer: {
    command: `npm run start -- --hostname 127.0.0.1 --port ${port}`,
    cwd: process.cwd(),
    url: baseURL,
    timeout: 120_000,
    reuseExistingServer: false,
    env: sharedEnv
  }
});
