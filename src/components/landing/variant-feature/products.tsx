"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useVariantNav } from "../landing-variant-switcher";
import {
  Search,
  Flame,
  Triangle,
  MousePointerClick,
  Star,
  ArrowRight,
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

/* ── category config ── */
const CATEGORY_TABS = [
  { key: "all", label: "All", emoji: "" },
  { key: "ai", label: "AI", emoji: "" },
  { key: "tool", label: "Tool", emoji: "" },
  { key: "web", label: "Web", emoji: "" },
  { key: "game", label: "Game", emoji: "" },
  { key: "api", label: "API", emoji: "" },
  { key: "saas", label: "SaaS", emoji: "" },
  { key: "devtool", label: "DevTool", emoji: "" },
  { key: "data", label: "Data", emoji: "" },
  { key: "music", label: "Music", emoji: "" },
];

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

/* ── nav ── */
const V2_NAV = [
  { page: "home" as const, label: "Home" },
  { page: "products" as const, label: "Products" },
  { page: "trending" as const, label: "Trending" },
  { page: "new" as const, label: "New" },
  { page: "feedback" as const, label: "Feedback" },
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

function StarRating({ score }: { score: number }) {
  const full = Math.floor(score);
  const hasHalf = score - full >= 0.3;
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className="h-3.5 w-3.5"
          fill={i < full ? "#FBBF24" : i === full && hasHalf ? "#FBBF24" : "none"}
          stroke={i < full || (i === full && hasHalf) ? "#FBBF24" : "#D1D5DB"}
          strokeWidth={1.5}
        />
      ))}
      <span className="ml-1 text-xs font-semibold text-neutral-400">{score}</span>
    </span>
  );
}

/* ══════════════════════════════════════════ */

export function FeatureProducts() {
  const { subPage, navigate } = useVariantNav();
  const [catTab, setCatTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const heroAnim = useScrollAnimation(0.1);
  const gridAnim = useScrollAnimation();

  /* ── filter logic ── */
  const filtered = DUMMY_PROJECTS.filter((p) => {
    const matchCat = catTab === "all" || p.category === catTab;
    const matchSearch =
      !searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

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
              블로그
            </Link>
            <Link href="/submit" className="rounded-full px-3.5 py-1.5 text-sm font-semibold text-white transition hover:opacity-90" style={{ backgroundColor: ACCENT }}>
              등록하기
            </Link>
          </nav>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <Link href="/auth/sign-in" className="rounded-full px-4 py-2 text-sm font-semibold text-white" style={{ backgroundColor: ACCENT }}>
              로그인
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
          <span
            className="inline-flex items-center gap-1.5 rounded-full bg-neutral-800 px-4 py-1.5 text-xs font-semibold"
            style={{ color: ACCENT }}
          >
            프로젝트 탐색
          </span>
          <h1 className="mt-6 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            모든 <span style={{ color: ACCENT }}>프로젝트</span>를 탐색하세요
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-neutral-400 sm:text-base">
            바이브코딩 커뮤니티의 {DUMMY_PROJECTS.length}개 프로젝트를 카테고리별로 찾아보세요.
          </p>

          {/* search */}
          <div className="mx-auto mt-8 flex max-w-md items-center gap-2 rounded-full border border-neutral-700 bg-neutral-900 px-4 py-2.5">
            <Search className="h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder="프로젝트 이름 또는 키워드 검색..."
              className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-neutral-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* category filter tabs */}
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setCatTab(tab.key)}
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  catTab === tab.key
                    ? "text-white shadow-sm"
                    : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white"
                }`}
                style={catTab === tab.key ? { backgroundColor: ACCENT } : undefined}
              >
                {tab.emoji} {tab.label}
              </button>
            ))}
          </div>

          {/* result count */}
          <p className="mt-4 text-xs text-neutral-400">
            {filtered.length}개 프로젝트
          </p>
        </div>
      </section>

      {/* ── Project Grid ── */}
      <section className="bg-[#111111] px-4 py-16 sm:px-6">
        <div
          ref={gridAnim.ref}
          className={`mx-auto max-w-5xl transition-all duration-700 delay-100 ${
            gridAnim.isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          {filtered.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-lg font-semibold text-neutral-400">검색 결과가 없습니다</p>
              <p className="mt-2 text-sm text-neutral-400">다른 키워드로 검색해보세요.</p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((p, i) => (
                <div
                  key={i}
                  className="group overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/50 p-5 transition hover:-translate-y-2 hover:border-neutral-600"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-800 text-2xl">
                      {p.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate text-base font-bold">{p.title}</h3>
                        <CategoryBadge category={p.category} />
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-neutral-400">
                        {p.tagline}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <StarRating score={p.score} />
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-neutral-800 pt-3">
                    <div className="flex items-center gap-4 text-xs text-neutral-400">
                      <span className="inline-flex items-center gap-1">
                        <MousePointerClick className="h-3 w-3" style={{ color: ACCENT }} />
                        {p.tries.toLocaleString()}
                      </span>
                      <span className="inline-flex items-center gap-1" style={{ color: ACCENT }}>
                        <Triangle className="h-3 w-3" fill={ACCENT} />
                        {p.votes}
                      </span>
                    </div>
                    <span
                      className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-white transition group-hover:opacity-90"
                      style={{ backgroundColor: ACCENT }}
                    >
                      Try <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-[#111111] px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-3xl border border-neutral-800 bg-[#0A0A0A] px-6 py-16 text-center sm:px-12">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              찾는 프로젝트가 없나요?
              <br />
              <span style={{ color: ACCENT }}>직접 등록하세요</span>
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-neutral-400">
              등록 무료, 실사용자 피드백 획득, 롱테일 트래픽까지.
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
              바이브코딩 프로젝트 쇼케이스 플랫폼.
              <br />
              만든 것을 세상에 보여주세요.
            </p>
            <div className="mt-4 flex items-center gap-3">
              <Github className="h-4 w-4 cursor-pointer text-neutral-400 transition hover:text-white" />
              <Twitter className="h-4 w-4 cursor-pointer text-neutral-400 transition hover:text-white" />
              <span className="cursor-pointer text-sm text-neutral-500 transition hover:text-white"></span>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold">탐색</p>
            <div className="mt-3 flex flex-col gap-2">
              {[
                { label: "Trending", href: "/trending" },
                { label: "New Projects", href: "/new" },
                { label: "Categories", href: "/products" },
                { label: "Tags", href: "/products" },
              ].map((l) => (
                <Link key={l.label} href={l.href} className="text-xs text-neutral-500 transition hover:text-white">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold">메이커</p>
            <div className="mt-3 flex flex-col gap-2">
              {[
                { label: "프로젝트 등록", href: "/submit" },
                { label: "대시보드", href: "/dashboard" },
                { label: "등록 가이드", href: "/guide" },
                { label: "FAQ", href: "/faq" },
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
          <span className="text-xs text-neutral-500">Made by the Vibe Coding Community</span>
        </div>
      </footer>
    </div>
  );
}
