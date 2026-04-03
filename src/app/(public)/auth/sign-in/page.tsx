import Link from "next/link";
import { redirect } from "next/navigation";

import { FlashBanner } from "@/components/ui/flash-banner";
import { PageShell } from "@/components/ui/page-shell";
import { SectionHeading } from "@/components/ui/section-heading";
import { buildPasswordSetupPath, getCurrentProfile, getSupabaseLoginState } from "@/lib/auth/session";
import { ensureAbsoluteUrl } from "@/lib/utils/urls";

type SignInPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams;
  const viewer = await getCurrentProfile();
  const state = await getSupabaseLoginState();
  const next = ensureAbsoluteUrl(getValue(params.next) ?? "/me/projects");

  if (viewer) {
    if (!viewer.passwordSetAt) {
      redirect(buildPasswordSetupPath(next, { mode: "setup" }));
    }

    redirect(next);
  }

  return (
    <PageShell className="max-w-[900px]">
      <FlashBanner notice={getValue(params.notice)} error={getValue(params.error)} />

      <section className="rounded-[36px] border border-line bg-[rgba(255,253,248,0.96)] p-6 shadow-soft">
        <SectionHeading
          eyebrow="Auth"
          title="로그인"
          description="처음 한 번은 이메일 링크로 계정을 확인하고 비밀번호를 설정합니다. 이후부터는 이메일과 비밀번호로 로그인합니다."
        />

        <div className="mt-6 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          <form action="/api/auth/login" method="post" className="grid gap-4 rounded-[28px] border border-line bg-white p-5">
            <div className="space-y-1">
              <h2 className="text-base font-bold text-foreground">이메일 + 비밀번호 로그인</h2>
              <p className="text-sm leading-6 text-foreground-muted">재접속부터는 이 폼으로 바로 로그인합니다.</p>
            </div>

            <input type="hidden" name="next" value={next} />

            <label className="grid gap-2 text-sm font-semibold text-foreground">
              이메일
              <input
                type="email"
                name="email"
                required
                autoComplete="email"
                placeholder="가입한 이메일"
                className="rounded-2xl border border-line bg-white px-4 py-3 font-normal"
              />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-foreground">
              비밀번호
              <input
                type="password"
                name="password"
                required
                autoComplete="current-password"
                placeholder="설정한 비밀번호"
                className="rounded-2xl border border-line bg-white px-4 py-3 font-normal"
              />
            </label>

            <button
              disabled={!state.configured}
              className="w-fit rounded-full bg-[#111827] px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              로그인
            </button>
          </form>

          <div className="grid gap-4">
            <form action="/api/auth/start" method="post" className="grid gap-4 rounded-[28px] border border-line bg-white p-5">
              <div className="space-y-1">
                <h2 className="text-base font-bold text-foreground">처음 시작하기</h2>
                <p className="text-sm leading-6 text-foreground-muted">
                  이메일 링크를 열면 바로 비밀번호 설정 화면으로 이동합니다.
                </p>
              </div>

              <input type="hidden" name="next" value={next} />

              <label className="grid gap-2 text-sm font-semibold text-foreground">
                이메일
                <input
                  type="email"
                  name="email"
                  required
                  autoComplete="email"
                  placeholder="처음 사용할 이메일"
                  className="rounded-2xl border border-line bg-white px-4 py-3 font-normal"
                />
              </label>

              <button
                disabled={!state.configured}
                className="w-fit rounded-full border border-line bg-white px-5 py-3 text-sm font-semibold text-foreground disabled:cursor-not-allowed disabled:opacity-50"
              >
                인증 링크 보내기
              </button>
            </form>

            <form action="/api/auth/password/recovery" method="post" className="grid gap-4 rounded-[28px] border border-line bg-white p-5">
              <div className="space-y-1">
                <h2 className="text-base font-bold text-foreground">비밀번호 재설정</h2>
                <p className="text-sm leading-6 text-foreground-muted">비밀번호를 잊은 경우 재설정 링크를 메일로 보냅니다.</p>
              </div>

              <input type="hidden" name="next" value={next} />

              <label className="grid gap-2 text-sm font-semibold text-foreground">
                이메일
                <input
                  type="email"
                  name="email"
                  required
                  autoComplete="email"
                  placeholder="가입한 이메일"
                  className="rounded-2xl border border-line bg-white px-4 py-3 font-normal"
                />
              </label>

              <button
                disabled={!state.configured}
                className="w-fit rounded-full border border-line bg-white px-5 py-3 text-sm font-semibold text-foreground disabled:cursor-not-allowed disabled:opacity-50"
              >
                재설정 링크 보내기
              </button>
            </form>
          </div>
        </div>

        <div className="mt-5 rounded-[28px] border border-line bg-white p-5 text-sm leading-7 text-foreground-muted">
          {!state.configured
            ? "Supabase Auth 설정이 아직 완료되지 않아 실제 인증은 막혀 있습니다. 설정이 끝나면 이 화면에서 계정 시작, 로그인, 비밀번호 재설정까지 모두 처리할 수 있습니다."
            : "이메일 링크는 최초 계정 확인과 비밀번호 재설정에만 사용합니다. 일상 로그인 수단은 이메일과 비밀번호입니다."}
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/" className="rounded-full border border-line bg-white px-4 py-2.5 text-sm font-semibold text-foreground">
            홈으로 이동
          </Link>
          <Link href={next} className="rounded-full border border-line bg-white px-4 py-2.5 text-sm font-semibold text-foreground">
            이전 흐름으로 돌아가기
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
