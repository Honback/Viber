import Link from "next/link";
import { FileText, FolderKanban, Shield, Sparkles } from "lucide-react";

import type { SessionProfile } from "@/lib/auth/session";
import { navLinks } from "@/lib/constants";

const ACCENT = "#d76542";

type SiteHeaderProps = {
  viewer: SessionProfile | null;
};

export function SiteHeader({ viewer }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-neutral-800 bg-[#0A0A0A]/90 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center gap-4 px-4 sm:px-6">

        {/* 로고 */}
        <Link href="/" className="flex shrink-0 items-center gap-1.5 text-lg font-bold" style={{ color: ACCENT }}>
          🚀 Viber
        </Link>

        {/* 네비게이션 */}
        <nav className="flex items-center gap-1">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3.5 py-1.5 text-sm font-semibold text-neutral-400 transition hover:bg-neutral-800 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
          <Link href="/submit" className="rounded-full px-3.5 py-1.5 text-sm font-semibold text-white transition hover:opacity-90" style={{ backgroundColor: ACCENT }}>
            등록하기
          </Link>
        </nav>

        {/* 스페이서 */}
        <div className="flex-1" />

        {/* 우측 액션 */}
        <div className="flex shrink-0 items-center gap-2">
          {viewer ? (
            <>
              <Link href="/me/saved" className="hidden whitespace-nowrap rounded-full border border-neutral-700 px-3.5 py-1.5 text-sm font-semibold text-neutral-300 transition hover:bg-neutral-800 sm:inline-flex">
                저장함
              </Link>
              <Link href="/me/projects" className="hidden items-center gap-1.5 whitespace-nowrap rounded-full border border-neutral-700 px-3.5 py-1.5 text-sm font-semibold text-neutral-300 transition hover:bg-neutral-800 lg:inline-flex">
                <FolderKanban className="size-3.5" /> 내 프로젝트
              </Link>
              {viewer.role === "admin" && (
                <>
                  <Link href="/admin/moderation" className="hidden items-center gap-1.5 whitespace-nowrap rounded-full border border-neutral-700 px-3.5 py-1.5 text-sm font-semibold text-neutral-300 transition hover:bg-neutral-800 lg:inline-flex">
                    <Shield className="size-3.5" /> 운영
                  </Link>
                  <Link href="/admin/blog" className="hidden items-center gap-1.5 whitespace-nowrap rounded-full border border-neutral-700 px-3.5 py-1.5 text-sm font-semibold text-neutral-300 transition hover:bg-neutral-800 lg:inline-flex">
                    <FileText className="size-3.5" /> 블로그
                  </Link>
                </>
              )}
              <span className="hidden whitespace-nowrap rounded-full bg-neutral-800 px-3 py-1.5 text-sm font-semibold sm:inline-flex items-center gap-1.5" style={{ color: ACCENT }}>
                {viewer.displayName}
                {viewer.role === "admin" && (
                  <span className="rounded bg-neutral-700 px-1.5 py-0.5 text-[10px] font-bold text-neutral-200">ADMIN</span>
                )}
              </span>
              <form action="/api/auth/logout" method="post">
                <button className="whitespace-nowrap rounded-full border border-neutral-700 px-3.5 py-1.5 text-sm font-semibold text-neutral-300 transition hover:bg-neutral-800">
                  로그아웃
                </button>
              </form>
            </>
          ) : (
            <Link href="/auth/sign-in?next=/me/projects" className="inline-flex whitespace-nowrap items-center rounded-full px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90" style={{ backgroundColor: ACCENT }}>
              로그인
            </Link>
          )}
        </div>

      </div>
    </header>
  );
}
