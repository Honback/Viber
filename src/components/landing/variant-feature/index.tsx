/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Search,
  Flame,
  Triangle,
  MessageSquare,
  Star,
  FolderOpen,
  MousePointerClick,
  Sparkles,
  Zap,
  Palette,
  Code2,
  Bot,
  Gamepad2,
  BarChart3,
  Music,
  FileText,
  Bell,
  Puzzle,
  Terminal,
  Database,
  Layout,
  Wrench,
  Brain,
  Rocket,
} from "lucide-react";

import type { LandingVariantProps, SerializedProjectCard } from "../types";
import { OutboundLink } from "@/components/analytics/outbound-link";
import { getCategoryLabel } from "../shared";
import { DEMO_PROJECTS, toFeatureIndexShape, CATEGORY_COLORS as SHARED_COLORS } from "@/lib/demo-projects";

/* ── palette ── */
const ACCENT = "#d76542";
const ACCENT_LIGHT = "#fdf2ee";

/* ── Hero logo: Poiret One text ── */
function HeroLogo() {
  return (
    <span
      style={{
        fontFamily: "var(--font-logo), sans-serif",
        fontWeight: 300,
        color: ACCENT,
        letterSpacing: "0.02em",
        lineHeight: 1,
      }}
    >
      Vibeollio
    </span>
  );
}

/* ── custom hook: scroll animation (callback-ref) ── */
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
  { key: "api", label: "API", emoji: "" },
];

const CATEGORY_COLORS = SHARED_COLORS;

/* ── 10 demo projects ── */
const DUMMY_PROJECTS = DEMO_PROJECTS.map(toFeatureIndexShape);

const DUMMY_FEATURED = DUMMY_PROJECTS[0];
const DUMMY_GRID = DUMMY_PROJECTS.slice(1, 7);
const DUMMY_NEW = DUMMY_PROJECTS.slice(0, 10);
const DUMMY_FEEDBACK = [
  DUMMY_PROJECTS[0],
  DUMMY_PROJECTS[1],
  DUMMY_PROJECTS[2],
];

import { useVariantNav } from "../landing-variant-switcher";
import { useLocale } from "@/lib/i18n/locale-context";

export function VariantFeature({ data, viewer }: LandingVariantProps) {
  const { subPage, navigate } = useVariantNav();
  const { t } = useLocale();
  const [catTab, setCatTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const ROTATING_WORDS = t.hero.rotatingWords as unknown as string[];

  const V2_NAV = [
    { page: "home" as const, label: t.nav.home },
    { page: "products" as const, label: t.nav.products },
    { page: "trending" as const, label: t.nav.trending },
    { page: "new" as const, label: t.nav.new },
    { page: "feedback" as const, label: t.nav.feedback },
  ];
  const [rotateIdx, setRotateIdx] = useState(0);
  const [displayText, setDisplayText] = useState(ROTATING_WORDS[0]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [charIdx, setCharIdx] = useState(ROTATING_WORDS[0].length);
  const [isPaused, setIsPaused] = useState(false);

  /* ── typing animation ── */
  useEffect(() => {
    if (isPaused) {
      const pauseTimer = setTimeout(() => {
        setIsPaused(false);
        setIsDeleting(true);
      }, 1800);
      return () => clearTimeout(pauseTimer);
    }

    const word = ROTATING_WORDS[rotateIdx % ROTATING_WORDS.length];
    const speed = isDeleting ? 60 : 120;

    const timer = setTimeout(() => {
      if (!isDeleting) {
        if (charIdx < word.length) {
          setDisplayText(word.slice(0, charIdx + 1));
          setCharIdx(charIdx + 1);
        } else {
          setIsPaused(true);
        }
      } else {
        if (charIdx > 0) {
          setDisplayText(word.slice(0, charIdx - 1));
          setCharIdx(charIdx - 1);
        } else {
          setIsDeleting(false);
          const nextIdx = (rotateIdx + 1) % ROTATING_WORDS.length;
          setRotateIdx(nextIdx);
          setDisplayText("");
          setCharIdx(0);
        }
      }
    }, speed);

    return () => clearTimeout(timer);
  }, [charIdx, isDeleting, rotateIdx, isPaused]);

  const hasData = data.featured.length > 0;

  const featuredProjects = hasData ? data.featured : [];
  const launchProjects = hasData ? data.launches : [];
  const feedbackProjects = hasData ? data.feedback : [];

  /* ── scroll animation refs ── */
  const [heroVisible, heroRef] = useScrollAnimation(0.1);
  const [trendingVisible, trendingRef] = useScrollAnimation();
  const [newVisible, newRef] = useScrollAnimation();
  const [feedbackVisible, feedbackRef] = useScrollAnimation();
  const [statsVisible, statsRef] = useScrollAnimation();
  const [ctaVisible, ctaRef] = useScrollAnimation();

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-[#0A0A0A] px-4 pb-12 pt-16 text-center sm:pb-16 sm:pt-24">
        <div
          ref={heroRef}
          className={`relative mx-auto max-w-3xl transition-all duration-700 ${
            heroVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <h1 className="flex justify-center text-6xl sm:text-7xl lg:text-8xl">
            <Link href="/" className="cursor-pointer"><HeroLogo /></Link>
          </h1>

          <p className="mt-6 text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl">
            {t.hero.prefix}{" "}
            <span style={{ color: ACCENT }}>
              {displayText}
              <span className="animate-blink">|</span>
            </span>
            <br />
            {t.hero.suffix}
          </p>
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes blink { 0%,50% { opacity: 1; } 51%,100% { opacity: 0; } }
            .animate-blink { animation: blink 1s step-end infinite; font-weight: 300; }
          ` }} />
          <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-neutral-400 sm:text-base">
            {t.hero.description}
          </p>

          {/* search */}
          <div className="mx-auto mt-8 flex max-w-md items-center gap-2 rounded-full border border-neutral-700 bg-neutral-900 px-4 py-2.5">
            <Search className="h-4 w-4 text-neutral-500" />
            <input
              type="text"
              placeholder={t.hero.searchPlaceholder}
              className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-neutral-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* CTA buttons */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/submit"
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              style={{ backgroundColor: ACCENT }}
            >
              {t.hero.submitCta}
            </Link>
            <Link
              href="/feature/products"
              className="inline-flex items-center gap-2 rounded-full border border-neutral-700 px-6 py-3 text-sm font-semibold text-white transition hover:border-neutral-500"
            >
              {t.hero.exploreCta}
            </Link>
          </div>

          {/* stats bar */}
          <div className="mt-6 flex items-center justify-center gap-6 text-xs text-neutral-500">
            <span className="inline-flex items-center gap-1">
              <Flame className="h-3.5 w-3.5" style={{ color: ACCENT }} />
              <strong className="text-white">1,240</strong> {t.hero.projects}
            </span>
            <span>
              <strong className="text-white">48,800</strong> Try
            </span>
          </div>
        </div>
      </section>

      {/* ── Trending ── */}
      <section className="bg-[#111111] px-4 py-16 sm:px-6">
        <div
          ref={trendingRef}
          className={`mx-auto max-w-5xl transition-all duration-700 delay-100 ${
            trendingVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
            <Flame className="h-7 w-7" style={{ color: ACCENT }} />
            Trending
          </h2>

          {/* category tabs */}
          <div className="mt-6 flex flex-wrap gap-2">
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

          {/* featured card */}
          <div className="mt-8">
            {hasData && featuredProjects[0] ? (
              <FeaturedCard project={featuredProjects[0]} />
            ) : (
              <DummyFeaturedCard />
            )}
          </div>

          {/* grid */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {hasData
              ? featuredProjects.slice(1, 7).map((p) => <ProjectCard key={p.id} project={p} />)
              : DUMMY_GRID.map((p, i) => <DummyCard key={i} {...p} />)}
          </div>
        </div>
      </section>

      {/* ── New Projects ── */}
      <section className="bg-[#0A0A0A] px-4 py-16 sm:px-6">
        <div
          ref={newRef}
          className={`mx-auto max-w-5xl transition-all duration-700 delay-100 ${
            newVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <div className="flex items-end justify-between">
            <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
              New Projects
            </h2>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-neutral-800 px-3 py-1 text-xs font-medium text-neutral-400">{t.hero.thisWeek}</span>
            </div>
          </div>

          <div className="mt-8 divide-y divide-neutral-800 overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/50">
            {hasData
              ? launchProjects.slice(0, 8).map((p) => <NewProjectRow key={p.id} project={p} />)
              : DUMMY_NEW.map((p, i) => <DummyNewRow key={i} rank={i + 1} {...p} />)}
          </div>
        </div>
      </section>

      {/* ── Feedback ── */}
      <section className="bg-[#111111] px-4 py-16 sm:px-6">
        <div
          ref={feedbackRef}
          className={`mx-auto max-w-5xl transition-all duration-700 delay-100 ${
            feedbackVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
            {t.hero.feedbackRequested}
          </h2>
          <p className="mt-2 text-sm text-neutral-400">
            {t.hero.feedbackDesc}
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {hasData
              ? feedbackProjects.slice(0, 3).map((p) => <FeedbackCard key={p.id} project={p} />)
              : DUMMY_FEEDBACK.map((p, i) => <DummyFeedbackCard key={i} {...p} />)}
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="bg-[#0A0A0A] px-4 py-16 sm:px-6">
        <div
          ref={statsRef}
          className={`mx-auto max-w-5xl transition-all duration-700 delay-100 ${
            statsVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              { icon: FolderOpen, value: `${hasData ? data.featured.length : "1,240"}+`, label: t.hero.registeredProjects },
              { icon: MousePointerClick, value: "48,800+", label: t.hero.totalTries },
              { icon: MessageSquare, value: "12,500+", label: t.hero.totalFeedback },
            ].map((s) => (
              <div
                key={s.label}
                className="flex flex-col items-center rounded-2xl border border-neutral-800 bg-neutral-900/50 p-8 text-center transition hover:-translate-y-1 hover:border-neutral-600"
              >
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${ACCENT}20` }}
                >
                  <s.icon className="h-6 w-6" style={{ color: ACCENT }} />
                </div>
                <p className="mt-4 text-3xl font-extrabold sm:text-4xl" style={{ color: ACCENT }}>
                  {s.value}
                </p>
                <p className="mt-1 text-sm text-neutral-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-[#111111] px-4 py-16 sm:px-6">
        <div
          ref={ctaRef}
          className={`mx-auto max-w-5xl transition-all duration-700 delay-100 ${
            ctaVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <div className="rounded-3xl border border-neutral-800 bg-[#0A0A0A] px-6 py-16 text-center sm:px-12">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {t.hero.ctaTitle1}
              <br />
              <span style={{ color: ACCENT }}>{t.hero.ctaTitle2}</span>
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-neutral-400 whitespace-pre-line">
              {t.hero.ctaDesc}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/submit"
                className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                style={{ backgroundColor: ACCENT }}
              >
                {t.hero.submitCta}
              </Link>
              <Link
                href="/feature/products"
                className="inline-flex items-center gap-2 rounded-full border border-neutral-700 px-6 py-3 text-sm font-semibold text-white transition hover:border-neutral-500"
              >
                {t.hero.guideCta}
              </Link>
            </div>
            <p className="mt-6 text-xs text-neutral-500">
              {t.hero.ctaBottom}
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}

/* ══════════════════════════════════════════
   Sub-components
   ══════════════════════════════════════════ */

function CategoryBadge({ category }: { category: string }) {
  const color = CATEGORY_COLORS[category] ?? "#6B7280";
  return (
    <span
      className="rounded-md px-2 py-0.5 text-[10px] font-bold uppercase"
      style={{ backgroundColor: `${color}18`, color }}
    >
      {getCategoryLabel(category)}
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
          fill={i < full ? "#FBBF24" : i === full && hasHalf ? "url(#halfStar)" : "none"}
          stroke={i < full || (i === full && hasHalf) ? "#FBBF24" : "#D1D5DB"}
          strokeWidth={1.5}
        />
      ))}
      <span className="ml-1 text-xs font-semibold text-neutral-400">{score}</span>
    </span>
  );
}

/* ── Trending: featured (large #1 card) ── */
function FeaturedCard({ project }: { project: SerializedProjectCard }) {
  return (
    <Link
      href={`/p/${project.slug}`}
      className="block overflow-hidden rounded-2xl border border-neutral-800 bg-gradient-to-br from-neutral-900 via-[#0A0A0A] to-neutral-900 p-6 transition hover:-translate-y-1 hover:border-neutral-600 sm:p-8"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          {project.coverImageUrl && (
            <img src={project.coverImageUrl} alt="" className="h-14 w-14 rounded-xl object-cover shadow-sm" />
          )}
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold">{project.title}</h3>
              <CategoryBadge category={project.category} />
            </div>
            <p className="mt-1.5 text-sm text-neutral-500">{project.tagline}</p>
          </div>
        </div>
        <span
          className="shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold text-white shadow-sm"
          style={{ backgroundColor: ACCENT }}
        >
          #1 Trending
        </span>
      </div>
      <div className="mt-5 flex items-center gap-6 text-sm text-neutral-500">
        <span className="inline-flex items-center gap-1">
          <MousePointerClick className="h-3.5 w-3.5" style={{ color: ACCENT }} />
          {project.metrics.uniqueClicks.toLocaleString()} Tries
        </span>
        <span className="inline-flex items-center gap-1" style={{ color: ACCENT }}>
          <Triangle className="h-3.5 w-3.5" fill={ACCENT} />
          {project.metrics.score} votes
        </span>
      </div>
      <div className="mt-4">
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          style={{ backgroundColor: ACCENT }}
        >
          Try it <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}

function DummyFeaturedCard() {
  return (
    <Link href={`/p/${DUMMY_FEATURED.slug}`} className="block overflow-hidden rounded-2xl border border-neutral-800 bg-gradient-to-br from-neutral-900 via-[#0A0A0A] to-neutral-900 p-6 transition hover:-translate-y-1 hover:border-neutral-600 sm:p-8">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-neutral-800 overflow-hidden">
            <img src={DUMMY_FEATURED.icon} alt={DUMMY_FEATURED.title} className="h-full w-full object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold">{DUMMY_FEATURED.title}</h3>
              <CategoryBadge category={DUMMY_FEATURED.category} />
            </div>
            <p className="mt-1.5 text-sm text-neutral-500">{DUMMY_FEATURED.tagline}</p>
            <div className="mt-2">
              <StarRating score={DUMMY_FEATURED.score} />
            </div>
          </div>
        </div>
        <span
          className="shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold text-white shadow-sm"
          style={{ backgroundColor: ACCENT }}
        >
          #1 Trending
        </span>
      </div>
      <div className="mt-5 flex items-center gap-6 text-sm text-neutral-500">
        <span className="inline-flex items-center gap-1">
          <MousePointerClick className="h-3.5 w-3.5" style={{ color: ACCENT }} />
          {DUMMY_FEATURED.tries.toLocaleString()} Tries
        </span>
        <span className="inline-flex items-center gap-1" style={{ color: ACCENT }}>
          <Triangle className="h-3.5 w-3.5" fill={ACCENT} />
          {DUMMY_FEATURED.votes} votes
        </span>
      </div>
      <div className="mt-4">
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-semibold text-white"
          style={{ backgroundColor: ACCENT }}
        >
          Try it <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}

/* ── Trending: grid cards ── */
function ProjectCard({ project }: { project: SerializedProjectCard }) {
  return (
    <Link
      href={`/p/${project.slug}`}
      className="flex flex-col justify-between rounded-2xl border border-neutral-800 bg-neutral-900/50 p-5 transition hover:-translate-y-1 hover:border-neutral-600"
    >
      <div>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            {project.coverImageUrl && (
              <img src={project.coverImageUrl} alt="" className="h-9 w-9 rounded-lg object-cover" />
            )}
            <h3 className="text-sm font-bold">{project.title}</h3>
          </div>
          <button className="text-neutral-600 hover:text-neutral-400 transition">
            <Triangle className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-3 line-clamp-2 text-xs leading-5 text-neutral-400">
          {project.tagline}
        </p>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <CategoryBadge category={project.category} />
        <span
          className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-white"
          style={{ backgroundColor: ACCENT }}
        >
          Try it <ArrowRight className="h-3 w-3" />
        </span>
      </div>
    </Link>
  );
}

function DummyCard({ title, icon, category, tagline, votes, score, slug }: {
  title: string;
  icon: string;
  category: string;
  tagline: string;
  votes: number;
  score: number;
  slug: string;
}) {
  return (
    <Link href={`/p/${slug}`} className="flex flex-col justify-between rounded-2xl border border-neutral-800 bg-neutral-900/50 p-5 transition hover:-translate-y-1 hover:border-neutral-600">
      <div>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-800 overflow-hidden">
              <img src={icon} alt={title} className="h-full w-full object-cover" />
            </div>
            <h3 className="text-sm font-bold">{title}</h3>
          </div>
          <button className="text-neutral-600 transition hover:text-neutral-400">
            <Triangle className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-3 line-clamp-2 text-xs leading-5 text-neutral-400">{tagline}</p>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <CategoryBadge category={category} />
        <span
          className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-white"
          style={{ backgroundColor: ACCENT }}
        >
          Try it <ArrowRight className="h-3 w-3" />
        </span>
      </div>
    </Link>
  );
}

/* ── New Projects rows ── */
function NewProjectRow({ project }: { project: SerializedProjectCard }) {
  return (
    <Link
      href={`/p/${project.slug}`}
      className="flex items-center gap-4 px-5 py-4 transition hover:bg-neutral-800/50"
    >
      {project.coverImageUrl ? (
        <img src={project.coverImageUrl} alt="" className="h-10 w-10 shrink-0 rounded-xl object-cover" />
      ) : (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-800 text-lg">
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold">{project.title}</p>
          <CategoryBadge category={project.category} />
        </div>
        <p className="mt-0.5 truncate text-xs text-neutral-500">{project.tagline}</p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <span className="text-sm text-neutral-400">{project.metrics.score}</span>
        <span
          className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-white"
          style={{ backgroundColor: ACCENT }}
        >
          Try it <ArrowRight className="h-3 w-3" />
        </span>
      </div>
    </Link>
  );
}

function DummyNewRow({ title, icon, category, tagline, votes, rank, slug }: {
  title: string;
  icon: string;
  category: string;
  tagline: string;
  votes: number;
  rank: number;
  slug: string;
}) {
  return (
    <Link href={`/p/${slug}`} className="flex items-center gap-4 px-5 py-4 transition hover:bg-neutral-800/50">
      <span className="w-6 text-center text-sm font-bold text-neutral-600">{rank}</span>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-800 overflow-hidden">
        <img src={icon} alt={title} className="h-full w-full object-cover" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold">{title}</p>
          <CategoryBadge category={category} />
        </div>
        <p className="mt-0.5 truncate text-xs text-neutral-500">{tagline}</p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <span className="text-sm font-medium text-neutral-400">{votes}</span>
        <span
          className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-white"
          style={{ backgroundColor: ACCENT }}
        >
          Try it <ArrowRight className="h-3 w-3" />
        </span>
      </div>
    </Link>
  );
}

/* ── Feedback cards ── */
function FeedbackCard({ project }: { project: SerializedProjectCard }) {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-neutral-800 bg-neutral-900/50 p-5 transition hover:-translate-y-1 hover:border-neutral-600">
      <div>
        <div className="flex items-center gap-2">
          <p className="text-sm font-bold">{project.title}</p>
          <CategoryBadge category={project.category} />
          <span className="rounded-full bg-green-900/30 px-2 py-0.5 text-[10px] font-semibold text-green-400">
            피드백 요청
          </span>
        </div>
        <p className="mt-2 text-xs text-neutral-400">{project.tagline}</p>
      </div>
      <div className="mt-4 flex gap-2">
        <Link
          href={`/p/${project.slug}`}
          className="flex-1 rounded-full py-2 text-center text-xs font-semibold text-white transition hover:opacity-90"
          style={{ backgroundColor: "#22C55E" }}
        >
          Give Feedback
        </Link>
        <OutboundLink
          projectId={project.id}
          source="home_try"
          href={project.liveUrl}
          className="rounded-full border border-neutral-700 px-4 py-2 text-xs font-semibold text-neutral-300 transition hover:border-neutral-500"
        >
          Try
        </OutboundLink>
      </div>
    </div>
  );
}

function DummyFeedbackCard({ title, icon, category, tagline, feedback, slug, liveUrl }: {
  title: string;
  icon: string;
  category: string;
  tagline: string;
  feedback: string;
  slug: string;
  liveUrl: string;
}) {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-neutral-800 bg-neutral-900/50 p-5 transition hover:-translate-y-1 hover:border-neutral-600">
      <div>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-800 overflow-hidden">
            <img src={icon} alt={title} className="h-full w-full object-cover" />
          </div>
          <p className="text-sm font-bold">{title}</p>
          <CategoryBadge category={category} />
          <span className="rounded-full bg-green-900/30 px-2 py-0.5 text-[10px] font-semibold text-green-400">
            피드백 요청
          </span>
        </div>
        <p className="mt-2 text-xs text-neutral-400">{tagline}</p>
        {feedback && (
          <p className="mt-2 text-xs italic text-neutral-500">&ldquo;{feedback}&rdquo;</p>
        )}
      </div>
      <div className="mt-4 flex gap-2">
        <Link
          href={`/p/${slug}#comments`}
          className="flex-1 rounded-full py-2 text-center text-xs font-semibold text-white transition hover:opacity-90"
          style={{ backgroundColor: "#22C55E" }}
        >
          Give Feedback
        </Link>
        <a
          href={liveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-neutral-700 px-4 py-2 text-xs font-semibold text-neutral-300 transition hover:border-neutral-500"
        >
          Try
        </a>
      </div>
    </div>
  );
}
