import Link from "next/link";
import { Compass, FileText, Flame, FolderKanban, Home, MessageSquareText, Package, PlusCircle, Search, Shield, Sparkles, Zap } from "lucide-react";
import type { ReactNode } from "react";

import type { SessionProfile } from "@/lib/auth/session";


type SiteHeaderProps = {
  viewer: SessionProfile | null;
};

const navItems: { href: string; label: string; icon: ReactNode }[] = [
  { href: "/", label: "홈", icon: <Home className="size-4" /> },
  { href: "/products", label: "제품", icon: <Package className="size-4" /> },
  { href: "/trending", label: "트렌딩", icon: <Flame className="size-4" /> },
  { href: "/new", label: "뉴", icon: <Zap className="size-4" /> },
  { href: "/feedback", label: "피드백", icon: <MessageSquareText className="size-4" /> },
  { href: "/projects", label: "탐색", icon: <Compass className="size-4" /> },
  { href: "/submit", label: "등록하기", icon: <PlusCircle className="size-4" /> },
];

export function SiteHeader({ viewer }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-[1280px] items-center gap-1.5 px-4 sm:gap-3 sm:px-6">

        {/* 로고 */}
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="grid size-9 place-items-center rounded-xl bg-foreground text-background">
            <Sparkles className="size-4" />
          </span>
          <span className="hidden whitespace-nowrap text-base font-extrabold tracking-tight sm:block">
            Viber
          </span>
        </Link>

        {/* 검색 — 모바일: 아이콘, sm+: 검색바 */}
        <Link
          href="/projects"
          className="grid size-9 shrink-0 place-items-center rounded-full text-foreground-muted transition hover:bg-surface-muted hover:text-foreground sm:hidden"
          aria-label="검색"
        >
          <Search className="size-4" />
        </Link>
        <Link
          href="/projects"
          className="hidden h-9 w-44 shrink-0 items-center gap-2 rounded-full border border-line bg-surface-muted px-3 text-sm text-foreground-muted transition hover:bg-line-strong sm:flex"
        >
          <Search className="size-3.5 shrink-0" />
          <span className="flex-1 whitespace-nowrap">검색</span>
          <kbd className="rounded border border-line bg-surface px-1.5 py-0.5 text-[10px] font-medium text-foreground-muted">
            ⌘K
          </kbd>
        </Link>

        {/* 네비게이션 — 모바일: 아이콘, sm+: 텍스트 */}
        <nav className="flex shrink-0 items-center">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="grid size-9 place-items-center rounded-full text-foreground-muted transition hover:bg-surface-muted hover:text-foreground sm:flex sm:size-auto sm:whitespace-nowrap sm:px-3.5 sm:py-2"
              aria-label={item.label}
            >
              <span className="sm:hidden">{item.icon}</span>
              <span className="hidden text-sm font-semibold sm:inline">{item.label}</span>
            </Link>
          ))}
          {viewer?.role === "admin" && (
            <>
              <Link href="/admin/moderation" className="hidden items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-semibold text-foreground-muted transition hover:bg-surface-muted hover:text-foreground lg:inline-flex">
                <Shield className="size-3.5" /> 운영
              </Link>
              <Link href="/admin/projects" className="hidden items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-semibold text-foreground-muted transition hover:bg-surface-muted hover:text-foreground lg:inline-flex">
                <FolderKanban className="size-3.5" /> 프로젝트 관리
              </Link>
            </>
          )}
        </nav>

        {/* 스페이서 */}
        <div className="flex-1" />

        {/* 우측 액션 */}
        <div className="flex shrink-0 items-center gap-2">
          {viewer ? (
            <>
              <Link href="/me/saved" className="hidden whitespace-nowrap rounded-full border border-line bg-surface px-4 py-2 text-sm font-semibold transition hover:bg-surface-muted sm:inline-flex">
                저장함
              </Link>
              <Link href="/me/projects" className="hidden items-center gap-1.5 whitespace-nowrap rounded-full border border-line bg-surface px-4 py-2 text-sm font-semibold transition hover:bg-surface-muted lg:inline-flex">
                <FolderKanban className="size-3.5" /> 내 프로젝트
              </Link>
              {viewer.role === "admin" && (
                <>
                  <Link href="/admin/moderation" className="hidden items-center gap-1.5 whitespace-nowrap rounded-full border border-line bg-surface px-4 py-2 text-sm font-semibold transition hover:bg-surface-muted lg:inline-flex">
                    <Shield className="size-3.5" /> 운영
                  </Link>
                  <Link href="/admin/blog" className="hidden items-center gap-1.5 whitespace-nowrap rounded-full border border-line bg-surface px-4 py-2 text-sm font-semibold transition hover:bg-surface-muted lg:inline-flex">
                    <FileText className="size-3.5" /> 블로그
                  </Link>
                </>
              )}
              <span className="hidden whitespace-nowrap rounded-full bg-[rgba(47,106,97,0.1)] px-3.5 py-2 text-sm font-semibold text-green sm:inline-flex items-center gap-1.5">
                {viewer.displayName}
                {viewer.role === "admin" && (
                  <span className="rounded bg-surface px-1.5 py-0.5 text-[10px] font-bold text-foreground">ADMIN</span>
                )}
              </span>
              <form action="/api/auth/logout" method="post">
                <button className="whitespace-nowrap rounded-full border border-line bg-surface px-4 py-2 text-sm font-semibold transition hover:bg-surface-muted">
                  로그아웃
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/auth/sign-in?next=/me/projects" className="inline-flex whitespace-nowrap items-center rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90">
                로그인
              </Link>
            </>
          )}
        </div>

      </div>
    </header>
  );
}
