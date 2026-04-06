"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useVariantNav } from "../landing-variant-switcher";
import { useLocale } from "@/lib/i18n/locale-context";
import {
  Triangle,
  MousePointerClick,
  Star,
  Sparkles,
  Clock,
  Github,
  Twitter,
} from "lucide-react";

/* ── palette ── */
const ACCENT = "#d76542";


/* ── scroll animation hook ── */
function useScrollAnimation(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
}

/* ── category colors ── */
const CATEGORY_COLORS: Record<string, string> = {
  ai: "#8B5CF6",
  tool: "#F59E0B",
  web: "#06B6D4",
  game: "#EC4899",
  api: "#3B82F6",
  service: "#10B981",
  saas: "#6366F1",
  data: "#14B8A6",
  music: "#A855F7",
  devtool: "#EF4444",
};

/* ── 17 dummy projects ── */
const DUMMY_PROJECTS = [
  { title: "VibeAI", icon: "", category: "ai", tagline: "자연어로 대화하며 아이디어를 코드로 변환하는 AI 페어 프로그래머", tries: 3420, votes: 892, score: 4.8, feedbackQuestion: "AI 응답 속도와 코드 품질에 대한 의견을 주세요", createdAt: "2026-03-28" },
  { title: "SnapDeploy", icon: "", category: "tool", tagline: "Git push 한 번으로 자동 빌드/배포까지 완료하는 원클릭 CI/CD", tries: 2180, votes: 654, score: 4.6, feedbackQuestion: "배포 파이프라인 설정 UX가 직관적인지 테스트해주세요", createdAt: "2026-03-28" },
  { title: "PixelForge", icon: "", category: "web", tagline: "브라우저에서 바로 픽셀아트를 그리고 공유하는 온라인 에디터", tries: 1890, votes: 523, score: 4.5, feedbackQuestion: "레이어 기능과 내보내기 품질에 대한 피드백 부탁드립니다", createdAt: "2026-03-27" },
  { title: "DataPulse", icon: "", category: "data", tagline: "실시간 데이터 스트림을 시각화하는 대시보드 빌더", tries: 1650, votes: 487, score: 4.4, feedbackQuestion: "차트 렌더링 속도와 커스터마이징 옵션에 대해 알려주세요", createdAt: "2026-03-27" },
  { title: "IndieCraft", icon: "", category: "game", tagline: "노코드로 2D 인디 게임을 만들고 웹에 퍼블리싱하는 플랫폼", tries: 1420, votes: 412, score: 4.3, feedbackQuestion: "게임 에디터의 사용성에 대한 의견을 주세요", createdAt: "2026-03-26" },
  { title: "FormFlow", icon: "", category: "tool", tagline: "드래그앤드롭으로 폼을 만들고 자동 검증까지 처리하는 폼 빌더", tries: 1380, votes: 398, score: 4.2, feedbackQuestion: "폼 검증 로직이 충분한지 확인해주세요", createdAt: "2026-03-26" },
  { title: "NightOwl", icon: "", category: "web", tagline: "다크모드 전용 컴포넌트 라이브러리와 테마 미리보기 도구", tries: 1210, votes: 356, score: 4.1, feedbackQuestion: "컴포넌트 종류와 커스터마이징이 충분한가요?", createdAt: "2026-03-25" },
  { title: "CodeBridge", icon: "", category: "devtool", tagline: "프론트/백엔드 API 스키마를 자동 동기화하는 타입세이프 브릿지", tries: 1150, votes: 334, score: 4.0, feedbackQuestion: "스키마 동기화 정확도에 대한 의견을 주세요", createdAt: "2026-03-25" },
  { title: "MarkdownPro", icon: "", category: "tool", tagline: "실시간 협업이 가능한 마크다운 에디터 + 미리보기 + 내보내기", tries: 1080, votes: 312, score: 3.9, feedbackQuestion: "협업 기능의 안정성을 테스트해주세요", createdAt: "2026-03-24" },
  { title: "BotFactory", icon: "", category: "ai", tagline: "챗봇을 5분 만에 만들어 슬랙/디스코드에 배포하는 봇 빌더", tries: 980, votes: 289, score: 3.8, feedbackQuestion: "봇 빌더의 템플릿이 다양한지 확인해주세요", createdAt: "2026-03-24" },
  { title: "TinyAnalytics", icon: "", category: "saas", tagline: "가볍고 프라이버시 친화적인 웹 분석 도구 (쿠키 없음)", tries: 920, votes: 267, score: 3.7, feedbackQuestion: "분석 대시보드의 데이터 정확도를 확인해주세요", createdAt: "2026-03-23" },
  { title: "SoundScape", icon: "", category: "music", tagline: "AI가 분위기에 맞는 배경음악을 생성해주는 사운드 디자인 앱", tries: 870, votes: 245, score: 3.6, feedbackQuestion: "생성된 음악의 품질에 대한 의견을 주세요", createdAt: "2026-03-23" },
  { title: "QuizMaker", icon: "", category: "web", tagline: "인터랙티브 퀴즈를 만들고 결과를 공유하는 퀴즈 플랫폼", tries: 810, votes: 234, score: 3.5, feedbackQuestion: "퀴즈 제작 UI가 직관적인지 테스트해주세요", createdAt: "2026-03-22" },
  { title: "LogStream", icon: "", category: "devtool", tagline: "서버 로그를 실시간 스트리밍하고 필터링하는 모니터링 대시보드", tries: 760, votes: 212, score: 3.4, feedbackQuestion: "로그 필터링과 검색 기능의 성능을 테스트해주세요", createdAt: "2026-03-22" },
  { title: "GitNotify", icon: "", category: "tool", tagline: "GitHub 이벤트를 슬랙/텔레그램으로 실시간 알림해주는 봇", tries: 720, votes: 198, score: 3.3, feedbackQuestion: "알림 설정과 필터링이 충분한지 확인해주세요", createdAt: "2026-03-21" },
  { title: "PaletteAI", icon: "", category: "ai", tagline: "브랜드 키워드를 입력하면 AI가 완벽한 컬러 팔레트를 생성", tries: 680, votes: 187, score: 3.2, feedbackQuestion: "생성된 팔레트의 조화에 대한 의견을 주세요", createdAt: "2026-03-21" },
  { title: "MicroSaaS", icon: "", category: "saas", tagline: "마이크로 SaaS 아이디어 검증부터 랜딩페이지 생성까지 올인원 도구", tries: 640, votes: 176, score: 3.1, feedbackQuestion: "아이디어 검증 프로세스가 유용한지 테스트해주세요", createdAt: "2026-03-20" },
];

function CategoryBadge({ category }: { category: string }) {
  const color = CATEGORY_COLORS[category] ?? "#6B7280";
  return (
    <span
      className="rounded-md px-2 py-0.5 text-[10px] font-bold uppercase"
      style={{ backgroundColor: `${color}18`, color }}
    >
      {category}
    </span>
  );
}

/* ── group by date ── */
function groupByDate(projects: typeof DUMMY_PROJECTS) {
  const groups: Record<string, typeof DUMMY_PROJECTS> = {};
  for (const p of projects) {
    const dateKey = p.createdAt;
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(p);
  }
  // sort keys descending
  return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
}

function formatDateLabel(dateStr: string) {
  const d = new Date(dateStr);
  const today = new Date("2026-03-29");
  const diffDays = Math.floor((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "오늘";
  if (diffDays === 1) return "어제";
  if (diffDays <= 7) return `${diffDays}일 전`;
  return d.toLocaleDateString("ko-KR", { month: "long", day: "numeric" });
}

/* ══════════════════════════════════════════ */

export function FeatureNew() {
  const { subPage, navigate } = useVariantNav();
  const { t } = useLocale();

  const V2_NAV = [
    { page: "home" as const, label: t.nav.home },
    { page: "products" as const, label: t.nav.products },
    { page: "trending" as const, label: t.nav.trending },
    { page: "new" as const, label: t.nav.new },
    { page: "feedback" as const, label: t.nav.feedback },
  ];

  const heroAnim = useScrollAnimation(0.1);
  const timelineAnim = useScrollAnimation();
  const ctaAnim = useScrollAnimation();

  const dateGroups = groupByDate(DUMMY_PROJECTS);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 border-b border-neutral-800 bg-[#0A0A0A]/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-4 px-4 sm:px-6">
          <button onClick={() => navigate("home")} className="flex items-center gap-1.5 text-lg font-bold" style={{ color: ACCENT }}>
            Viber
          </button>
          <nav className="flex items-center gap-1">
            {V2_NAV.map((item) => {
              const isActive = subPage === item.page;
              return (
                <button
                  key={item.page}
                  onClick={() => navigate(item.page)}
                  className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
                    isActive
                      ? "text-white"
                      : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
                  }`}
                  style={isActive ? { backgroundColor: ACCENT } : undefined}
                >
                  {item.label}
                </button>
              );
            })}
            <Link href="/blog" className="rounded-full px-3.5 py-1.5 text-sm font-semibold transition hover:opacity-80" style={{ color: "#ccc" }}>
              {t.nav.blog}
            </Link>
            <Link href="/submit" className="rounded-full px-3.5 py-1.5 text-sm font-semibold text-white transition hover:opacity-90" style={{ backgroundColor: ACCENT }}>
              {t.nav.submit}
            </Link>
          </nav>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <Link href="/auth/sign-in" className="rounded-full px-4 py-2 text-sm font-semibold text-white" style={{ backgroundColor: ACCENT }}>
              {t.nav.login}
            </Link>
          </div>
        </div>
      </header>

      {/* ── Gradient Hero ── */}
      <section className="relative overflow-hidden bg-[#0A0A0A] px-4 pb-10 pt-12 text-center sm:pb-14 sm:pt-16">
        <div
          ref={heroAnim.ref}
          className={`relative mx-auto max-w-3xl transition-all duration-700 ${
            heroAnim.isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <h1 className="text-6xl font-extrabold tracking-tight sm:text-7xl lg:text-8xl">
            Viber
          </h1>
          <span
            className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-neutral-800 px-4 py-1.5 text-xs font-semibold"
            style={{ color: ACCENT }}
          >
            <Sparkles className="h-3.5 w-3.5" /> 신규 프로젝트
          </span>
          <h2 className="mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl">
            <span style={{ color: ACCENT }}>새로 등록된</span> 프로젝트
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-neutral-400 sm:text-base">
            매일 새롭게 등록되는 프로젝트를 가장 먼저 만나보세요.
          </p>

          <div className="mt-6 flex items-center justify-center gap-4 text-sm text-neutral-400">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4" style={{ color: ACCENT }} />
              최신순 정렬
            </span>
            <span className="h-4 w-px bg-neutral-700" />
            <span>{DUMMY_PROJECTS.length}개 프로젝트</span>
          </div>
        </div>
      </section>

      {/* ── Timeline ── */}
      <section className="bg-[#111111] px-4 py-16 sm:px-6">
        <div
          ref={timelineAnim.ref}
          className={`mx-auto max-w-4xl transition-all duration-700 delay-100 ${
            timelineAnim.isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          {dateGroups.map(([date, projects], gi) => (
            <div key={date} className={gi > 0 ? "mt-12" : ""}>
              {/* date header */}
              <div className="flex items-center gap-3">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-800"
                >
                  <Clock className="h-4 w-4" style={{ color: ACCENT }} />
                </div>
                <h3 className="text-lg font-bold">{formatDateLabel(date)}</h3>
                <span className="text-xs text-neutral-400">{date}</span>
                <span
                  className="rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white"
                  style={{ backgroundColor: ACCENT }}
                >
                  {projects.length}개
                </span>
              </div>

              {/* timeline line + cards */}
              <div className="ml-4 mt-4 border-l-2 border-neutral-800 pl-8">
                <div className="space-y-4">
                  {projects.map((p, i) => {
                    const isNew = gi === 0; // first date group = newest
                    return (
                      <div
                        key={i}
                        className="group relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/50 p-5 transition hover:-translate-y-1 hover:border-neutral-600"
                      >
                        {/* timeline dot */}
                        <div
                          className="absolute -left-[2.55rem] top-6 h-3 w-3 rounded-full border-2 border-[#0A0A0A]"
                          style={{ backgroundColor: ACCENT }}
                        />

                        <div className="flex items-start gap-4">
                          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-neutral-800 text-2xl">
                            {p.icon}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="truncate text-base font-bold">{p.title}</h4>
                              <CategoryBadge category={p.category} />
                              {isNew && (
                                <span
                                  className="rounded-full bg-green-900/30 px-2 py-0.5 text-[10px] font-bold text-green-400"
                                >
                                  NEW
                                </span>
                              )}
                            </div>
                            <p className="mt-1 line-clamp-2 text-sm leading-5 text-neutral-400">
                              {p.tagline}
                            </p>

                            <div className="mt-3 flex items-center gap-4 text-xs text-neutral-400">
                              <span className="inline-flex items-center gap-1">
                                <MousePointerClick className="h-3 w-3" style={{ color: ACCENT }} />
                                {p.tries.toLocaleString()} Tries
                              </span>
                              <span className="inline-flex items-center gap-1" style={{ color: ACCENT }}>
                                <Triangle className="h-3 w-3" fill={ACCENT} />
                                {p.votes}
                              </span>
                              <span className="inline-flex items-center gap-0.5">
                                <Star className="h-3 w-3" fill="#FBBF24" stroke="#FBBF24" strokeWidth={1.5} />
                                <span className="font-semibold text-neutral-400">{p.score}</span>
                              </span>
                            </div>
                          </div>

                          <span
                            className="shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold text-white transition group-hover:opacity-90"
                            style={{ backgroundColor: ACCENT }}
                          >
                            Try
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-[#0A0A0A] px-4 py-16 sm:px-6">
        <div
          ref={ctaAnim.ref}
          className={`mx-auto max-w-5xl transition-all duration-700 delay-100 ${
            ctaAnim.isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <div className="rounded-3xl border border-neutral-800 bg-[#111111] px-6 py-16 text-center sm:px-12">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              방금 완성한 프로젝트가 있나요?
              <br />
              <span style={{ color: ACCENT }}>지금 바로 등록하세요</span>
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-neutral-400">
              새 프로젝트는 New 탭 상단에 노출됩니다. 첫 피드백을 받아보세요.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/submit"
                className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                style={{ backgroundColor: ACCENT }}
              >
                프로젝트 등록하기 (무료)
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-neutral-800 bg-[#0A0A0A] px-4 py-12 sm:px-6">
        <div className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-4">
          <div>
            <p className="flex items-center gap-1.5 text-lg font-bold">
              Viber
            </p>
            <p className="mt-2 text-xs leading-5 text-neutral-500">
              {t.footer.platform}
              <br />
              {t.footer.slogan}
            </p>
            <div className="mt-4 flex items-center gap-3">
              <Github className="h-4 w-4 cursor-pointer text-neutral-400 transition hover:text-white" />
              <Twitter className="h-4 w-4 cursor-pointer text-neutral-400 transition hover:text-white" />
              <span className="cursor-pointer text-sm text-neutral-500 transition hover:text-white"></span>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold">{t.footer.explore}</p>
            <div className="mt-3 flex flex-col gap-2">
              {[
                { label: t.nav.trending, href: "/trending" },
                { label: t.footer.newProjects, href: "/new" },
                { label: t.footer.categories, href: "/products" },
                { label: t.nav.blog, href: "/products" },
              ].map((l) => (
                <Link key={l.label} href={l.href} className="text-xs text-neutral-500 transition hover:text-white">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold">{t.footer.maker}</p>
            <div className="mt-3 flex flex-col gap-2">
              {[
                { label: t.footer.submitProject, href: "/submit" },
                { label: t.footer.dashboard, href: "/dashboard" },
                { label: t.footer.guide, href: "/guide" },
                { label: t.footer.faq, href: "/faq" },
              ].map((l) => (
                <Link key={l.label} href={l.href} className="text-xs text-neutral-500 transition hover:text-white">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold">커뮤니티</p>
            <div className="mt-3 flex flex-col gap-2">
              {[
                { label: "About", href: "/about" },
                { label: "Terms", href: "/terms" },
                { label: "Privacy", href: "/privacy" },
                { label: "Discord", href: "#" },
              ].map((l) => (
                <Link key={l.label} href={l.href} className="text-xs text-neutral-500 transition hover:text-white">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div className="mx-auto mt-10 flex max-w-5xl items-center justify-between border-t border-neutral-800 pt-6">
          <span className="text-xs text-neutral-500">&copy; 2026 Viber. All rights reserved.</span>
          <span className="text-xs text-neutral-500">{t.footer.copyright}</span>
        </div>
      </footer>
    </div>
  );
}
