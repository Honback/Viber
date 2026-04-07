import type { Metadata } from "next";

import { FlashBanner } from "@/components/ui/flash-banner";
import { SectionHeading } from "@/components/ui/section-heading";
import { ExploreVariantSwitcher } from "@/components/explore/explore-variant-switcher";
import { getCurrentProfile } from "@/lib/auth/session";
import { getExploreData, getViewerState } from "@/lib/services/read-models";

export const metadata: Metadata = {
  title: "프로젝트 탐색",
  description: "바이브 코딩 프로젝트를 카테고리, 플랫폼, 태그별로 탐색하세요. 트렌딩, 최신, 피드백 활발한 AI 프로젝트를 한눈에 확인할 수 있습니다.",
  keywords: ["바이브 코딩 프로젝트", "AI 프로젝트 탐색", "vibe coding projects", "AI 앱 갤러리", "트렌딩 프로젝트"],
  openGraph: {
    title: "프로젝트 탐색 | Vibeollio",
    description: "바이브 코딩으로 만든 다양한 프로젝트를 탐색하고 체험하세요.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "프로젝트 탐색 | Vibeollio",
    description: "바이브 코딩으로 만든 다양한 프로젝트를 탐색하고 체험하세요.",
  },
  alternates: {
    canonical: "/projects",
  },
};

type ProjectsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getValues(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function getBoolean(value: string | string[] | undefined) {
  const v = getValue(value);
  return v === "true" || v === "on" || v === "1";
}

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const params = await searchParams;
  const viewer = await getCurrentProfile();
  const viewerState = await getViewerState(viewer?.id);

  const categories = getValues(params.categories);
  const filters = {
    query: getValue(params.query),
    categories,
    platform: getValue(params.platform),
    stage: getValue(params.stage),
    pricing: getValue(params.pricing),
    activity: getValue(params.activity),
    openSource: getBoolean(params.openSource),
    noSignup: getBoolean(params.noSignup),
    soloMaker: getBoolean(params.soloMaker),
    sort: (getValue(params.sort) as "trending" | "latest" | "updated" | "comments" | undefined) ?? "trending",
    page: Number(getValue(params.page) ?? "1"),
  };

  const data = await getExploreData(filters);

  return (
    <div>
      <FlashBanner notice={getValue(params.notice)} error={getValue(params.error)} />

      <div className="mx-auto max-w-[1180px] px-4 pt-8 sm:px-6">
        <SectionHeading
          eyebrow="탐색"
          title="프로젝트 탐색"
          description="모든 프로젝트를 한눈에 탐색하세요."
        />
      </div>

      <ExploreVariantSwitcher
        data={data}
        filters={filters}
        viewer={viewer}
        savedProjectIds={viewerState.savedProjectIds}
        params={params}
      />
    </div>
  );
}
