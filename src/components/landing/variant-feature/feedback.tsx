"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useVariantNav } from "../landing-variant-switcher";
import { useLocale } from "@/lib/i18n/locale-context";
import {
  Search,
  Triangle,
  MousePointerClick,
  Star,
  MessageSquare,
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

/* ══════════════════════════════════════════ */

export function FeatureFeedback() {
  const { subPage, navigate } = useVariantNav();
  const { t } = useLocale();
  const [searchQuery, setSearchQuery] = useState("");

  const V2_NAV = [
    { page: "home" as const, label: t.nav.home },
    { page: "products" as const, label: t.nav.products },
    { page: "trending" as const, label: t.nav.trending },
    { page: "new" as const, label: t.nav.new },
    { page: "feedback" as const, label: t.nav.feedback },
  ];

  const heroAnim = useScrollAnimation(0.1);
  const cardsAnim = useScrollAnimation();
  const howAnim = useScrollAnimation();
  const ctaAnim = useScrollAnimation();

  /* filter projects that have feedback questions + search */
  const feedbackProjects = DUMMY_PROJECTS.filter((p) => {
    if (!p.feedbackQuestion) return false;
    if (!searchQuery) return true;
    return (
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.feedbackQuestion.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

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
            <MessageSquare className="h-3.5 w-3.5" /> 피드백 요청
          </span>
          <h2 className="mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl">
            당신의 <span style={{ color: ACCENT }}>피드백</span>이 필요해요
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-neutral-400 sm:text-base">
            제작자들이 여러분의 의견을 기다리고 있습니다. 직접 사용해보고 솔직한 피드백을 남겨주세요.
          </p>

          {/* search */}
          <div className="mx-auto mt-8 flex max-w-md items-center gap-2 rounded-full border border-neutral-700 bg-neutral-900 px-4 py-2.5">
            <Search className="h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder="프로젝트 또는 피드백 질문 검색..."
              className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-neutral-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <p className="mt-4 text-xs text-neutral-400">
            {feedbackProjects.length}개 프로젝트가 피드백을 기다리고 있어요
          </p>
        </div>
      </section>

      {/* ── Feedback Cards ── */}
      <section className="bg-[#111111] px-4 py-16 sm:px-6">
        <div
          ref={cardsAnim.ref}
          className={`mx-auto max-w-5xl transition-all duration-700 delay-100 ${
            cardsAnim.isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          {feedbackProjects.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-lg font-semibold text-neutral-400">검색 결과가 없습니다</p>
              <p className="mt-2 text-sm text-neutral-400">다른 키워드로 검색해보세요.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {feedbackProjects.map((p, i) => (
                <div
                  key={i}
                  className="group overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/50 transition hover:-translate-y-2 hover:border-neutral-600"
                >
                  {/* card header */}
                  <div className="p-5">
                    <div className="flex items-start gap-3">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-neutral-800 overflow-hidden">
                        <img src={p.icon} alt={p.title} className="h-full w-full object-cover" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="truncate text-base font-bold">{p.title}</h3>
                          <CategoryBadge category={p.category} />
                        </div>
                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-neutral-400">
                          {p.tagline}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-4 text-xs text-neutral-400">
                      <span className="inline-flex items-center gap-1">
                        <MousePointerClick className="h-3 w-3" style={{ color: ACCENT }} />
                        {p.tries.toLocaleString()}
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

                  {/* feedback question area */}
                  <div className="border-t border-neutral-800 bg-neutral-800/50 p-5">
                    <div className="flex items-start gap-2">
                      <MessageSquare className="mt-0.5 h-4 w-4 shrink-0" style={{ color: ACCENT }} />
                      <p className="text-sm italic leading-5 text-neutral-400">
                        &ldquo;{p.feedbackQuestion}&rdquo;
                      </p>
                    </div>

                    <button
                      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                      style={{ backgroundColor: "#10B981" }}
                    >
                      <MessageSquare className="h-4 w-4" />
                      Give Feedback
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="bg-[#0A0A0A] px-4 py-16 sm:px-6">
        <div
          ref={howAnim.ref}
          className={`mx-auto max-w-5xl transition-all duration-700 delay-100 ${
            howAnim.isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
            피드백은 이렇게 작동해요
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {[
              { step: "1", title: "프로젝트 체험", desc: "Try 버튼을 눌러 프로젝트를 직접 사용해보세요." },
              { step: "2", title: "질문에 답변", desc: "제작자가 궁금해하는 포인트에 솔직한 의견을 남기세요." },
              { step: "3", title: "제작자에게 전달", desc: "피드백은 제작자에게 바로 전달되어 개선에 반영됩니다." },
            ].map((s) => (
              <div
                key={s.step}
                className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6 text-center transition hover:-translate-y-1 hover:border-neutral-600"
              >
                <div
                  className="mx-auto flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold text-white"
                  style={{ backgroundColor: ACCENT }}
                >
                  {s.step}
                </div>
                <h3 className="mt-4 text-base font-bold">{s.title}</h3>
                <p className="mt-2 text-sm leading-5 text-neutral-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-[#111111] px-4 py-16 sm:px-6">
        <div
          ref={ctaAnim.ref}
          className={`mx-auto max-w-5xl transition-all duration-700 delay-100 ${
            ctaAnim.isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <div className="rounded-3xl border border-neutral-800 bg-[#0A0A0A] px-6 py-16 text-center sm:px-12">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              피드백이 필요한 프로젝트가 있나요?
              <br />
              <span style={{ color: ACCENT }}>지금 등록하세요</span>
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-neutral-400">
              피드백 질문을 설정하면 커뮤니티의 솔직한 의견을 받을 수 있습니다.
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
