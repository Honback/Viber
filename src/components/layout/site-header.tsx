"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { FileText, Globe, Shield, ChevronDown, Menu, X } from "lucide-react";

import type { SessionProfile } from "@/lib/auth/session";
import { useLocale } from "@/lib/i18n/locale-context";
import { Logo } from "@/components/ui/logo";

const ACCENT = "#d76542";

const CATEGORIES = [
  { value: "all", label: "전체", href: "/feature/products" },
  { value: "productivity", label: "생산성", href: "/projects?category=productivity" },
  { value: "creator", label: "크리에이터 도구", href: "/projects?category=creator" },
  { value: "health", label: "헬스케어", href: "/projects?category=health" },
  { value: "developer-tools", label: "개발 도구", href: "/projects?category=developer-tools" },
  { value: "education", label: "교육", href: "/projects?category=education" },
];

type SiteHeaderProps = {
  viewer: SessionProfile | null;
};

export function SiteHeader({ viewer }: SiteHeaderProps) {
  const { locale, toggleLocale, t } = useLocale();
  const [catOpen, setCatOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const catRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (catRef.current && !catRef.current.contains(e.target as Node)) {
        setCatOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Close mobile menu on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMobileOpen(false);
        setCatOpen(false);
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  const NAV_BEFORE = [
    { href: "/", label: t.nav.home },
  ];
  const NAV_AFTER = [
    { href: "/feature/trending", label: t.nav.trending },
    { href: "/feature/new", label: t.nav.new },
    { href: "/feature/feedback", label: t.nav.feedback },
  ];

  const allNavLinks = [
    ...NAV_BEFORE,
    { href: "/feature/products", label: t.nav.products },
    ...NAV_AFTER,
    { href: "/discover", label: t.nav.discover },
    { href: "/blog", label: t.nav.blog },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-800 bg-[#0A0A0A]/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-4 px-4 sm:px-6">

        <Link href="/" className="flex items-center gap-1.5">
          <Logo height={22} />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_BEFORE.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3.5 py-1.5 text-sm font-semibold text-neutral-400 transition hover:bg-neutral-800 hover:text-white"
            >
              {item.label}
            </Link>
          ))}

          {/* Products with category dropdown */}
          <div ref={catRef} className="relative">
            <button
              onClick={() => setCatOpen(!catOpen)}
              aria-expanded={catOpen}
              aria-haspopup="true"
              style={{ font: "inherit", color: "inherit" }}
              className="rounded-full px-3.5 py-1.5 text-sm font-semibold text-neutral-400 transition hover:bg-neutral-800 hover:text-white"
            >
              {t.nav.products}<ChevronDown className={`ml-0.5 -mt-px inline-block h-3 w-3 align-middle opacity-50 transition ${catOpen ? "rotate-180" : ""}`} />
            </button>
            {catOpen && (
              <div className="absolute left-0 top-full mt-2 w-48 overflow-hidden rounded-xl border border-neutral-700 bg-[#141414] py-1 shadow-xl">
                {CATEGORIES.map((cat) => (
                  <Link
                    key={cat.value}
                    href={cat.href}
                    onClick={() => setCatOpen(false)}
                    className="block px-4 py-2.5 text-sm text-neutral-300 transition hover:bg-neutral-800 hover:text-white"
                  >
                    {cat.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {NAV_AFTER.map((item) => (
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
              <span className="hidden rounded-full bg-neutral-800 px-3 py-1.5 text-sm font-semibold sm:inline" style={{ color: ACCENT }}>
                {viewer.displayName}
              </span>
            </>
          ) : (
            <Link href="/auth/sign-in" className="hidden rounded-full px-4 py-2 text-sm font-semibold text-white sm:inline-block" style={{ backgroundColor: ACCENT }}>
              {t.nav.login}
            </Link>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex items-center justify-center rounded-lg p-1.5 text-neutral-400 transition hover:bg-neutral-800 hover:text-white md:hidden"
            aria-expanded={mobileOpen}
            aria-label="메뉴 열기"
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>

      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <nav className="border-t border-neutral-800 bg-[#0A0A0A] px-4 pb-4 pt-2 md:hidden">
          <div className="flex flex-col gap-1">
            {allNavLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-semibold text-neutral-300 transition hover:bg-neutral-800 hover:text-white"
              >
                {item.label}
              </Link>
            ))}

            {/* Category sub-links */}
            <div className="ml-3 flex flex-col gap-1 border-l border-neutral-800 pl-3">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.value}
                  href={cat.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm text-neutral-500 transition hover:bg-neutral-800 hover:text-white"
                >
                  {cat.label}
                </Link>
              ))}
            </div>

            <Link
              href="/submit"
              onClick={() => setMobileOpen(false)}
              className="mt-2 rounded-full px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:opacity-90"
              style={{ backgroundColor: ACCENT }}
            >
              {t.nav.submit}
            </Link>

            {viewer ? (
              <div className="mt-1 flex items-center gap-2 px-3 py-2 text-sm">
                <span className="font-semibold" style={{ color: ACCENT }}>{viewer.displayName}</span>
              </div>
            ) : (
              <Link
                href="/auth/sign-in"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-semibold text-neutral-300 transition hover:bg-neutral-800 hover:text-white"
              >
                {t.nav.login}
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
