"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useVariantNav } from "../landing-variant-switcher";
import { useLocale } from "@/lib/i18n/locale-context";
import {
  Flame,
  Triangle,
  MousePointerClick,
  Star,
  ArrowRight,
  Trophy,
  TrendingUp,
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

/* ── period tabs ── */
const PERIOD_TABS = [
  { key: "today", label: "오늘" },
  { key: "week", label: "이번 주" },
  { key: "month", label: "이번 달" },
  { key: "all", label: "전체" },
];

/* ── medal colors ── */
const MEDAL_COLORS = [
  { bg: "", border: "border-neutral-700", badge: "#D97706", label: "1st" },
  { bg: "", border: "border-neutral-700", badge: "#64748B", label: "2nd" },
  { bg: "", border: "border-neutral-700", badge: "#B45309", label: "3rd" },
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

/* ══════════════════════════════════════════ */

export function FeatureTrending() {
  const { subPage, navigate } = useVariantNav();
  const { t } = useLocale();
  const [period, setPeriod] = useState("week");

  const V2_NAV = [
    { page: "home" as const, label: t.nav.home },
    { page: "products" as const, label: t.nav.products },
    { page: "trending" as const, label: t.nav.trending },
    { page: "new" as const, label: t.nav.new },
    { page: "feedback" as const, label: t.nav.feedback },
  ];

  const heroAnim = useScrollAnimation(0.1);
  const topAnim = useScrollAnimation();
  const listAnim = useScrollAnimation();

  /* sort by votes desc */
  const sorted = [...DUMMY_PROJECTS].sort((a, b) => b.votes - a.votes);
  const top3 = sorted.slice(0, 3);
  const rest = sorted.slice(3);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* ── Gradient Hero ── */}
      <section className="relative overflow-hidden bg-[#0A0A0A] px-4 pb-10 pt-12 text-center sm:pb-14 sm:pt-16">
        <div
          ref={heroAnim.ref}
          className={`relative mx-auto max-w-3xl transition-all duration-700 ${
            heroAnim.isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <span
            className="inline-flex items-center gap-1.5 rounded-full bg-neutral-800 px-4 py-1.5 text-xs font-semibold"
            style={{ color: ACCENT }}
          >
            <Flame className="h-3.5 w-3.5" /> 트렌딩
          </span>
          <h1 className="mt-6 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            지금 <span style={{ color: ACCENT }}>뜨고 있는</span> 프로젝트
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-neutral-400 sm:text-base">
            커뮤니티에서 가장 많은 관심을 받고 있는 프로젝트를 확인하세요.
          </p>

          {/* period tabs */}
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {PERIOD_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setPeriod(tab.key)}
                className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                  period === tab.key
                    ? "text-white shadow-sm"
                    : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white"
                }`}
                style={period === tab.key ? { backgroundColor: ACCENT } : undefined}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Top 3 Podium ── */}
      <section className="bg-[#111111] px-4 py-16 sm:px-6">
        <div
          ref={topAnim.ref}
          className={`mx-auto max-w-5xl transition-all duration-700 delay-100 ${
            topAnim.isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
            <Trophy className="h-7 w-7" style={{ color: ACCENT }} />
            Top 3
          </h2>

          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {top3.map((p, i) => {
              const medal = MEDAL_COLORS[i];
              return (
                <div
                  key={i}
                  className={`relative overflow-hidden rounded-2xl border ${medal.border} bg-neutral-900/50 p-6 transition hover:-translate-y-2 hover:border-neutral-600`}
                >
                  {/* rank badge */}
                  <span
                    className="absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-bold text-white shadow-sm"
                    style={{ backgroundColor: medal.badge }}
                  >
                    {medal.label}
                  </span>

                  <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-neutral-800 text-3xl">
                    {p.icon}
                  </span>

                  <div className="mt-4">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold">{p.title}</h3>
                      <CategoryBadge category={p.category} />
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm leading-5 text-neutral-400">
                      {p.tagline}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star
                        key={j}
                        className="h-4 w-4"
                        fill={j < Math.floor(p.score) ? "#FBBF24" : "none"}
                        stroke={j < Math.floor(p.score) ? "#FBBF24" : "#D1D5DB"}
                        strokeWidth={1.5}
                      />
                    ))}
                    <span className="ml-1 text-sm font-semibold text-neutral-400">{p.score}</span>
                  </div>

                  <div className="mt-5 flex items-center gap-5 text-sm text-neutral-400">
                    <span className="inline-flex items-center gap-1">
                      <MousePointerClick className="h-3.5 w-3.5" style={{ color: ACCENT }} />
                      {p.tries.toLocaleString()} Tries
                    </span>
                    <span className="inline-flex items-center gap-1 font-semibold" style={{ color: ACCENT }}>
                      <Triangle className="h-3.5 w-3.5" fill={ACCENT} />
                      {p.votes}
                    </span>
                  </div>

                  <div className="mt-5">
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                      style={{ backgroundColor: ACCENT }}
                    >
                      Try it <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Ranking List ── */}
      <section className="bg-[#0A0A0A] px-4 py-16 sm:px-6">
        <div
          ref={listAnim.ref}
          className={`mx-auto max-w-5xl transition-all duration-700 delay-100 ${
            listAnim.isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
            <TrendingUp className="h-7 w-7" style={{ color: ACCENT }} />
            전체 랭킹
          </h2>

          <div className="mt-8 divide-y divide-neutral-800 overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/50">
            {rest.map((p, i) => (
              <div
                key={i}
                className="flex items-center gap-4 px-5 py-4 transition hover:bg-neutral-800/50"
              >
                {/* rank */}
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-800 text-sm font-bold text-neutral-400">
                  {i + 4}
                </span>

                {/* icon */}
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-800 text-xl">
                  {p.icon}
                </span>

                {/* info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-sm font-bold">{p.title}</h3>
                    <CategoryBadge category={p.category} />
                  </div>
                  <p className="mt-0.5 truncate text-xs text-neutral-400">
                    {p.tagline}
                  </p>
                </div>

                {/* stats */}
                <div className="hidden items-center gap-4 text-xs text-neutral-400 sm:flex">
                  <span className="inline-flex items-center gap-1">
                    <MousePointerClick className="h-3 w-3" style={{ color: ACCENT }} />
                    {p.tries.toLocaleString()}
                  </span>
                  <span className="inline-flex items-center gap-1 font-semibold" style={{ color: ACCENT }}>
                    <Triangle className="h-3 w-3" fill={ACCENT} />
                    {p.votes}
                  </span>
                </div>

                {/* score */}
                <div className="hidden items-center gap-1 sm:flex">
                  <Star className="h-3.5 w-3.5" fill="#FBBF24" stroke="#FBBF24" strokeWidth={1.5} />
                  <span className="text-xs font-semibold text-neutral-400">{p.score}</span>
                </div>

                {/* CTA */}
                <span
                  className="shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold text-white"
                  style={{ backgroundColor: ACCENT }}
                >
                  Try
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
