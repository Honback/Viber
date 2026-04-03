import { redirect } from "next/navigation";

import { FlashBanner } from "@/components/ui/flash-banner";
import { PageShell } from "@/components/ui/page-shell";
import { SectionHeading } from "@/components/ui/section-heading";
import { buildRedirectPath } from "@/lib/http";
import { buildSignInPath, getCurrentProfile } from "@/lib/auth/session";
import { ensureAbsoluteUrl } from "@/lib/utils/urls";

type PasswordSetupPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function PasswordSetupPage({ searchParams }: PasswordSetupPageProps) {
  const params = await searchParams;
  const mode = getValue(params.mode) === "recovery" ? "recovery" : "setup";
  const next = ensureAbsoluteUrl(getValue(params.next) ?? "/me/projects");
  const viewer = await getCurrentProfile();

  if (!viewer) {
    redirect(buildSignInPath(next, "비밀번호 설정을 이어가려면 이메일 링크를 다시 열어 주세요."));
  }

  if (viewer.passwordSetAt && mode !== "recovery") {
    redirect(buildRedirectPath(next, { notice: "이미 비밀번호 설정이 완료된 계정입니다." }));
  }

  return (
    <PageShell className="max-w-[760px]">
      <FlashBanner notice={getValue(params.notice)} error={getValue(params.error)} />

      <section className="rounded-[36px] border border-line bg-[rgba(255,253,248,0.96)] p-6 shadow-soft">
        <SectionHeading
          eyebrow="Auth"
          title={mode === "recovery" ? "새 비밀번호 설정" : "비밀번호 설정"}
          description={
            mode === "recovery"
              ? "이메일 인증이 끝났습니다. 새 비밀번호를 저장하면 다시 이메일과 비밀번호로 로그인할 수 있습니다."
              : "이메일 인증이 끝났습니다. 이 계정에서 사용할 비밀번호를 설정해 주세요."
          }
        />

        <form action="/api/auth/password/setup" method="post" className="mt-6 grid gap-4 rounded-[28px] border border-line bg-white p-5">
          <input type="hidden" name="next" value={next} />
          <input type="hidden" name="mode" value={mode} />

          <div className="rounded-2xl bg-[rgba(23,32,44,0.04)] px-4 py-3 text-sm leading-6 text-foreground-muted">
            <span className="font-semibold text-foreground">{viewer.email}</span>
            <span> 계정에 연결될 비밀번호를 저장합니다.</span>
          </div>

          <label className="grid gap-2 text-sm font-semibold text-foreground">
            비밀번호
            <input
              type="password"
              name="password"
              required
              autoComplete="new-password"
              placeholder="8자 이상으로 입력"
              minLength={8}
              className="rounded-2xl border border-line bg-white px-4 py-3 font-normal"
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-foreground">
            비밀번호 확인
            <input
              type="password"
              name="confirmPassword"
              required
              autoComplete="new-password"
              placeholder="같은 비밀번호를 한 번 더 입력"
              minLength={8}
              className="rounded-2xl border border-line bg-white px-4 py-3 font-normal"
            />
          </label>

          <button className="w-fit rounded-full bg-[#111827] px-5 py-3 text-sm font-semibold text-white">
            {mode === "recovery" ? "새 비밀번호 저장" : "비밀번호 설정 완료"}
          </button>
        </form>
      </section>
    </PageShell>
  );
}
