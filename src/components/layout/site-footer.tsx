"use client";

import Link from "next/link";
import { Logo } from "@/components/ui/logo";

const PRODUCT_CATEGORIES = [
  { label: "생산성", href: "/projects?category=productivity" },
  { label: "크리에이터 도구", href: "/projects?category=creator" },
  { label: "헬스케어", href: "/projects?category=health" },
  { label: "개발 도구", href: "/projects?category=developer-tools" },
  { label: "교육", href: "/projects?category=education" },
  { label: "전체 보기", href: "/projects" },
];

const TRENDING = [
  { label: "VibeAI", href: "/p/vibeai" },
  { label: "PixelForge", href: "/p/pixelforge" },
  { label: "DataPulse", href: "/p/datapulse" },
  { label: "FormFlow", href: "/p/formflow" },
  { label: "PaletteAI", href: "/p/paletteai" },
];

const ABOUT_LINKS = [
  { label: "Blog", href: "/blog" },
  { label: "Content Policy", href: "/policy/content" },
  { label: "Privacy", href: "/policy/privacy" },
  { label: "Submit Project", href: "/submit" },
];

const DISCOVER_LINKS = [
  { label: "Best Vibe Coding Tools", href: "/discover" },
  { label: "Trending Projects", href: "/feature/trending" },
  { label: "New Projects", href: "/feature/new" },
  { label: "Feedback Wanted", href: "/feature/feedback" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-neutral-800 bg-[#0A0A0A]">
      {/* Top: Category Grid */}
      <div className="mx-auto w-full max-w-6xl px-6 pt-12 pb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
          Top Product Categories
        </p>
        <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-2 sm:grid-cols-3 md:grid-cols-6">
          {PRODUCT_CATEGORIES.map((cat) => (
            <Link
              key={cat.label}
              href={cat.href}
              className="text-sm text-neutral-400 transition hover:text-white"
            >
              {cat.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="border-t border-neutral-800" />
      </div>

      {/* Bottom: 4-column links */}
      <div className="mx-auto w-full max-w-6xl px-6 py-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {/* Trending */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
              Trending
            </p>
            <ul className="mt-3 space-y-2">
              {TRENDING.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-sm text-neutral-400 transition hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Discover */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
              Discover
            </p>
            <ul className="mt-3 space-y-2">
              {DISCOVER_LINKS.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-sm text-neutral-400 transition hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
              About
            </p>
            <ul className="mt-3 space-y-2">
              {ABOUT_LINKS.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-sm text-neutral-400 transition hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Vibeollio */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
              Vibeollio
            </p>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="/submit" className="text-sm text-neutral-400 transition hover:text-white">
                  프로젝트 등록하기
                </Link>
              </li>
              <li>
                <Link href="/feature" className="text-sm text-neutral-400 transition hover:text-white">
                  홈
                </Link>
              </li>
              <li>
                <Link href="/discover" className="text-sm text-neutral-400 transition hover:text-white">
                  디스커버
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="flex flex-col items-center justify-between gap-4 border-t border-neutral-800 py-6 sm:flex-row">
          <div className="flex items-center gap-3">
            <Logo height={16} />
            <span className="text-xs text-neutral-500">
              Discover, try, and give feedback on vibe coding projects.
            </span>
          </div>
          <span className="text-xs text-neutral-600">
            &copy; {new Date().getFullYear()} Vibeollio
          </span>
        </div>
      </div>
    </footer>
  );
}
