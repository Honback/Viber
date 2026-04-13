"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { ArrowRight, Rocket } from "lucide-react";
const ACCENT = "#d76542";

/* ── scroll animation hook (callback-ref pattern for React 19) ── */
function useScrollAnimation(threshold = 0.15): [isVisible: boolean, ref: (node: HTMLDivElement | null) => void] {
  const [isVisible, setIsVisible] = useState(false);

  const ref = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(node);
          }
        },
        { threshold },
      );
      observer.observe(node);
    },
    [threshold],
  );

  return [isVisible, ref];
}

type Option = { value: string; label: string };

type SubmitPageClientProps = {
  viewer: { displayName: string; githubUsername: string | null } | null;
  verificationMethod: string;
  categoryOptions: Option[];
  platformOptions: Option[];
  pricingOptions: Option[];
  stageOptions: Option[];
};

export function SubmitPageClient({
  viewer,
  verificationMethod,
  categoryOptions,
  platformOptions,
  pricingOptions,
  stageOptions,
}: SubmitPageClientProps) {
  const [heroVisible, heroRef] = useScrollAnimation(0.1);
  const [infoVisible, infoRef] = useScrollAnimation();
  const [basicVisible, basicRef] = useScrollAnimation();
  const [linkVisible, linkRef] = useScrollAnimation();
  const [descVisible, descRef] = useScrollAnimation();
  const [ownerVisible, ownerRef] = useScrollAnimation();
  const [optionalVisible, optionalRef] = useScrollAnimation();

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* ── Hero ── */}
      <section className="bg-[#0A0A0A] px-4 pb-10 pt-16 text-center sm:pb-14 sm:pt-20">
        <div
          ref={heroRef}
          className={`mx-auto max-w-3xl transition-all duration-700 ${
            heroVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <h1
            className="text-6xl tracking-tight sm:text-7xl lg:text-8xl"
            style={{ fontFamily: "var(--font-logo), sans-serif", fontWeight: 300, color: "#d76542", letterSpacing: "0.02em" }}
          >
            Vibeollio
          </h1>
          <div className="mt-6 inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold" style={{ backgroundColor: `${ACCENT}20`, color: ACCENT }}>
            <Rocket className="h-3.5 w-3.5" /> 새 프로젝트 런치
          </div>
          <h2 className="mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl">
            프로젝트를 <span style={{ color: ACCENT }}>세상에</span> 선보이세요
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-neutral-400 sm:text-base">
            핵심 정보와 체험 링크만 입력하면 바로 커뮤니티에 공개됩니다.
          </p>
        </div>
      </section>

      {/* ── Info Cards ── */}
      <section className="bg-[#111111] px-4 py-12 sm:px-6">
        <div
          ref={infoRef}
          className={`mx-auto grid max-w-5xl gap-4 sm:grid-cols-2 transition-all duration-700 delay-100 ${
            infoVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6">
            <div className="text-sm font-semibold text-white">이 화면에서 하는 일</div>
            <ul className="mt-3 space-y-2 text-sm leading-7 text-neutral-400">
              <li className="flex items-center gap-2"><ArrowRight className="h-3 w-3 shrink-0" style={{ color: ACCENT }} /> 프로젝트 핵심 정보 입력</li>
              <li className="flex items-center gap-2"><ArrowRight className="h-3 w-3 shrink-0" style={{ color: ACCENT }} /> 바로 체험 가능한 링크 등록</li>
              <li className="flex items-center gap-2"><ArrowRight className="h-3 w-3 shrink-0" style={{ color: ACCENT }} /> {viewer ? "현재 계정에 소유권 연결" : "이메일로 소유권 연결"}</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6">
            <div className="text-sm font-semibold text-neutral-400">기존 프로젝트라면</div>
            <p className="mt-3 text-sm leading-7 text-neutral-400">
              업데이트와 피드백 요청은 여기서 받지 않습니다. owner 작업은 내 프로젝트 화면에서만 이어집니다.
            </p>
            <Link
              href={viewer ? "/me/projects" : "/auth/sign-in?next=%2Fme%2Fprojects"}
              className="mt-4 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
              style={{ backgroundColor: ACCENT }}
            >
              {viewer ? "내 프로젝트로 이동" : "로그인하고 내 프로젝트 열기"} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Form ── */}
      <section className="bg-[#0A0A0A] px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <form action="/api/submissions/project" method="post" className="space-y-6">
            <input type="hidden" name="kind" value="launch" />
            <input type="hidden" name="verificationMethod" value={verificationMethod} />
            {viewer ? <input type="hidden" name="ownerEmail" value="" /> : null}

            {/* 기본 정보 */}
            <div
              ref={basicRef}
              className={`rounded-2xl border border-neutral-800 bg-[#111111] p-6 transition-all duration-700 ${
                basicVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
              }`}
            >
              <h2 className="text-lg font-bold tracking-tight">프로젝트 기본 정보</h2>
              <p className="mt-1 text-sm text-neutral-400">카드에서 바로 읽히는 핵심 소개입니다.</p>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <label className="grid gap-2 text-sm font-semibold text-neutral-300">
                  프로젝트 이름
                  <input name="title" required className="rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 font-normal text-white outline-none transition focus:border-neutral-500 placeholder:text-neutral-500" />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-neutral-300">
                  메이커 별칭
                  <input name="makerAlias" required defaultValue={viewer?.displayName ?? ""} className="rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 font-normal text-white outline-none transition focus:border-neutral-500 placeholder:text-neutral-500" />
                </label>
              </div>

              <label className="mt-4 grid gap-2 text-sm font-semibold text-neutral-300">
                한 줄 소개
                <input name="tagline" required className="rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 font-normal text-white outline-none transition focus:border-neutral-500 placeholder:text-neutral-500" />
              </label>

              <label className="mt-4 grid gap-2 text-sm font-semibold text-neutral-300">
                짧은 설명
                <textarea name="shortDescription" rows={3} required className="rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 font-normal text-white outline-none transition focus:border-neutral-500 placeholder:text-neutral-500" />
              </label>
            </div>

            {/* 링크 & 카테고리 */}
            <div
              ref={linkRef}
              className={`rounded-2xl border border-neutral-800 bg-[#111111] p-6 transition-all duration-700 ${
                linkVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
              }`}
            >
              <h2 className="text-lg font-bold tracking-tight">바로 눌러볼 링크</h2>
              <p className="mt-1 text-sm text-neutral-400">이 프로젝트를 체험할 기본 링크입니다.</p>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <label className="grid gap-2 text-sm font-semibold text-neutral-300 md:col-span-2">
                  Live URL
                  <input type="url" name="liveUrl" required className="rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 font-normal text-white outline-none transition focus:border-neutral-500 placeholder:text-neutral-500" />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-neutral-300">
                  카테고리
                  <select name="category" defaultValue={categoryOptions[0]?.value} className="rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 font-normal text-white outline-none">
                    {categoryOptions.map((item) => (
                      <option key={item.value} value={item.value}>{item.label}</option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-2 text-sm font-semibold text-neutral-300">
                  플랫폼
                  <select name="platform" defaultValue="web" className="rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 font-normal text-white outline-none">
                    {platformOptions.map((item) => (
                      <option key={item.value} value={item.value}>{item.label}</option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-2 text-sm font-semibold text-neutral-300">
                  상태
                  <select name="stage" defaultValue="beta" className="rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 font-normal text-white outline-none">
                    {stageOptions.map((item) => (
                      <option key={item.value} value={item.value}>{item.label}</option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-2 text-sm font-semibold text-neutral-300">
                  가격 모델
                  <select name="pricingModel" defaultValue="free" className="rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 font-normal text-white outline-none">
                    {pricingOptions.map((item) => (
                      <option key={item.value} value={item.value}>{item.label}</option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            {/* 프로젝트 설명 */}
            <div
              ref={descRef}
              className={`rounded-2xl border border-neutral-800 bg-[#111111] p-6 transition-all duration-700 ${
                descVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
              }`}
            >
              <h2 className="text-lg font-bold tracking-tight">무엇을 하는 프로젝트인가요?</h2>
              <p className="mt-1 text-sm text-neutral-400">상세 페이지에서 읽히는 핵심 설명입니다.</p>

              <label className="mt-6 grid gap-2 text-sm font-semibold text-neutral-300">
                무엇인지
                <textarea name="overviewMd" rows={4} required className="rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 font-normal text-white outline-none transition focus:border-neutral-500 placeholder:text-neutral-500" />
              </label>
              <label className="mt-4 grid gap-2 text-sm font-semibold text-neutral-300">
                어떤 문제를 푸는지
                <textarea name="problemMd" rows={4} required className="rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 font-normal text-white outline-none transition focus:border-neutral-500 placeholder:text-neutral-500" />
              </label>
              <label className="mt-4 grid gap-2 text-sm font-semibold text-neutral-300">
                누구를 위한 것인지
                <textarea name="targetUsersMd" rows={4} required className="rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 font-normal text-white outline-none transition focus:border-neutral-500 placeholder:text-neutral-500" />
              </label>
            </div>

            {/* 소유권 */}
            <div
              ref={ownerRef}
              className={`rounded-2xl border border-neutral-800 bg-[#111111] p-6 transition-all duration-700 ${
                ownerVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
              }`}
            >
              <h2 className="text-lg font-bold tracking-tight">소유권 연결</h2>
              <p className="mt-1 text-sm text-neutral-400">나중에 수정하고 업데이트를 올릴 계정을 연결합니다.</p>

              {viewer ? (
                <div className="mt-6 rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-4 text-sm leading-7 text-neutral-400">
                  현재 계정 <strong className="text-white">{viewer.displayName}</strong>
                  {viewer.githubUsername ? " 이 owner로 바로 연결됩니다." : " 이 owner로 연결됩니다."}
                </div>
              ) : (
                <label className="mt-6 grid gap-2 text-sm font-semibold text-neutral-300">
                  소유권 이메일
                  <input
                    type="email"
                    name="ownerEmail"
                    required
                    placeholder="claim 링크를 받을 이메일"
                    className="rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 font-normal text-white outline-none transition focus:border-neutral-500 placeholder:text-neutral-500"
                  />
                </label>
              )}
            </div>

            {/* 선택 입력 */}
            <div
              ref={optionalRef}
              className={`transition-all duration-700 ${
                optionalVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
              }`}
            >
              <details className="rounded-2xl border border-neutral-800 bg-[#111111] p-6">
                <summary className="cursor-pointer text-sm font-semibold text-white">선택 입력 열기</summary>
                <div className="mt-6 grid gap-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="grid gap-2 text-sm font-semibold text-neutral-300">
                      GitHub URL
                      <input type="url" name="githubUrl" className="rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 font-normal text-white outline-none transition focus:border-neutral-500 placeholder:text-neutral-500" />
                    </label>
                    <label className="grid gap-2 text-sm font-semibold text-neutral-300">
                      Demo URL
                      <input type="url" name="demoUrl" className="rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 font-normal text-white outline-none transition focus:border-neutral-500 placeholder:text-neutral-500" />
                    </label>
                    <label className="grid gap-2 text-sm font-semibold text-neutral-300">
                      Docs URL
                      <input type="url" name="docsUrl" className="rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 font-normal text-white outline-none transition focus:border-neutral-500 placeholder:text-neutral-500" />
                    </label>
                    <label className="grid gap-2 text-sm font-semibold text-neutral-300">
                      가격 메모
                      <input name="pricingNote" placeholder="예: 개인 무료, 팀 플랜 부분 유료" className="rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 font-normal text-white outline-none transition focus:border-neutral-500 placeholder:text-neutral-500" />
                    </label>
                  </div>

                  <label className="grid gap-2 text-sm font-semibold text-neutral-300">
                    왜 만들었는지
                    <textarea name="whyMadeMd" rows={4} className="rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 font-normal text-white outline-none transition focus:border-neutral-500 placeholder:text-neutral-500" />
                  </label>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="grid gap-2 text-sm font-semibold text-neutral-300">
                      대표 이미지 URL
                      <input name="coverImageUrl" placeholder="비워두면 기본 포스터를 생성합니다." className="rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 font-normal text-white outline-none transition focus:border-neutral-500 placeholder:text-neutral-500" />
                    </label>
                    <label className="grid gap-2 text-sm font-semibold text-neutral-300">
                      갤러리 이미지 URL들
                      <input name="galleryCsv" placeholder="쉼표로 구분" className="rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 font-normal text-white outline-none transition focus:border-neutral-500 placeholder:text-neutral-500" />
                    </label>
                    <label className="grid gap-2 text-sm font-semibold text-neutral-300">
                      태그
                      <input name="tagCsv" placeholder="예: web, beta, open-source" className="rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 font-normal text-white outline-none transition focus:border-neutral-500 placeholder:text-neutral-500" />
                    </label>
                    <label className="grid gap-2 text-sm font-semibold text-neutral-300">
                      사용한 AI 도구
                      <input name="aiToolsCsv" placeholder="예: GPT-5.4, Cursor, Claude" className="rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 font-normal text-white outline-none transition focus:border-neutral-500 placeholder:text-neutral-500" />
                    </label>
                  </div>

                  <div className="flex flex-wrap gap-4 rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-4 text-sm text-neutral-300">
                    <label className="inline-flex items-center gap-2">
                      <input type="checkbox" name="isOpenSource" className="accent-[#d76542]" />
                      오픈소스
                    </label>
                    <label className="inline-flex items-center gap-2">
                      <input type="checkbox" name="noSignupRequired" className="accent-[#d76542]" />
                      가입 없이 체험 가능
                    </label>
                    <label className="inline-flex items-center gap-2">
                      <input type="checkbox" name="isSoloMaker" className="accent-[#d76542]" />
                      1인 메이커
                    </label>
                  </div>
                </div>
              </details>

              {/* 제출 버튼 */}
              <div className="mt-6 flex flex-wrap gap-3">
                <button className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90" style={{ backgroundColor: ACCENT }}>
                  런치 제출 <ArrowRight className="h-4 w-4" />
                </button>
                <Link href="/policy/content" className="rounded-full border border-neutral-700 px-6 py-3 text-sm font-semibold text-neutral-300 transition hover:border-neutral-500">
                  운영 정책 보기
                </Link>
                {viewer ? (
                  <Link href="/me/projects" className="rounded-full border border-neutral-700 px-6 py-3 text-sm font-semibold text-neutral-300 transition hover:border-neutral-500">
                    내 프로젝트로 이동
                  </Link>
                ) : null}
              </div>
            </div>
          </form>
        </div>
      </section>

    </div>
  );
}
