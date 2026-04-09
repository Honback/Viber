"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  ChevronUp,
} from "lucide-react";
import { useVariantNav } from "../landing-variant-switcher";
import { Logo } from "@/components/ui/logo";
import { DEMO_PROJECTS, toMinimalTrendingShape } from "@/lib/demo-projects";

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

/* ── accent ── */
const ACCENT = "#d76542";

/* ── nav ── */
const V3_NAV = [
  { page: "products" as const, label: "프로젝트" },
  { page: "trending" as const, label: "트렌딩" },
  { page: "feedback" as const, label: "피드백" },
];

/* ── period filter ── */
const PERIODS = ["오늘", "이번 주", "이번 달", "전체"] as const;
type Period = (typeof PERIODS)[number];

/* ── 10 demo projects ── */
const DUMMY_PROJECTS = DEMO_PROJECTS.map(toMinimalTrendingShape);

export function MinimalTrending() {
  const { subPage, navigate } = useVariantNav();
  const [activePeriod, setActivePeriod] = useState<Period>("이번 주");

  /* simulate different ordering per period */
  const sorted = useMemo(() => {
    const copy = [...DUMMY_PROJECTS];
    if (activePeriod === "오늘") {
      copy.sort((a, b) => parseInt(b.delta) - parseInt(a.delta));
    } else if (activePeriod === "이번 달") {
      copy.sort((a, b) => b.score - a.score);
    } else if (activePeriod === "전체") {
      copy.sort((a, b) => b.score - a.score);
    }
    return copy;
  }, [activePeriod]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Header */}
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
                  subPage === item.page ? "text-white" : "text-neutral-400"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
          <Link href="/submit" className="text-sm font-medium text-white transition hover:opacity-80" style={{ color: ACCENT }}>
            등록하기
          </Link>
        </div>
      </header>

      {/* Title + Period chips */}
      <section className="bg-[#0A0A0A] px-4 pb-6 pt-16">
        <div className="mx-auto max-w-3xl px-6">
          <AnimateIn>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              트렌딩
            </h1>
            <p className="mt-2 text-sm text-neutral-400">
              지금 가장 주목받는 프로젝트를 확인하세요.
            </p>
          </AnimateIn>

          <AnimateIn delay={100}>
            <div className="mt-6 flex flex-wrap gap-2">
              {PERIODS.map((period) => (
                <button
                  key={period}
                  onClick={() => setActivePeriod(period)}
                  className={`rounded-full border px-4 py-1.5 text-xs font-medium transition ${
                    activePeriod === period
                      ? "border-white bg-white text-black"
                      : "border-neutral-800 text-neutral-400 hover:border-neutral-600 hover:text-white"
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </AnimateIn>
        </div>
      </section>

      {/* Numbered list */}
      <section className="bg-[#111111] px-4 py-12">
        <div className="mx-auto max-w-3xl px-6">
          <div className="divide-y divide-neutral-800">
            {sorted.map((p, i) => (
              <AnimateIn key={p.id} delay={i * 40}>
                <div className="flex items-center gap-4 rounded-lg py-4 transition hover:bg-neutral-900/50 sm:gap-6">
                  <span className="w-8 shrink-0 text-center text-sm font-medium text-neutral-600">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-800 overflow-hidden">
                    <img src={p.icon} alt={p.title} className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold">{p.title}</p>
                      <span className="shrink-0 rounded-full bg-neutral-800 px-2 py-0.5 text-[10px] text-neutral-400">
                        {p.category}
                      </span>
                    </div>
                    <p className="truncate text-xs text-neutral-500">{p.desc}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-center gap-0.5">
                    <ChevronUp className="h-4 w-4 text-neutral-400" />
                    <span className="text-sm font-semibold">{p.score}</span>
                    <span className="text-[10px] text-emerald-500">
                      {p.delta}
                    </span>
                  </div>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-800 bg-[#111111] px-6 py-8">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <span className="text-xs text-neutral-500">&copy; 2026 Vibeollio</span>
          <div className="flex gap-6">
            <Link href="/about" className="text-xs text-neutral-400 hover:text-white">
              About
            </Link>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-xs text-neutral-400 hover:text-white">
              GitHub
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-xs text-neutral-400 hover:text-white">
              Twitter
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
