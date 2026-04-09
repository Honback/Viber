"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ChevronUp,
  Cpu,
  Wrench,
  Globe,
  Gamepad2,
  Plug,
  CloudCog,
  HelpCircle,
  CheckCircle,
  Moon,
} from "lucide-react";

import { Logo } from "@/components/ui/logo";
import type { LandingVariantProps, SerializedProjectCard } from "../types";
import { DEMO_PROJECTS, toMinimalRankShape } from "@/lib/demo-projects";
import { getCategoryLabel } from "../shared";

/* ── scroll animation hook ── */
function useScrollFadeIn<T extends HTMLElement>(threshold = 0.15) {
  const ref = useRef<T>(null);
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
      { threshold },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
}

function AnimateIn({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, isVisible } = useScrollFadeIn<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

import { useVariantNav } from "../landing-variant-switcher";

/* ── nav ── */
const V3_NAV = [
  { page: "products" as const, label: "프로젝트" },
  { page: "trending" as const, label: "트렌딩" },
  { page: "feedback" as const, label: "피드백" },
];

/* ── rotating words (타이핑 애니메이션) ── */
const ROTATING_WORDS = ["API", "앱", "SaaS", "게임", "도구", "AI", "웹사이트", "플러그인"];
const ACCENT = "#d76542";

/* ── dummy data (DB가 비어 있을 때 사용) ── */
const DUMMY_PROJECTS = DEMO_PROJECTS.map(toMinimalRankShape);

const CATEGORIES = [
  { label: "AI / ML", slug: "ai", icon: Cpu, count: 48, color: "bg-purple-500/20", iconColor: "text-purple-400" },
  { label: "개발 도구", slug: "tool", icon: Wrench, count: 63, color: "bg-blue-500/20", iconColor: "text-blue-400" },
  { label: "웹 서비스", slug: "web", icon: Globe, count: 55, color: "bg-cyan-500/20", iconColor: "text-cyan-400" },
  { label: "게임", slug: "game", icon: Gamepad2, count: 31, color: "bg-amber-500/20", iconColor: "text-amber-400" },
  { label: "API", slug: "api", icon: Plug, count: 27, color: "bg-pink-500/20", iconColor: "text-pink-400" },
  { label: "SaaS", slug: "saas", icon: CloudCog, count: 39, color: "bg-emerald-500/20", iconColor: "text-emerald-400" },
];

const STATS = [
  { value: "1,240+", label: "등록 프로젝트" },
  { value: "52K+", label: "월간 방문자" },
  { value: "8.4K+", label: "업보트" },
  { value: "3.2K+", label: "피드백" },
];

const PROBLEMS = [
  {
    problem: '"사이드 프로젝트 만들었는데 보여줄 곳이 없어요"',
    solution: "Vibeollio에 올리세요. 수백 명의 메이커가 봅니다.",
  },
  {
    problem: '"피드백이 필요한데 주변에 개발자가 없어요"',
    solution: "커뮤니티가 실질적인 피드백을 줍니다.",
  },
  {
    problem: '"다른 메이커들은 뭘 만들고 있는지 궁금해요"',
    solution: "트렌딩 프로젝트를 확인하세요.",
  },
];

export function VariantMinimal({ data, viewer }: LandingVariantProps) {
  const { subPage, navigate } = useVariantNav();
  const hasProjects = data.featured.length > 0;

  /* ── typing animation state ── */
  const [rotateIdx, setRotateIdx] = useState(0);
  const [displayText, setDisplayText] = useState(ROTATING_WORDS[0]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [charIdx, setCharIdx] = useState(ROTATING_WORDS[0].length);
  const [isPaused, setIsPaused] = useState(false);

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

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* V3 헤더 — 미니멀 */}
      <header className="sticky top-[38px] z-50 border-b border-neutral-800 bg-[#0A0A0A]/90 backdrop-blur">
        <div className="mx-auto flex h-12 max-w-3xl items-center justify-between px-6">
          <button onClick={() => navigate("home")}>
            <Logo height={20} />
          </button>
          <nav className="flex items-center gap-6">
            {V3_NAV.map((item) => (
              <button
                key={item.page}
                onClick={() => navigate(item.page)}
                className={`text-sm transition hover:text-white ${
                  subPage === item.page ? "text-white font-medium" : "text-neutral-400"
                }`}
              >
                {item.label}
              </button>
            ))}
            <Link
              href="/submit"
              className="text-sm font-medium transition hover:opacity-80"
              style={{ color: ACCENT }}
            >
              등록하기
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="flex flex-col items-center bg-[#0A0A0A] px-4 pb-24 pt-20 text-center sm:pt-28">
        <AnimateIn>
          <h1 className="text-6xl font-extrabold tracking-tight sm:text-7xl lg:text-8xl">
            Vibeollio
          </h1>
        </AnimateIn>
        <AnimateIn delay={80}>
          <p className="mt-6 text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl">
            내가 만든{" "}
            <span style={{ color: ACCENT }}>
              {displayText}
              <span className="animate-blink">|</span>
            </span>
            <br />
            여기서 시작
          </p>
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes blink { 0%,50% { opacity: 1; } 51%,100% { opacity: 0; } }
            .animate-blink { animation: blink 1s step-end infinite; font-weight: 300; }
          ` }} />
        </AnimateIn>
        <AnimateIn delay={150}>
          <p className="mt-4 max-w-sm text-sm leading-6 text-neutral-400 sm:text-base">
            인디 메이커의 프로덕트를 발견하고,
            <br />
            피드백을 주고받는 공간.
          </p>
        </AnimateIn>
        <AnimateIn delay={200}>
          <div className="mt-8 flex items-center gap-3">
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-neutral-200"
            >
              둘러보기 <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/submit"
              className="inline-flex items-center gap-2 rounded-full border border-neutral-700 px-6 py-3 text-sm font-semibold text-white transition hover:border-neutral-500"
            >
              프로젝트 등록하기
            </Link>
          </div>
        </AnimateIn>
      </section>

      {/* ── Why Vibeollio ── */}
      <section className="bg-[#111111] py-20">
        <div className="mx-auto max-w-3xl px-6">
          <AnimateIn>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              왜 Vibeollio인가요?
            </h2>
          </AnimateIn>
          <div className="mt-12">
            {PROBLEMS.map((item, i) => (
              <AnimateIn key={i} delay={i * 100}>
                <div
                  className={`grid gap-4 py-8 sm:grid-cols-2 sm:gap-12${
                    i < PROBLEMS.length - 1 ? " border-b border-neutral-800" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <HelpCircle className="mt-0.5 h-5 w-5 shrink-0 text-neutral-500" />
                    <p className="text-sm leading-6 text-neutral-500">{item.problem}</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                    <p className="text-sm font-medium leading-6 text-white">
                      {item.solution}
                    </p>
                  </div>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trending ── */}
      <section className="bg-[#0A0A0A] py-20">
        <div className="mx-auto max-w-3xl px-6">
          <AnimateIn>
            <div className="flex items-end justify-between">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                지금 뜨는 프로젝트
              </h2>
              <Link
                href="/projects"
                className="hidden items-center gap-1 text-sm text-neutral-400 transition hover:text-white sm:inline-flex"
              >
                전체 보기 <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </AnimateIn>

          <div className="mt-10 divide-y divide-neutral-800">
            {hasProjects
              ? data.featured.slice(0, 6).map((p, i) => (
                  <AnimateIn key={p.id} delay={i * 60}>
                    <ProjectRow rank={i + 1} project={p} />
                  </AnimateIn>
                ))
              : DUMMY_PROJECTS.slice(0, 6).map((p) => (
                  <AnimateIn key={p.rank} delay={p.rank * 60}>
                    <DarkProjectListItem {...p} />
                  </AnimateIn>
                ))}
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="bg-[#111111] py-20">
        <div className="mx-auto max-w-3xl px-6">
          <AnimateIn>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              카테고리
            </h2>
          </AnimateIn>
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {CATEGORIES.map((cat, i) => {
              const Icon = cat.icon;
              return (
                <AnimateIn key={cat.slug} delay={i * 80}>
                  <Link
                    href={`/projects?category=${cat.slug}`}
                    className="flex flex-col items-center gap-3 rounded-2xl border border-neutral-800 bg-neutral-900/50 px-4 py-6 transition hover:border-neutral-600"
                  >
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl ${cat.color}`}
                    >
                      <Icon className={`h-6 w-6 ${cat.iconColor}`} />
                    </div>
                    <span className="text-sm font-semibold">{cat.label}</span>
                    <span className="text-xs text-neutral-500">
                      {cat.count} projects
                    </span>
                  </Link>
                </AnimateIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="bg-[#0A0A0A] py-20">
        <div className="mx-auto max-w-3xl px-6">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {STATS.map((stat, i) => (
              <AnimateIn key={stat.label} delay={i * 100}>
                <div className="text-center">
                  <p className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                    {stat.value}
                  </p>
                  <p className="mt-2 text-xs text-neutral-500">{stat.label}</p>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-[#111111] px-6 py-24 text-center">
        <AnimateIn>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            당신의 프로덕트를 세상에 알리세요.
            <br />
            <span className="text-neutral-400">Vibeollio가 연결합니다.</span>
          </h2>
          <div className="mt-8">
            <Link
              href="/submit"
              className="inline-flex items-center rounded-full border border-neutral-700 px-8 py-3 text-sm font-semibold text-white transition hover:border-neutral-500 hover:bg-neutral-900"
            >
              시작하기
            </Link>
          </div>
        </AnimateIn>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-neutral-800 bg-[#111111] px-6 py-8">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <span className="text-xs text-neutral-400">&copy; 2026 Vibeollio</span>
          <div className="flex gap-6">
            <Link
              href="/about"
              className="text-xs text-neutral-500 hover:text-white"
            >
              About
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-neutral-500 hover:text-white"
            >
              GitHub
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-neutral-500 hover:text-white"
            >
              Twitter
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ── Sub-components ── */

function ProjectRow({
  rank,
  project,
}: {
  rank: number;
  project: SerializedProjectCard;
}) {
  return (
    <Link
      href={`/p/${project.slug}`}
      className="flex items-center gap-4 rounded-lg py-4 transition hover:bg-neutral-900/50 sm:gap-6"
    >
      <span className="w-8 shrink-0 text-center text-sm font-medium text-neutral-600">
        {String(rank).padStart(2, "0")}
      </span>
      {project.coverImageUrl ? (
        <img
          src={project.coverImageUrl}
          alt=""
          className="h-9 w-9 shrink-0 rounded-lg object-cover"
        />
      ) : (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-800 text-lg">
          {getCategoryLabel(project.category).charAt(0)}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{project.title}</p>
        <p className="truncate text-xs text-neutral-500">{project.tagline}</p>
      </div>
      <div className="flex shrink-0 items-center gap-1.5 text-sm text-neutral-400">
        <ChevronUp className="h-4 w-4" />
        <span>{project.metrics.score}</span>
      </div>
    </Link>
  );
}

function DarkProjectListItem({
  rank,
  title,
  desc,
  icon,
  score,
}: {
  rank: number;
  title: string;
  desc: string;
  icon: string;
  score: number;
}) {
  return (
    <div className="flex items-center gap-4 rounded-lg py-4 transition hover:bg-neutral-900/50 sm:gap-6">
      <span className="w-8 shrink-0 text-center text-sm font-medium text-neutral-600">
        {String(rank).padStart(2, "0")}
      </span>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-800 text-lg">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{title}</p>
        <p className="truncate text-xs text-neutral-500">{desc}</p>
      </div>
      <div className="flex shrink-0 items-center gap-1.5 text-sm text-neutral-400">
        <ChevronUp className="h-4 w-4" />
        <span>{score}</span>
      </div>
    </div>
  );
}
