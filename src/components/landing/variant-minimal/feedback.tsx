"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import {
  MessageCircle,
  Send,
} from "lucide-react";
import { useVariantNav } from "../landing-variant-switcher";
import { Logo } from "@/components/ui/logo";

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

/* ── dummy projects for feedback ── */
const DUMMY_PROJECTS = [
  { id: 1, title: "VibeAI", icon: "", question: "AI 디자인 도구의 UX가 직관적인가요? 어떤 기능이 더 필요할까요?", replies: 14 },
  { id: 2, title: "SnapDeploy", icon: "", question: "배포 프로세스에서 가장 불편한 점은 무엇인가요?", replies: 9 },
  { id: 3, title: "PixelForge", icon: "", question: "브라우저 기반 에디터의 성능은 충분한가요? 레이어 기능이 필요할까요?", replies: 11 },
  { id: 4, title: "DataPulse", icon: "", question: "대시보드에 어떤 차트 유형이 추가되면 좋을까요?", replies: 7 },
  { id: 5, title: "IndieCraft", icon: "", question: "게임잼 이벤트의 적정 기간은 얼마가 좋을까요?", replies: 18 },
  { id: 6, title: "FormFlow", icon: "", question: "노코드 폼 빌더에 조건부 로직이 꼭 필요한가요?", replies: 5 },
  { id: 7, title: "NightOwl", icon: "", question: "포모도로 타이머에 통계 기능이 있으면 사용하실 건가요?", replies: 12 },
  { id: 8, title: "CodeBridge", icon: "", question: "코드 리뷰 자동화에서 가장 중요한 체크 항목은 무엇인가요?", replies: 8 },
  { id: 9, title: "MarkdownPro", icon: "", question: "실시간 협업 시 충돌 해결은 어떤 방식이 좋을까요?", replies: 6 },
  { id: 10, title: "BotFactory", icon: "", question: "챗봇 빌더에서 가장 먼저 지원했으면 하는 채널은?", replies: 15 },
  { id: 11, title: "TinyAnalytics", icon: "", question: "웹 분석에서 꼭 필요한 지표 3가지는 무엇인가요?", replies: 3 },
  { id: 12, title: "SoundScape", icon: "", question: "AI 배경음악의 장르 선택지로 무엇이 필요할까요?", replies: 10 },
  { id: 13, title: "QuizMaker", icon: "", question: "퀴즈 유형 중 어떤 것을 가장 많이 사용하시나요?", replies: 4 },
  { id: 14, title: "LogStream", icon: "", question: "로그 스트리밍에서 필터/검색 기능이 충분한가요?", replies: 7 },
  { id: 15, title: "GitNotify", icon: "", question: "어떤 GitHub 이벤트 알림이 가장 유용한가요?", replies: 13 },
  { id: 16, title: "PaletteAI", icon: "", question: "컬러 팔레트 생성 시 이미지 업로드 기반 추출이 필요한가요?", replies: 2 },
  { id: 17, title: "MicroSaaS", icon: "", question: "보일러플레이트에 결제 연동이 기본 포함되어야 할까요?", replies: 16 },
];

export function MinimalFeedback() {
  const { subPage, navigate } = useVariantNav();
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

      {/* Title */}
      <section className="bg-[#0A0A0A] px-4 pb-6 pt-16">
        <div className="mx-auto max-w-3xl px-6">
          <AnimateIn>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              피드백
            </h1>
            <p className="mt-2 text-sm text-neutral-400">
              메이커들이 궁금해하는 질문에 의견을 남겨주세요.
            </p>
          </AnimateIn>
        </div>
      </section>

      {/* Feedback cards */}
      <section className="bg-[#111111] px-4 py-12">
        <div className="mx-auto max-w-3xl px-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {DUMMY_PROJECTS.map((p, i) => (
              <AnimateIn key={p.id} delay={i * 50}>
                <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-5 transition hover:border-neutral-600">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-800 text-base">
                      {p.icon}
                    </span>
                    <h3 className="text-sm font-semibold">{p.title}</h3>
                  </div>
                  <p className="mt-4 text-sm italic leading-6 text-neutral-400">
                    &ldquo;{p.question}&rdquo;
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                      <MessageCircle className="h-3.5 w-3.5" />
                      <span>{p.replies}개의 답변</span>
                    </div>
                    <button className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-700 px-3 py-1.5 text-xs font-medium text-white transition hover:border-neutral-500 hover:bg-neutral-800">
                      <Send className="h-3 w-3" />
                      피드백 보내기
                    </button>
                  </div>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#0A0A0A] px-4 py-16 text-center">
        <AnimateIn>
          <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
            당신의 프로젝트에도 피드백이 필요한가요?
          </h2>
          <p className="mt-2 text-sm text-neutral-400">
            프로젝트를 등록하고 커뮤니티의 의견을 받아보세요.
          </p>
          <div className="mt-6">
            <Link
              href="/submit"
              className="inline-flex items-center rounded-full border border-neutral-700 px-6 py-2.5 text-sm font-semibold text-white transition hover:border-neutral-500 hover:bg-neutral-900"
            >
              프로젝트 등록하기
            </Link>
          </div>
        </AnimateIn>
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
