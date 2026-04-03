import { expect, test, type Locator, type Page } from "@playwright/test";

import { completeInitialPasswordSetup, ensurePasswordUser, loginWithPassword, logout, openSetupFlow, TEST_ADMIN_EMAIL, TEST_MEMBER_EMAIL, TEST_PASSWORD } from "./supabase-auth";

const FOCUS_FLOW_PROJECT_ID = "00000000-0000-4000-8000-000000000101";
const FOCUS_FLOW_SLUG = "focus-flow";

async function waitForTurnstileToken(scope: Page | Locator) {
  const tokenInput = scope.locator("input[name='turnstileToken']").first();
  await expect
    .poll(async () => tokenInput.inputValue(), {
      timeout: 30_000
    })
    .not.toBe("");
}

async function fillLaunchForm(page: Page, input: { title: string; liveUrl: string; githubUrl: string; ownerEmail?: string }) {
  await page.getByLabel("프로젝트 이름").fill(input.title);
  await page.getByLabel("메이커 별칭").fill("Loop Forge");
  await page
    .getByLabel("한 줄 소개")
    .fill("실사용 흐름을 따라가며 하루 작업 우선순위를 다시 정리해 주는 메이커 대시보드");
  await page
    .getByLabel("짧은 설명")
    .fill("작업, 메모, 실험 결과를 한 화면에 묶고 다음 액션을 바로 보여 주는 경량 운영 도구입니다.");
  await page.getByLabel("Live URL").fill(input.liveUrl);
  await page.getByLabel("무엇인지").fill("작은 팀이 오늘 무엇을 먼저 해결해야 하는지 바로 보이게 만드는 프로젝트 운영 대시보드입니다.");
  await page.getByLabel("어떤 문제를 푸는지").fill("작업 보드와 회의 메모가 분리되면 실제 우선순위가 흐려지고 실행 속도가 급격히 떨어집니다.");
  await page.getByLabel("누구를 위한 것인지").fill("사이드 프로젝트 메이커와 소규모 제품 팀이 빠르게 실행 맥락을 맞추는 데 초점을 둡니다.");

  await page.getByText("선택 입력 열기").click();
  await page.getByLabel("GitHub URL").fill(input.githubUrl);
  await page.getByLabel("Demo URL").fill(`${input.liveUrl}/demo`);
  await page.getByLabel("Docs URL").fill(`${input.liveUrl}/docs`);
  await page.getByLabel("가격 메모").fill("개인 무료, 팀 기능은 추후 유료화 예정");
  await page.getByLabel("왜 만들었는지").fill("여러 실험을 동시에 돌릴 때 맥락 전환 비용이 커져서 하루 흐름을 다시 정렬해 주는 도구가 필요했습니다.");
  await page.getByLabel("대표 이미지 URL").fill(`https://images.local.test/${input.title.toLowerCase().replace(/\s+/g, "-")}.png`);
  await page.getByLabel("갤러리 이미지 URL들").fill(`https://images.local.test/${Date.now()}-1.png, https://images.local.test/${Date.now()}-2.png`);
  await page.getByLabel("태그").fill("productivity, dashboard, workflow");
  await page.getByLabel("사용한 AI 도구").fill("GPT-5.4, Cursor");
  await page.getByLabel("오픈소스").check();
  await page.getByLabel("가입 없이 체험 가능").check();

  if (input.ownerEmail) {
    await page.getByLabel("소유권 이메일").fill(input.ownerEmail);
  }
}

test.describe("문서 기준 제출/소유권 흐름", () => {
  test("메일 없이도 action_link를 열면 /auth/callback 해시가 비밀번호 설정 화면으로 이어진다", async ({ page }) => {
    test.setTimeout(120_000);

    const email = `callback-only-${Date.now()}@example.com`;
    await openSetupFlow(page, email, "/me/projects");

    await expect(page).toHaveURL(/\/auth\/password\/setup/);
    await expect(page.getByRole("heading", { name: "비밀번호 설정", exact: true })).toBeVisible();
    await expect(page.getByText(email)).toBeVisible();
  });

  test("이메일 인증 후 비밀번호를 설정하고 이후에는 이메일과 비밀번호로 로그인한다", async ({ page }) => {
    test.setTimeout(120_000);

    const email = `starter-${Date.now()}@example.com`;
    const password = `Starter!${Date.now()}`;

    await page.goto("/auth/sign-in?next=%2Fme%2Fprojects");
    await expect(page.getByRole("heading", { name: "로그인", exact: true })).toBeVisible();

    await completeInitialPasswordSetup(page, {
      email,
      password,
      next: "/me/projects"
    });

    await expect(page.getByRole("button", { name: "로그아웃" })).toBeVisible();

    await logout(page);
    await loginWithPassword(page, email, password, "/me/projects");
    await expect(page.getByRole("button", { name: "로그아웃" })).toBeVisible();
  });

  test("로그인 owner의 신규 런치는 즉시 공개되고 update도 바로 붙는다", async ({ page }) => {
    test.setTimeout(120_000);

    const suffix = `${Date.now()}`;
    const title = `Loop Pilot ${suffix}`;
    const liveUrl = `https://loop-pilot-${suffix}.local.test`;
    const githubUrl = `https://github.com/local/loop-pilot-${suffix}`;

    await ensurePasswordUser(TEST_MEMBER_EMAIL, TEST_PASSWORD);
    await loginWithPassword(page, TEST_MEMBER_EMAIL, TEST_PASSWORD, "/me/projects");
    await expect(page.getByRole("button", { name: "로그아웃" })).toBeVisible();
    await page.goto("/submit");
    await fillLaunchForm(page, { title, liveUrl, githubUrl });
    await waitForTurnstileToken(page.locator("form[action='/api/submissions/project']"));
    await page.getByRole("button", { name: "런치 제출" }).click();

    await expect(page).toHaveURL(/\/me\/projects/);
    const projectSection = page.locator("section").filter({ hasText: title }).first();
    await expect(projectSection.getByRole("heading", { name: title, exact: true })).toBeVisible();
    await expect(projectSection).toContainText("공개 중");

    await projectSection.getByText("업데이트 또는 피드백 요청 추가").click();
    await projectSection.getByLabel("제목").fill("모바일 레이아웃과 quick add를 정리했습니다");
    await projectSection.getByLabel("요약").fill("첫 진입의 흐름을 줄이고 바로 추가 버튼을 더 명확하게 정리했습니다.");
    await projectSection.getByLabel("본문").fill("모바일에서 빠르게 눌러보는 경험을 위해 quick add와 오늘 할 일 영역을 먼저 보이게 조정했습니다.");
    await projectSection.getByRole("button", { name: "활동 저장" }).click();

    await expect(page).toHaveURL(/\/me\/projects/);
    await expect(page.getByText("활동을 바로 공개했습니다.")).toBeVisible();
    await projectSection.getByRole("link", { name: "공개 페이지 보기" }).click();

    await expect(page).toHaveURL(/\/p\/[^/?#]+/);
    const detailPath = new URL(page.url()).pathname;
    await expect(page.getByRole("heading", { name: title, exact: true })).toBeVisible();
    await expect(page.getByText("모바일 레이아웃과 quick add를 정리했습니다")).toBeVisible();

    await logout(page);
    await page.goto(detailPath);
    await expect(page.getByRole("heading", { name: title, exact: true })).toBeVisible();

    await page.goto(`/projects?query=${encodeURIComponent(title)}`);
    await expect(page.getByRole("heading", { name: title, exact: true })).toBeVisible();
  });

  test("비회원 제출은 claim 전까지 비공개이고 claim 후 즉시 공개된다", async ({ page }) => {
    test.setTimeout(120_000);

    const suffix = `${Date.now()}`;
    const title = `Claim Pilot ${suffix}`;
    const liveUrl = `https://claim-pilot-${suffix}.local.test`;
    const githubUrl = `https://github.com/local/claim-pilot-${suffix}`;

    await page.goto("/submit");
    await fillLaunchForm(page, {
      title,
      liveUrl,
      githubUrl,
      ownerEmail: TEST_MEMBER_EMAIL
    });
    await waitForTurnstileToken(page.locator("form[action='/api/submissions/project']"));
    await page.getByRole("button", { name: "런치 제출" }).click();

    await expect(page).toHaveURL(/\/claim\/[^/?#]+/);
    const claimPath = new URL(page.url()).pathname;
    await expect(page.getByText(title)).toBeVisible();
    await expect(page.getByText(/소유권 연결에는 로그인 세션이 필요합니다/)).toBeVisible();

    const previewHref = await page.getByRole("link", { name: "프로젝트 미리 보기" }).getAttribute("href");
    expect(previewHref).toBeTruthy();

    await page.goto(previewHref!);
    await expect(page.getByRole("heading", { name: "페이지를 찾을 수 없습니다." })).toBeVisible();

    await ensurePasswordUser(TEST_MEMBER_EMAIL, TEST_PASSWORD);
    await loginWithPassword(page, TEST_MEMBER_EMAIL, TEST_PASSWORD, claimPath);
    await page.getByRole("button", { name: "이 계정으로 소유권 연결" }).click();

    await expect(page).toHaveURL(/\/me\/projects/);
    const projectSection = page.locator("section").filter({ hasText: title }).first();
    await expect(projectSection.getByRole("heading", { name: title })).toBeVisible();
    await expect(projectSection).toContainText("공개 중");

    await logout(page);
    await page.goto(previewHref!);
    await expect(page.locator("h1")).toHaveText(title);
  });

  test("visitor도 닉네임으로 댓글을 남길 수 있다", async ({ page }) => {
    test.setTimeout(120_000);

    const guestComment = `비회원 의견 ${Date.now()}`;
    await page.goto(`/p/${FOCUS_FLOW_SLUG}#comments`);

    const commentForm = page.locator(`form[action='/api/projects/${FOCUS_FLOW_PROJECT_ID}/comments']`).first();
    await commentForm.getByLabel("닉네임").fill("게스트 테스터");
    await commentForm.locator("textarea[name='bodyMd']").fill(guestComment);
    await waitForTurnstileToken(commentForm);
    await commentForm.getByRole("button", { name: "댓글 등록" }).click();

    await expect(page).toHaveURL(new RegExp(`/p/${FOCUS_FLOW_SLUG}`));
    await expect(page.getByText("댓글을 등록했습니다.")).toBeVisible();
    await expect(page.getByText(guestComment)).toBeVisible();
    await expect(page.getByText("게스트 테스터")).toBeVisible();
  });

  test("로그인한 member는 구조화된 feedback를 남기고 관리자 큐에서 확인할 수 있다", async ({ page }) => {
    test.setTimeout(120_000);

    const feedbackEmail = `feedbacker-${Date.now()}@example.com`;
    const feedbackTitle = `첫 사용 후기 ${Date.now()}`;

    await ensurePasswordUser(feedbackEmail, TEST_PASSWORD);
    await loginWithPassword(page, feedbackEmail, TEST_PASSWORD, `/p/${FOCUS_FLOW_SLUG}#write-feedback`);

    const feedbackForm = page.locator(`form[action='/api/projects/${FOCUS_FLOW_PROJECT_ID}/posts']`).first();
    await feedbackForm.getByLabel("제목").fill(feedbackTitle);
    await feedbackForm.getByLabel("요약").fill("첫 인상은 좋았지만 어떤 순서로 눌러야 하는지 조금 더 안내가 있으면 좋겠습니다.");
    await feedbackForm.getByLabel("상세 피드백").fill(
      "첫 카드가 왜 추천됐는지 설명이 조금 더 있으면 좋겠습니다. 그래도 실제 데이터를 바로 보여 주는 점은 확실히 강점이었습니다."
    );
    await feedbackForm.getByLabel("특히 전달하고 싶은 포인트").fill("첫 진입 맥락 설명 한 줄만 더 있으면 훨씬 자연스럽게 이해될 것 같습니다.");
    await feedbackForm.getByRole("button", { name: "피드백 등록" }).click();

    await expect(page).toHaveURL(new RegExp(`/p/${FOCUS_FLOW_SLUG}`));
    await expect(page.getByText("피드백을 등록했고 검토 대기 상태로 저장했습니다.")).toBeVisible();

    await logout(page);
    await ensurePasswordUser(TEST_ADMIN_EMAIL, TEST_PASSWORD);
    await loginWithPassword(page, TEST_ADMIN_EMAIL, TEST_PASSWORD, "/admin/moderation");
    await expect(page.getByText(feedbackTitle)).toBeVisible();
  });

  test("프로젝트 신고 폼도 Turnstile을 거쳐 정상 접수된다", async ({ page }) => {
    test.setTimeout(120_000);

    await page.goto(`/p/${FOCUS_FLOW_SLUG}`);

    const projectReportForm = page
      .locator("form[action='/api/reports']")
      .filter({ has: page.locator("input[name='targetType'][value='project']") })
      .first();

    await projectReportForm.getByRole("combobox").selectOption("broken-link");
    await projectReportForm.getByRole("textbox").fill(`신고 테스트 ${Date.now()}`);
    await waitForTurnstileToken(projectReportForm);
    await projectReportForm.getByRole("button", { name: "신고 접수" }).click();

    await expect(page.getByText("신고가 접수되었습니다.")).toBeVisible();
  });

  test("관리자 로그인으로 운영 페이지에 접근할 수 있다", async ({ page }) => {
    test.setTimeout(120_000);

    await ensurePasswordUser(TEST_ADMIN_EMAIL, TEST_PASSWORD);
    await loginWithPassword(page, TEST_ADMIN_EMAIL, TEST_PASSWORD, "/admin/moderation");

    await expect(page).toHaveURL(/\/admin\/moderation/);
    await expect(page.getByRole("heading", { name: "운영 큐" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "소유권 연결 대기" })).toBeVisible();
  });
});
