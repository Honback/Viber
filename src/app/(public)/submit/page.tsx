import Link from "next/link";

import { FlashBanner } from "@/components/ui/flash-banner";
import { PageShell } from "@/components/ui/page-shell";
import { SectionHeading } from "@/components/ui/section-heading";
import { TurnstileField } from "@/components/forms/turnstile-field";
import { categoryOptions, platformOptions, pricingOptions, stageOptions } from "@/lib/constants";
import { getCurrentProfile } from "@/lib/auth/session";
import { isTurnstileUsingTestKeys, turnstileSiteKey } from "@/lib/env";
import { projectMediaAccept, projectMediaMaxFileSizeLabel } from "@/lib/storage/project-media";

type SubmitPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function SubmitPage({ searchParams }: SubmitPageProps) {
  const params = await searchParams;
  const viewer = await getCurrentProfile();
  const verificationMethod = viewer?.githubUsername ? "github" : "email";

  return (
    <PageShell>
      <FlashBanner notice={getValue(params.notice)} error={getValue(params.error)} />

      <section className="grid gap-6 rounded-[36px] border border-line bg-[rgba(255,253,248,0.96)] p-6 shadow-soft lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-4">
          <div className="inline-flex rounded-full bg-[rgba(47,106,97,0.1)] px-4 py-2 text-sm font-semibold text-green">Launch only</div>
          <div className="space-y-3">
            <h1 className="text-[clamp(2.2rem,4vw,3.5rem)] font-extrabold tracking-tight text-foreground">새 프로젝트 런치</h1>
            <p className="max-w-2xl text-base leading-8 text-foreground-muted">
              이 화면은 신규 프로젝트 공개만 받습니다. 실제로 눌러볼 수 있는 링크와 핵심 설명만 먼저 입력하고, 선택 정보는 아래에서 필요할 때만 열어 쓰면 됩니다.
            </p>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-[28px] border border-line bg-white p-5">
            <div className="text-sm font-semibold text-foreground">이 화면에서 하는 일</div>
            <ul className="mt-3 space-y-2 text-sm leading-7 text-foreground-muted">
              <li>프로젝트 핵심 정보 입력</li>
              <li>바로 체험 가능한 링크 등록</li>
              <li>{viewer ? "현재 계정에 소유권 연결" : "이메일로 소유권 연결"}</li>
            </ul>
          </div>
          <div className="rounded-[28px] border border-line bg-[#111827] p-5 text-white">
            <div className="text-sm font-semibold text-white/70">기존 프로젝트라면</div>
            <p className="mt-3 text-sm leading-7 text-white/90">
              업데이트와 피드백 요청은 여기서 받지 않습니다. owner 작업은 내 프로젝트 화면에서만 이어집니다.
            </p>
            <Link
              href={viewer ? "/me/projects" : "/auth/sign-in?next=%2Fme%2Fprojects"}
              className="mt-4 inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-foreground"
            >
              {viewer ? "내 프로젝트로 이동" : "로그인하고 내 프로젝트 열기"}
            </Link>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeading
          eyebrow="새 프로젝트"
          title="핵심 정보만 먼저 입력"
          description="필수 정보만 먼저 보이게 두고, 추가 링크와 미디어는 아래 선택 입력에서 열 수 있게 구성했습니다."
        />

        <form action="/api/submissions/project" method="post" encType="multipart/form-data" className="grid gap-6 rounded-[36px] border border-line bg-[rgba(255,253,248,0.96)] p-6 shadow-soft">
          <input type="hidden" name="kind" value="launch" />
          <input type="hidden" name="verificationMethod" value={verificationMethod} />
          {viewer ? <input type="hidden" name="ownerEmail" value="" /> : null}

          <section className="grid gap-4 rounded-[28px] border border-line bg-white p-5">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-foreground">프로젝트 기본 정보</h2>
              <p className="mt-1 text-sm text-foreground-muted">카드에서 바로 읽히는 핵심 소개입니다.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold text-foreground">
                프로젝트 이름
                <input name="title" required className="rounded-2xl border border-line bg-white px-4 py-3 font-normal" />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-foreground">
                메이커 별칭
                <input name="makerAlias" required defaultValue={viewer?.displayName ?? ""} className="rounded-2xl border border-line bg-white px-4 py-3 font-normal" />
              </label>
            </div>

            <label className="grid gap-2 text-sm font-semibold text-foreground">
              한 줄 소개
              <input name="tagline" required className="rounded-2xl border border-line bg-white px-4 py-3 font-normal" />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-foreground">
              짧은 설명
              <textarea name="shortDescription" rows={3} required className="rounded-3xl border border-line bg-white px-4 py-3 font-normal" />
            </label>
          </section>

          <section className="grid gap-4 rounded-[28px] border border-line bg-white p-5">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-foreground">바로 눌러볼 링크</h2>
              <p className="mt-1 text-sm text-foreground-muted">이 프로젝트를 체험할 기본 링크입니다.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold text-foreground md:col-span-2">
                Live URL
                <input type="url" name="liveUrl" required className="rounded-2xl border border-line bg-white px-4 py-3 font-normal" />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-foreground">
                카테고리
                <select name="category" defaultValue={categoryOptions[0]?.value} className="rounded-2xl border border-line bg-white px-4 py-3 font-normal">
                  {categoryOptions.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-semibold text-foreground">
                플랫폼
                <select name="platform" defaultValue="web" className="rounded-2xl border border-line bg-white px-4 py-3 font-normal">
                  {platformOptions.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-semibold text-foreground">
                상태
                <select name="stage" defaultValue="beta" className="rounded-2xl border border-line bg-white px-4 py-3 font-normal">
                  {stageOptions.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-semibold text-foreground">
                가격 모델
                <select name="pricingModel" defaultValue="free" className="rounded-2xl border border-line bg-white px-4 py-3 font-normal">
                  {pricingOptions.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </section>

          <section className="grid gap-4 rounded-[28px] border border-line bg-white p-5">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-foreground">무엇을 하는 프로젝트인가요?</h2>
              <p className="mt-1 text-sm text-foreground-muted">상세 페이지에서 읽히는 핵심 설명입니다.</p>
            </div>

            <label className="grid gap-2 text-sm font-semibold text-foreground">
              무엇인지
              <textarea name="overviewMd" rows={4} required className="rounded-3xl border border-line bg-white px-4 py-3 font-normal" />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-foreground">
              어떤 문제를 푸는지
              <textarea name="problemMd" rows={4} required className="rounded-3xl border border-line bg-white px-4 py-3 font-normal" />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-foreground">
              누구를 위한 것인지
              <textarea name="targetUsersMd" rows={4} required className="rounded-3xl border border-line bg-white px-4 py-3 font-normal" />
            </label>
          </section>

          <section className="grid gap-4 rounded-[28px] border border-line bg-white p-5">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-foreground">소유권 연결</h2>
              <p className="mt-1 text-sm text-foreground-muted">나중에 수정하고 업데이트를 올릴 계정을 연결합니다.</p>
            </div>

            {viewer ? (
              <div className="rounded-3xl border border-line bg-surface px-4 py-4 text-sm leading-7 text-foreground-muted">
                현재 계정 <strong className="text-foreground">{viewer.displayName}</strong>
                {viewer.githubUsername ? " 이 owner로 바로 연결됩니다." : " 이 owner로 연결됩니다."}
              </div>
            ) : (
              <label className="grid gap-2 text-sm font-semibold text-foreground">
                소유권 이메일
                <input
                  type="email"
                  name="ownerEmail"
                  required
                  placeholder="claim 링크를 받을 이메일"
                  className="rounded-2xl border border-line bg-white px-4 py-3 font-normal"
                />
              </label>
            )}
          </section>

          <details className="rounded-[28px] border border-line bg-white p-5">
            <summary className="cursor-pointer text-sm font-semibold text-foreground">선택 입력 열기</summary>
            <div className="mt-5 grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2 text-sm font-semibold text-foreground">
                  GitHub URL
                  <input type="url" name="githubUrl" className="rounded-2xl border border-line bg-white px-4 py-3 font-normal" />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-foreground">
                  Demo URL
                  <input type="url" name="demoUrl" className="rounded-2xl border border-line bg-white px-4 py-3 font-normal" />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-foreground">
                  Docs URL
                  <input type="url" name="docsUrl" className="rounded-2xl border border-line bg-white px-4 py-3 font-normal" />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-foreground">
                  가격 메모
                  <input name="pricingNote" className="rounded-2xl border border-line bg-white px-4 py-3 font-normal" placeholder="예: 개인 무료, 팀 플랜 부분 유료" />
                </label>
              </div>

              <label className="grid gap-2 text-sm font-semibold text-foreground">
                왜 만들었는지
                <textarea name="whyMadeMd" rows={4} className="rounded-3xl border border-line bg-white px-4 py-3 font-normal" />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                {viewer ? (
                  <>
                    <label className="grid gap-2 text-sm font-semibold text-foreground">
                      대표 이미지 파일
                      <input type="file" name="coverImageFile" accept={projectMediaAccept} className="rounded-2xl border border-line bg-white px-4 py-3 font-normal" />
                      <span className="text-xs font-normal text-foreground-muted">JPG, PNG, WEBP, GIF · 최대 {projectMediaMaxFileSizeLabel}</span>
                    </label>
                    <label className="grid gap-2 text-sm font-semibold text-foreground">
                      갤러리 이미지 파일들
                      <input type="file" name="galleryFiles" accept={projectMediaAccept} multiple className="rounded-2xl border border-line bg-white px-4 py-3 font-normal" />
                      <span className="text-xs font-normal text-foreground-muted">최대 5개까지 업로드할 수 있습니다.</span>
                    </label>
                  </>
                ) : (
                  <div className="md:col-span-2 rounded-3xl border border-line bg-surface px-4 py-4 text-sm leading-7 text-foreground-muted">
                    이미지 파일 업로드는 로그인한 멤버만 사용할 수 있습니다. 비회원 제출은 아래 URL 입력 또는 기본 포스터 생성으로 진행됩니다.
                  </div>
                )}
                <label className="grid gap-2 text-sm font-semibold text-foreground">
                  대표 이미지 URL
                  <input name="coverImageUrl" className="rounded-2xl border border-line bg-white px-4 py-3 font-normal" placeholder="비워두면 기본 포스터를 생성합니다." />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-foreground">
                  갤러리 이미지 URL들
                  <input name="galleryCsv" className="rounded-2xl border border-line bg-white px-4 py-3 font-normal" placeholder="쉼표로 구분" />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-foreground">
                  태그
                  <input name="tagCsv" className="rounded-2xl border border-line bg-white px-4 py-3 font-normal" placeholder="예: web, beta, open-source" />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-foreground">
                  사용한 AI 도구
                  <input name="aiToolsCsv" className="rounded-2xl border border-line bg-white px-4 py-3 font-normal" placeholder="예: GPT-5.4, Cursor, Claude" />
                </label>
              </div>

              <div className="flex flex-wrap gap-4 rounded-3xl border border-line bg-surface px-4 py-4 text-sm text-foreground">
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" name="isOpenSource" />
                  오픈소스
                </label>
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" name="noSignupRequired" />
                  가입 없이 체험 가능
                </label>
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" name="isSoloMaker" />
                  1인 메이커
                </label>
              </div>
            </div>
          </details>

          <section className="grid gap-4 rounded-[28px] border border-line bg-white p-5">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-foreground">스팸 방지 확인</h2>
              <p className="mt-1 text-sm text-foreground-muted">
                자동 제출을 막기 위해 프로젝트 제출 전 사람 확인을 거칩니다.
                {isTurnstileUsingTestKeys ? " 현재 로컬에서는 Cloudflare 공식 테스트 키를 사용합니다." : ""}
              </p>
            </div>
            <TurnstileField siteKey={turnstileSiteKey} />
          </section>

          <div className="flex flex-wrap gap-3">
            <button className="rounded-full bg-[#111827] px-5 py-3 text-sm font-semibold text-white">런치 제출</button>
            <Link href="/policy/content" className="rounded-full border border-line bg-white px-5 py-3 text-sm font-semibold text-foreground">
              운영 정책 보기
            </Link>
            {viewer ? (
              <Link href="/me/projects" className="rounded-full border border-line bg-white px-5 py-3 text-sm font-semibold text-foreground">
                내 프로젝트로 이동
              </Link>
            ) : null}
          </div>
        </form>
      </section>
    </PageShell>
  );
}
