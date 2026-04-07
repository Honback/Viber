"use client";

import Link from "next/link";
import { FileText, Globe, Shield } from "lucide-react";

import type { SessionProfile } from "@/lib/auth/session";
import { useLocale } from "@/lib/i18n/locale-context";
import { Logo } from "@/components/ui/logo";

const ACCENT = "#d76542";

type SiteHeaderProps = {
  viewer: SessionProfile | null;
};

export function SiteHeader({ viewer }: SiteHeaderProps) {
  const { locale, toggleLocale, t } = useLocale();

  const NAV_ITEMS = [
    { href: "/", label: t.nav.home },
    { href: "/feature/products", label: t.nav.products },
    { href: "/feature/trending", label: t.nav.trending },
    { href: "/feature/new", label: t.nav.new },
    { href: "/feature/feedback", label: t.nav.feedback },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-800 bg-[#0A0A0A]/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-4 px-4 sm:px-6">

        <Link href="/" className="flex items-center gap-1.5">
          <Logo height={22} />
        </Link>

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
          <Link href="/discover" className="rounded-full px-3.5 py-1.5 text-sm font-semibold text-neutral-400 transition hover:bg-neutral-800 hover:text-white">
            {t.nav.discover}
          </Link>
          <Link href="/blog" className="rounded-full px-3.5 py-1.5 text-sm font-semibold text-neutral-400 transition hover:bg-neutral-800 hover:text-white">
            {t.nav.blog}
          </Link>
          <Link href="/submit" className="rounded-full px-3.5 py-1.5 text-sm font-semibold text-white transition hover:opacity-90" style={{ backgroundColor: ACCENT }}>
            {t.nav.submit}
          </Link>
        </nav>

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          <button
            onClick={toggleLocale}
            className="flex items-center gap-1.5 rounded-full border border-neutral-700 px-3 py-1.5 text-xs font-semibold text-neutral-400 transition hover:bg-neutral-800 hover:text-white"
            title={locale === "ko" ? "Switch to English" : "한국어로 전환"}
          >
            <Globe className="size-3.5" />
            {locale === "ko" ? "EN" : "KO"}
          </button>

          {viewer ? (
            <>
              {viewer.role === "admin" && (
                <>
                  <Link href="/admin/moderation" className="hidden items-center gap-1.5 rounded-full border border-neutral-700 px-3 py-1.5 text-sm font-semibold text-neutral-300 transition hover:bg-neutral-800 lg:inline-flex">
                    <Shield className="size-3.5" /> {t.nav.admin}
                  </Link>
                  <Link href="/admin/blog" className="hidden items-center gap-1.5 rounded-full border border-neutral-700 px-3 py-1.5 text-sm font-semibold text-neutral-300 transition hover:bg-neutral-800 lg:inline-flex">
                    <FileText className="size-3.5" /> {t.nav.adminBlog}
                  </Link>
                </>
              )}
              <span className="rounded-full bg-neutral-800 px-3 py-1.5 text-sm font-semibold" style={{ color: ACCENT }}>
                {viewer.displayName}
              </span>
            </>
          ) : (
            <Link href="/auth/sign-in" className="rounded-full px-4 py-2 text-sm font-semibold text-white" style={{ backgroundColor: ACCENT }}>
              {t.nav.login}
            </Link>
          )}
        </div>

      </div>
    </header>
  );
}
