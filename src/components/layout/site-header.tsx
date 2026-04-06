import Link from "next/link";
import { FileText, FolderKanban, Shield } from "lucide-react";

import type { SessionProfile } from "@/lib/auth/session";

const ACCENT = "#d76542";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/feature/products", label: "Products" },
  { href: "/feature/trending", label: "Trending" },
  { href: "/feature/new", label: "New" },
  { href: "/feature/feedback", label: "Feedback" },
];

type SiteHeaderProps = {
  viewer: SessionProfile | null;
};

export function SiteHeader({ viewer }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-neutral-800 bg-[#0A0A0A]/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-4 px-4 sm:px-6">

        {/* 로고 */}
        <Link href="/" className="flex items-center gap-1.5 text-lg font-bold" style={{ color: ACCENT }}>
          🚀 Viber
        </Link>

        {/* 네비게이션 — 랜딩과 동일 구조 */}
        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3.5 py-1.5 text-sm font-semibold text-neutral-400 transition hover:bg-neutral-800 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
          <Link href="/blog" className="rounded-full px-3.5 py-1.5 text-sm font-semibold transition hover:opacity-80" style={{ color: "#ccc" }}>
            블로그
          </Link>
          <Link href="/submit" className="rounded-full px-3.5 py-1.5 text-sm font-semibold text-white transition hover:opacity-90" style={{ backgroundColor: ACCENT }}>
            등록하기
          </Link>
        </nav>

        {/* 스페이서 */}
        <div className="flex-1" />

        {/* 우측 */}
        <div className="flex items-center gap-2">
          {viewer ? (
            <>
              {viewer.role === "admin" && (
                <>
                  <Link href="/admin/moderation" className="hidden items-center gap-1.5 rounded-full border border-neutral-700 px-3 py-1.5 text-sm font-semibold text-neutral-300 transition hover:bg-neutral-800 lg:inline-flex">
                    <Shield className="size-3.5" /> 운영
                  </Link>
                  <Link href="/admin/blog" className="hidden items-center gap-1.5 rounded-full border border-neutral-700 px-3 py-1.5 text-sm font-semibold text-neutral-300 transition hover:bg-neutral-800 lg:inline-flex">
                    <FileText className="size-3.5" /> 블로그
                  </Link>
                </>
              )}
              <span className="rounded-full bg-neutral-800 px-3 py-1.5 text-sm font-semibold" style={{ color: ACCENT }}>
                {viewer.displayName}
              </span>
            </>
          ) : (
            <Link href="/auth/sign-in" className="rounded-full px-4 py-2 text-sm font-semibold text-white" style={{ backgroundColor: ACCENT }}>
              로그인
            </Link>
          )}
        </div>

      </div>
    </header>
  );
}
