import Link from "next/link";

import { FlashBanner } from "@/components/ui/flash-banner";
import { PageShell } from "@/components/ui/page-shell";
import { SectionHeading } from "@/components/ui/section-heading";
import { getCurrentProfile } from "@/lib/auth/session";
import { reviewClaimToken } from "@/lib/services/mutations";

type ClaimPageProps = {
  params: Promise<{ token: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ClaimPage({ params, searchParams }: ClaimPageProps) {
  const { token } = await params;
  const query = await searchParams;
  const viewer = await getCurrentProfile();
  const claim = await reviewClaimToken(token);

  return (
    <PageShell className="max-w-[840px]">
      <FlashBanner notice={getValue(query.notice)} error={getValue(query.error)} />

      <section className="rounded-[36px] border border-line bg-[rgba(255,253,248,0.96)] p-6 shadow-soft">
        <SectionHeading eyebrow="소유권" title="프로젝트 수정권 연결" description="이 프로젝트를 현재 계정과 연결해 나중에 수정할 수 있게 합니다." />

        <div className="mt-6 space-y-5">
          {!claim ? (
            <div className="rounded-[28px] border border-dashed border-line bg-white/80 px-5 py-5 text-sm leading-7 text-foreground-muted">
              이 연결 링크는 유효하지 않거나 만료되었습니다. 아직 공개 전 상태라면 같은 이메일로 다시 제출해 새 링크를 받아 주세요.
            </div>
          ) : (
            <>
              <div className="rounded-[28px] border border-line bg-white p-5">
                <div className="text-sm text-foreground-muted">연결 대상 프로젝트</div>
                <div className="mt-2 text-2xl font-extrabold tracking-tight text-foreground">{claim.title}</div>
                <div className="mt-2 text-sm text-foreground-muted">slug: /p/{claim.slug}</div>
              </div>

              {viewer ? (
                <form action={`/api/claim/${token}`} method="post" className="grid gap-3">
                  <input type="hidden" name="redirectTo" value="/me/projects" />
                  <div className="rounded-[28px] border border-line bg-white p-5 text-sm leading-7 text-foreground-muted">
                    현재 계정 <strong className="text-foreground">{viewer.displayName}</strong> 에 이 프로젝트의 primary owner 권한을 연결합니다.
                  </div>
                  <button className="w-fit rounded-full bg-[#111827] px-5 py-3 text-sm font-semibold text-white">이 계정으로 소유권 연결</button>
                </form>
              ) : (
                <div className="rounded-[28px] border border-line bg-white p-5 text-sm leading-7 text-foreground-muted">
                  소유권 연결에는 로그인 세션이 필요합니다. 로그인한 뒤 다시 이 페이지를 열면 연결 버튼이 표시됩니다.
                  <div className="mt-4">
                    <Link
                      href={`/auth/sign-in?next=${encodeURIComponent(`/claim/${token}`)}`}
                      className="inline-flex rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-foreground"
                    >
                      로그인하기
                    </Link>
                  </div>
                </div>
              )}

              <Link href={`/p/${claim.slug}`} className="inline-flex rounded-full border border-line bg-white px-5 py-3 text-sm font-semibold text-foreground">
                프로젝트 미리 보기
              </Link>
            </>
          )}
        </div>
      </section>
    </PageShell>
  );
}
