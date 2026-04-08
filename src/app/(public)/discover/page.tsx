import type { Metadata } from "next";
import Link from "next/link";
import { Compass, ArrowUpRight, BookMarked, MessageSquareText } from "lucide-react";

import { getLocale } from "@/lib/i18n/get-locale";
import { t } from "@/lib/i18n/translations";
import { getDiscoverData } from "@/lib/services/read-models";
import { getCurrentProfile } from "@/lib/auth/session";
import { categoryLabels, platformLabels, stageLabels } from "@/lib/constants";
import { StatusBadge } from "@/components/ui/status-badge";
import { OutboundLink } from "@/components/analytics/outbound-link";
import { DiscoverList } from "./discover-list";

export const metadata: Metadata = {
  title: "디스커버",
  description: "바이브 코딩으로 만든 프로젝트 중 가장 주목받는 프로젝트를 소개합니다.",
  openGraph: {
    title: "디스커버 | Vibeollio",
    description: "바이브 코딩으로 만든 프로젝트 중 가장 주목받는 프로젝트를 소개합니다.",
    type: "website",
  },
  alternates: {
    canonical: "/discover",
  },
};

export default async function DiscoverPage() {
  const locale = await getLocale();
  const translations = t(locale);
  const projects = await getDiscoverData();
  const viewer = await getCurrentProfile();

  return (
    <>
      {/* Hero */}
      <section className="bg-[#0A0A0A] px-4 pb-10 pt-12 text-center sm:pb-14 sm:pt-16">
        <div className="mx-auto max-w-3xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-800 px-4 py-1.5 text-xs font-semibold text-[#d76542]">
            <Compass className="h-3.5 w-3.5" /> {translations.discover.badge}
          </span>
          <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            <span className="text-[#d76542]">{translations.discover.heading}</span>{" "}
            {translations.discover.title}
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-neutral-400 sm:text-base">
            {translations.discover.description}
          </p>
        </div>
      </section>

      {/* Project List */}
      <section className="mx-auto w-full max-w-3xl px-4 pb-16 pt-4">
        <DiscoverList>
          {projects.map((project, idx) => {
            const rank = idx + 1;
            const rankStyle = getRankStyle(rank);

            return (
              <Link
                key={project.id}
                href={`/p/${project.slug}`}
                className="group flex items-center gap-5 rounded-2xl border border-neutral-800 bg-neutral-900/50 p-5 transition hover:-translate-y-0.5 hover:border-neutral-600"
              >
                {/* Rank */}
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border text-lg font-extrabold ${rankStyle.bg} ${rankStyle.border} ${rankStyle.text}`}
                >
                  {rank}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="truncate text-base font-bold text-white group-hover:text-[#d76542]">
                      {project.title}
                    </h2>
                    <span className="hidden text-[10px] font-semibold uppercase tracking-wider text-neutral-500 sm:inline">
                      {categoryLabels[project.category] ?? project.category}
                    </span>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-neutral-600 transition group-hover:text-neutral-400" />
                  </div>
                  <p className="mt-0.5 truncate text-sm text-neutral-400">
                    {project.tagline}
                  </p>
                </div>

                {/* Metrics */}
                <div className="hidden shrink-0 items-center gap-4 sm:flex">
                  <div className="flex flex-col items-center gap-0.5">
                    <MessageSquareText className="h-4 w-4 text-neutral-500" />
                    <span className="text-xs font-semibold text-neutral-400">
                      {project.metrics.comments}
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5">
                    <BookMarked className="h-4 w-4 text-neutral-500" />
                    <span className="text-xs font-semibold text-neutral-400">
                      {project.metrics.saves}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </DiscoverList>

        <p className="mt-8 text-center text-xs text-neutral-500">
          <Link href="/projects" className="underline transition hover:text-neutral-300">
            {locale === "ko" ? "전체 프로젝트 탐색하기" : "Explore all projects"}
          </Link>
        </p>
      </section>
    </>
  );
}

function getRankStyle(rank: number) {
  if (rank === 1) return { bg: "bg-yellow-500/10", border: "border-yellow-500/30", text: "text-yellow-500" };
  if (rank === 2) return { bg: "bg-neutral-300/10", border: "border-neutral-400/30", text: "text-neutral-300" };
  if (rank === 3) return { bg: "bg-orange-400/10", border: "border-orange-400/30", text: "text-orange-400" };
  return { bg: "bg-neutral-800", border: "border-neutral-800", text: "text-neutral-400" };
}
