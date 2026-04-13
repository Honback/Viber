"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useVariantNav } from "../landing-variant-switcher";
import { useLocale } from "@/lib/i18n/locale-context";
import {
  Search,
  Flame,
  Triangle,
  MousePointerClick,
  Star,
  ArrowRight,
} from "lucide-react";
import { DEMO_PROJECTS, toFeatureShape, CATEGORY_COLORS as SHARED_COLORS } from "@/lib/demo-projects";

/* ── palette ── */
const ACCENT = "#d76542";


/* ── scroll animation hook (callback-ref) ── */
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

/* ── category config ── */
const CATEGORY_TABS = [
  { key: "all", label: "All", emoji: "" },
  { key: "ai", label: "AI", emoji: "" },
  { key: "tool", label: "Tool", emoji: "" },
  { key: "web", label: "Web", emoji: "" },
  { key: "game", label: "Game", emoji: "" },
  { key: "saas", label: "SaaS", emoji: "" },
  { key: "data", label: "Data", emoji: "" },
  { key: "music", label: "Music", emoji: "" },
];

const CATEGORY_COLORS = SHARED_COLORS;

/* ── 10 demo projects ── */
const DUMMY_PROJECTS = DEMO_PROJECTS.map(toFeatureShape);

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
  const { t } = useLocale();
  const [catTab, setCatTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const V2_NAV = [
    { page: "home" as const, label: t.nav.home },
    { page: "products" as const, label: t.nav.products },
    { page: "trending" as const, label: t.nav.trending },
    { page: "new" as const, label: t.nav.new },
    { page: "feedback" as const, label: t.nav.feedback },
  ];

  const [heroVisible, heroRef] = useScrollAnimation(0.1);
  const [gridVisible, gridRef] = useScrollAnimation();

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
      {/* ── Gradient Hero ── */}
      <section className="relative overflow-hidden bg-[#0A0A0A] px-4 pb-10 pt-12 text-center sm:pb-14 sm:pt-16">
        <div
          ref={heroRef}
          className={`relative mx-auto max-w-3xl transition-all duration-700 ${
            heroVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
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
          ref={gridRef}
          className={`mx-auto max-w-5xl transition-all duration-700 delay-100 ${
            gridVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
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
                  <Link href={`/p/${p.slug}`} className="block">
                    <div className="flex items-start gap-3">
                      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-800 overflow-hidden">
                        <img src={p.icon} alt={p.title} className="h-full w-full object-cover" />
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
                  </Link>

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
                    <a
                      href={p.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90"
                      style={{ backgroundColor: ACCENT }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      Try <ArrowRight className="h-3 w-3" />
                    </a>
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

    </div>
  );
}
