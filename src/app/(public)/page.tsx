import { Suspense } from "react";
import { FlashBanner } from "@/components/ui/flash-banner";
import { LandingVariantSwitcher } from "@/components/landing/landing-variant-switcher";
import type { SerializedHomepageData } from "@/components/landing/types";
import { getCurrentProfile } from "@/lib/auth/session";
import { getHomepageData, getViewerState } from "@/lib/services/read-models";
import type { ProjectCardModel } from "@/lib/services/read-models";

type HomePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getTextParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function serializeCards(cards: ProjectCardModel[]) {
  return cards.map((c) => ({
    ...c,
    latestActivityAt: c.latestActivityAt.toISOString(),
    publishedAt: c.publishedAt?.toISOString() ?? null,
  }));
}

function serializeHomepageData(data: Awaited<ReturnType<typeof getHomepageData>>): SerializedHomepageData {
  return {
    featured: serializeCards(data.featured),
    launches: serializeCards(data.launches),
    feedback: serializeCards(data.feedback),
    updates: serializeCards(data.updates),
    tags: data.tags,
  };
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const viewer = await getCurrentProfile();
  const viewerState = await getViewerState(viewer?.id);
  const data = await getHomepageData();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://127.0.0.1:3000";
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Vibeollio",
    url: appUrl,
    description: "바이브 코딩으로 만든 프로젝트를 발견하고, 체험하고, 피드백하는 커뮤니티",
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${appUrl}/projects?query={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Vibeollio",
    url: appUrl,
    description: "바이브 코딩 프로젝트 쇼케이스 커뮤니티",
  };

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
      <FlashBanner notice={getTextParam(params.notice)} error={getTextParam(params.error)} />
      <Suspense>
        <LandingVariantSwitcher
          data={serializeHomepageData(data)}
          viewer={viewer}
          savedProjectIds={viewerState.savedProjectIds}
          activeVariant="feature"
          activeSubPage="home"
        />
      </Suspense>
    </div>
  );
}
