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
import { DEMO_PROJECTS, toFeatureShape, CATEGORY_COLORS as SHARED_COLORS } from "@/lib/demo-projects";

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
const CATEGORY_COLORS = SHARED_COLORS;

/* ── 10 demo projects ── */
const DUMMY_PROJECTS = DEMO_PROJECTS.map(toFeatureShape);

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

                  <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-neutral-800 overflow-hidden">
                    <img src={p.icon} alt={p.title} className="h-full w-full object-cover" />
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
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-800 overflow-hidden">
                  <img src={p.icon} alt={p.title} className="h-full w-full object-cover" />
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
