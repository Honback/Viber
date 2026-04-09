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
                          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-neutral-800 overflow-hidden">
                            <img src={p.icon} alt={p.title} className="h-full w-full object-cover" />
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

    </div>
  );
}
