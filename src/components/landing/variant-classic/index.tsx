/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { ArrowRight, MessageSquareText, BookMarked, Sparkles, Search, Home, Package, Flame, Zap, Compass, PlusCircle } from "lucide-react";

import { HeroBackground } from "@/components/ui/hero-background";
import { RotatingText } from "../rotating-text";
import { GeoFaqSection } from "../geo-faq-section";

import type { LandingVariantProps, SerializedProjectCard } from "../types";
import {
  TryButton,
  DetailLink,
  CTASection,
  formatRelativeFromString,
  getCategoryLabel,
  getPlatformLabel,
  getStageLabel,
} from "../shared";

const NAV_ITEMS = [
  { href: "/", label: "홈", icon: Home },
  { href: "/products", label: "제품", icon: Package },
  { href: "/trending", label: "트렌딩", icon: Flame },
  { href: "/new", label: "뉴", icon: Zap },
  { href: "/feedback", label: "피드백", icon: MessageSquareText },
  { href: "/projects", label: "탐색", icon: Compass },
  { href: "/submit", label: "등록하기", icon: PlusCircle },
];

export function VariantClassic({ data, viewer }: LandingVariantProps) {
  return (
    <div>
      {/* V1 헤더 */}
      <header className="sticky top-[38px] z-50 border-b border-line bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-[1280px] items-center gap-1.5 px-4 sm:gap-3 sm:px-6">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <span className="grid size-9 place-items-center rounded-xl bg-foreground text-background">
              <Sparkles className="size-4" />
            </span>
            <span className="hidden whitespace-nowrap text-base font-extrabold tracking-tight sm:block">Vibeollio</span>
          </Link>
          <Link href="/projects" className="hidden h-9 w-44 shrink-0 items-center gap-2 rounded-full border border-line bg-surface-muted px-3 text-sm text-foreground-muted transition hover:bg-line-strong sm:flex">
            <Search className="size-3.5 shrink-0" />
            <span className="flex-1 whitespace-nowrap">검색</span>
            <kbd className="rounded border border-line bg-surface px-1.5 py-0.5 text-[10px] font-medium text-foreground-muted">⌘K</kbd>
          </Link>
          <nav className="flex shrink-0 items-center">
            {NAV_ITEMS.map((item) => (
              <Link key={item.href} href={item.href} className="hidden whitespace-nowrap px-3.5 py-2 text-sm font-semibold text-foreground-muted transition hover:text-foreground sm:inline-flex">
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex-1" />
          <div className="flex shrink-0 items-center gap-2">
            {viewer ? (
              <span className="hidden rounded-full bg-[rgba(47,106,97,0.1)] px-3.5 py-2 text-sm font-semibold text-green sm:inline-flex">{viewer.displayName}</span>
            ) : (
              <Link href="/auth/sign-in" className="inline-flex whitespace-nowrap items-center rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90">로그인</Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero — 심플 */}
      <HeroBackground>
      <section className="mx-auto max-w-[1180px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl lg:leading-[1.1]">
          Vibeollio
          <br />
          <RotatingText />
        </h1>
        <p className="mx-auto mt-5 max-w-md text-sm text-foreground-muted">
          무료 등록 · 즉시 노출 · 실시간 피드백
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/submit" className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition hover:-translate-y-0.5">
            프로젝트 등록 (무료) <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/projects" className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-6 py-3 text-sm font-semibold text-foreground transition hover:-translate-y-0.5">
            둘러보기
          </Link>
        </div>
        {data.tags.length > 0 && (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {data.tags.slice(0, 8).map((tag) => (
              <Link key={tag.slug} href={`/tag/${tag.slug}`} className="text-xs font-medium text-foreground-muted/60 hover:text-foreground-muted transition">
                {tag.name}
              </Link>
            ))}
          </div>
        )}
      </section>
      </HeroBackground>

      {/* 트렌딩 */}
      {data.featured.length > 0 && (
        <section className="border-y border-line bg-surface/70">
          <div className="mx-auto max-w-[1180px] px-4 py-16 sm:px-6 lg:px-8">
            <FeedHeader emoji="" title="트렌딩" href="/projects" />
            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {data.featured.map((p) => <ClassicCard key={p.id} project={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* 신규 공개 */}
      {data.launches.length > 0 && (
        <section className="mx-auto max-w-[1180px] px-4 py-16 sm:px-6 lg:px-8">
          <FeedHeader emoji="" title="신규 공개" href="/projects?sort=latest" />
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {data.launches.map((p) => <ClassicCard key={p.id} project={p} />)}
          </div>
        </section>
      )}

      {/* 열띤 피드백 */}
      {data.feedback.length > 0 && (
        <section className="border-y border-line bg-surface/70">
          <div className="mx-auto max-w-[1180px] px-4 py-16 sm:px-6 lg:px-8">
            <FeedHeader emoji="" title="열띤 피드백" subtitle="지금 피드백이 활발한 프로젝트" href="/projects?activity=feedback" linkLabel="더 보기" />
            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {data.feedback.map((p) => <ClassicCard key={p.id} project={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* FAQ — GEO 최적화 */}
      <GeoFaqSection data={data} />

      <CTASection />
    </div>
  );
}

function FeedHeader({ emoji, title, subtitle, href, linkLabel = "전체 보기" }: { emoji: string; title: string; subtitle?: string; href: string; linkLabel?: string }) {
  return (
    <div className="flex items-end justify-between">
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          <span className="mr-2">{emoji}</span>{title}
        </h2>
        {subtitle && <p className="mt-1 text-sm text-foreground-muted">{subtitle}</p>}
      </div>
      <Link href={href} className="hidden items-center gap-1.5 text-sm font-semibold text-accent hover:underline sm:inline-flex">
        {linkLabel} <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

function ClassicCard({ project }: { project: SerializedProjectCard }) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-[28px] border border-line bg-surface shadow-soft">
      <div className="aspect-[16/10] overflow-hidden bg-surface-muted">
        <img src={project.coverImageUrl} alt={project.title} className="h-full w-full object-cover" />
      </div>
      <div className="flex flex-1 flex-col gap-4 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground-muted">
          {getCategoryLabel(project.category)} · {getPlatformLabel(project.platform)}
        </p>
        <div>
          <h3 className="text-xl font-extrabold tracking-tight text-foreground">{project.title}</h3>
          <p className="mt-1 line-clamp-2 text-sm leading-6 text-foreground-muted">{project.tagline}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-line bg-surface-muted px-3 py-1 text-xs font-semibold text-foreground-muted">
            {getStageLabel(project.stage)}
          </span>
          {project.badges.slice(0, 2).map((b) => (
            <span key={b} className="rounded-full border border-line bg-surface-muted px-3 py-1 text-xs font-semibold text-foreground-muted">{b}</span>
          ))}
        </div>
        <div className="mt-auto flex flex-wrap items-center gap-3 text-sm text-foreground-muted">
          <span>{project.makerAlias}</span>
          <span>{formatRelativeFromString(project.latestActivityAt)}</span>
          <span className="inline-flex items-center gap-1"><MessageSquareText className="size-3.5" />{project.metrics.comments}</span>
          <span className="inline-flex items-center gap-1"><BookMarked className="size-3.5" />{project.metrics.saves}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <TryButton project={project} source="home_try" />
          <DetailLink slug={project.slug} />
        </div>
      </div>
    </article>
  );
}
