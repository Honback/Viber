import { expect, type Page } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

import { loadLocalEnv } from "./load-env";

loadLocalEnv();

export const TEST_MEMBER_EMAIL = "playwright-member@example.com";
export const TEST_ADMIN_EMAIL = "playwright-admin@example.com";
export const TEST_PASSWORD = "Playwright!234";

function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} 환경변수가 필요합니다.`);
  }

  return value;
}

function createSupabaseAdminClient() {
  return createClient(getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL"), getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

function getBaseUrl() {
  return process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3100";
}

async function findSupabaseUserByEmail(email: string) {
  const supabase = createSupabaseAdminClient();

  for (let page = 1; page <= 10; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 200
    });

    if (error) {
      throw new Error(error.message);
    }

    const found = data.users.find((user) => user.email?.toLowerCase() === email.toLowerCase());

    if (found) {
      return found;
    }

    if (data.users.length < 200) {
      break;
    }
  }

  return null;
}

export async function ensurePasswordUser(email: string, password = TEST_PASSWORD) {
  const supabase = createSupabaseAdminClient();
  const existing = await findSupabaseUserByEmail(email);
  const displayName = email.split("@")[0];

  if (existing) {
    const { error } = await supabase.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
      user_metadata: {
        name: displayName
      }
    });

    if (error) {
      throw new Error(error.message);
    }

    return existing;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      name: displayName
    }
  });

  if (error || !data.user) {
    throw new Error(error?.message ?? "테스트용 계정을 만들지 못했습니다.");
  }

  return data.user;
}

export async function openSetupFlow(page: Page, email: string, next = "/me/projects") {
  const supabase = createSupabaseAdminClient();
  const baseUrl = getBaseUrl();

  const { data, error } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: {
      redirectTo: `${baseUrl}/auth/callback?flow=setup&next=${encodeURIComponent(next)}`
    }
  });

  if (error || !data.properties.action_link) {
    throw new Error(error?.message ?? "비밀번호 설정 링크 생성에 실패했습니다.");
  }

  await page.goto(data.properties.action_link, {
    waitUntil: "networkidle"
  });

  await expect(page).toHaveURL(new RegExp(`/auth/password/setup\\?`), {
    timeout: 30_000
  });
  await expect(page.getByRole("heading", { name: "비밀번호 설정", exact: true })).toBeVisible({
    timeout: 30_000
  });
}

export async function completeInitialPasswordSetup(page: Page, input: { email: string; password: string; next?: string }) {
  const next = input.next ?? "/me/projects";
  await openSetupFlow(page, input.email, next);

  await page.locator("input[name='password']").fill(input.password);
  await page.locator("input[name='confirmPassword']").fill(input.password);
  await page.getByRole("button", { name: "비밀번호 설정 완료" }).click();

  await page.waitForURL((url) => url.pathname === new URL(next, getBaseUrl()).pathname, {
    timeout: 30_000
  });
  await expect(page.getByRole("button", { name: "로그아웃" })).toBeVisible();
}

export async function loginWithPassword(page: Page, email: string, password = TEST_PASSWORD, next = "/me/projects") {
  const targetUrl = new URL(next, getBaseUrl());

  await page.goto(`/auth/sign-in?next=${encodeURIComponent(next)}`);

  const loginForm = page.locator("form[action='/api/auth/login']");
  await loginForm.getByLabel("이메일").fill(email);
  await loginForm.getByLabel("비밀번호").fill(password);
  await loginForm.getByRole("button", { name: "로그인" }).click();

  await page.waitForURL((url) => url.pathname === targetUrl.pathname, {
    timeout: 30_000
  });
}

export async function logout(page: Page) {
  await page.getByRole("button", { name: "로그아웃" }).click();
  await page.waitForURL((url) => url.pathname === "/", {
    timeout: 30_000
  });
  await expect(page.getByRole("button", { name: "로그아웃" })).toHaveCount(0);
}
