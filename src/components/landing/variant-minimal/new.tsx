"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Clock,
  Search,
} from "lucide-react";
import { useVariantNav } from "../landing-variant-switcher";

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

/* ── dummy projects with timeAgo ── */
const DUMMY_PROJECTS = [
  { id: 1, title: "VibeAI", desc: "자연어로 UI를 생성하는 AI 디자인 도구", icon: "", category: "AI / ML", tags: ["AI", "디자인"], timeAgo: "2시간 전" },
  { id: 2, title: "SnapDeploy", desc: "Git push 한 번으로 서버리스 배포 완료", icon: "", category: "개발 도구", tags: ["배포", "서버리스"], timeAgo: "4시간 전" },
  { id: 3, title: "PixelForge", desc: "브라우저에서 실행되는 픽셀아트 에디터", icon: "", category: "디자인", tags: ["에디터", "픽셀아트"], timeAgo: "5시간 전" },
  { id: 4, title: "DataPulse", desc: "실시간 데이터 파이프라인 모니터링 대시보드", icon: "", category: "SaaS", tags: ["데이터", "모니터링"], timeAgo: "6시간 전" },
  { id: 5, title: "IndieCraft", desc: "인디 게임 개발자 커뮤니티 & 잼 플랫폼", icon: "", category: "게임", tags: ["커뮤니티", "게임잼"], timeAgo: "8시간 전" },
  { id: 6, title: "FormFlow", desc: "드래그앤드롭으로 폼을 만드는 노코드 빌더", icon: "", category: "웹 서비스", tags: ["노코드", "폼"], timeAgo: "10시간 전" },
  { id: 7, title: "NightOwl", desc: "개발자를 위한 다크 테마 포모도로 타이머", icon: "", category: "개발 도구", tags: ["생산성", "타이머"], timeAgo: "12시간 전" },
  { id: 8, title: "CodeBridge", desc: "팀 코드 리뷰를 자동화하는 GitHub 앱", icon: "", category: "개발 도구", tags: ["코드리뷰", "GitHub"], timeAgo: "1일 전" },
  { id: 9, title: "MarkdownPro", desc: "실시간 협업이 가능한 마크다운 에디터", icon: "", category: "웹 서비스", tags: ["마크다운", "협업"], timeAgo: "1일 전" },
  { id: 10, title: "BotFactory", desc: "노코드로 챗봇을 만드는 AI 빌더", icon: "", category: "AI / ML", tags: ["챗봇", "노코드"], timeAgo: "1일 전" },
  { id: 11, title: "TinyAnalytics", desc: "프라이버시 중심의 경량 웹 분석 도구", icon: "", category: "SaaS", tags: ["분석", "프라이버시"], timeAgo: "2일 전" },
  { id: 12, title: "SoundScape", desc: "AI로 배경음악을 생성하는 앰비언트 도구", icon: "", category: "AI / ML", tags: ["음악", "생성AI"], timeAgo: "2일 전" },
  { id: 13, title: "QuizMaker", desc: "인터랙티브 퀴즈를 5분 만에 제작", icon: "", category: "웹 서비스", tags: ["퀴즈", "교육"], timeAgo: "3일 전" },
  { id: 14, title: "LogStream", desc: "멀티 서버 로그를 실시간 스트리밍", icon: "", category: "개발 도구", tags: ["로그", "모니터링"], timeAgo: "3일 전" },
  { id: 15, title: "GitNotify", desc: "GitHub 이벤트를 슬랙/디스코드로 알림", icon: "", category: "API", tags: ["GitHub", "알림"], timeAgo: "4일 전" },
  { id: 16, title: "PaletteAI", desc: "AI가 추천하는 컬러 팔레트 생성기", icon: "", category: "디자인", tags: ["컬러", "AI"], timeAgo: "5일 전" },
  { id: 17, title: "MicroSaaS", desc: "마이크로 SaaS 보일러플레이트 스타터킷", icon: "", category: "SaaS", tags: ["보일러플레이트", "스타터킷"], timeAgo: "6일 전" },
];

export function MinimalNew() {
  const { subPage, navigate } = useVariantNav();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (search === "") return DUMMY_PROJECTS;
    const q = search.toLowerCase();
    return DUMMY_PROJECTS.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.desc.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }, [search]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Header */}
      <header className="sticky top-[38px] z-50 border-b border-neutral-800 bg-[#0A0A0A]/90 backdrop-blur">
        <div className="mx-auto flex h-12 max-w-3xl items-center justify-between px-6">
          <button onClick={() => navigate("home")} className="text-base font-bold text-white">
            Vibeollio
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

      {/* Title + Search */}
      <section className="bg-[#0A0A0A] px-4 pb-6 pt-16">
        <div className="mx-auto max-w-3xl px-6">
          <AnimateIn>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              새로운 프로젝트
            </h1>
            <p className="mt-2 text-sm text-neutral-400">
              최근 등록된 프로젝트를 확인하세요.
            </p>
          </AnimateIn>

          <AnimateIn delay={100}>
            <div className="relative mt-8">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
              <input
                type="text"
                placeholder="프로젝트 검색..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-neutral-700 bg-neutral-900 py-3 pl-11 pr-4 text-sm text-white placeholder-neutral-500 outline-none transition focus:border-neutral-600 focus:ring-0"
              />
            </div>
          </AnimateIn>
        </div>
      </section>

      {/* Project list */}
      <section className="bg-[#111111] px-4 py-12">
        <div className="mx-auto max-w-3xl px-6">
          {filtered.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-sm text-neutral-500">검색 결과가 없습니다.</p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-800">
              {filtered.map((p, i) => (
                <AnimateIn key={p.id} delay={i * 40}>
                  <div className="flex items-center gap-4 rounded-lg py-5 transition hover:bg-neutral-900/50 sm:gap-6">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-800 text-lg">
                      {p.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate text-sm font-semibold">
                          {p.title}
                        </h3>
                        <div className="flex shrink-0 items-center gap-1 text-[11px] text-neutral-500">
                          <Clock className="h-3 w-3" />
                          <span>{p.timeAgo}</span>
                        </div>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-neutral-500">
                        {p.desc}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <span className="rounded-full bg-neutral-800 px-2 py-0.5 text-[10px] text-neutral-400">
                          {p.category}
                        </span>
                        {p.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-neutral-800/60 px-2 py-0.5 text-[10px] text-neutral-500"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </AnimateIn>
              ))}
            </div>
          )}
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
