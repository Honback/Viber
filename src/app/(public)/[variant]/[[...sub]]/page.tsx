import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { FlashBanner } from "@/components/ui/flash-banner";
import { LandingVariantSwitcher } from "@/components/landing/landing-variant-switcher";
import type { SerializedHomepageData } from "@/components/landing/types";
import { getCurrentProfile } from "@/lib/auth/session";
import { getHomepageData, getViewerState } from "@/lib/services/read-models";
import type { ProjectCardModel } from "@/lib/services/read-models";

type VariantPageProps = {
  params: Promise<{ variant: string; sub?: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: VariantPageProps): Promise<Metadata> {
  const { sub } = await params;
  const isHome = !sub || sub.length === 0;

  if (isHome) {
    return {
      alternates: { canonical: "/" },
    };
  }

  return {
    alternates: { canonical: "/" },
    robots: { index: false, follow: true },
  };
}

const VALID_VARIANTS = ["feature", "minimal"] as const;
type ValidVariant = (typeof VALID_VARIANTS)[number];

const VALID_SUB_PAGES = ["products", "trending", "new", "feedback"] as const;

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

function getTextParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function VariantPage({ params, searchParams }: VariantPageProps) {
  const { variant, sub } = await params;
  const sp = await searchParams;

  if (!VALID_VARIANTS.includes(variant as ValidVariant)) {
    notFound();
  }

  const subPage = sub?.[0];
  if (subPage && !VALID_SUB_PAGES.includes(subPage as (typeof VALID_SUB_PAGES)[number])) {
    notFound();
  }

  const isHome = !subPage;
  const viewer = await getCurrentProfile();
  const viewerState = await getViewerState(viewer?.id);
  const data = await getHomepageData();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://127.0.0.1:3000";

  return (
    <div>
      {isHome && (
        <>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
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
              }),
            }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Organization",
                name: "Vibeollio",
                url: appUrl,
                description: "바이브 코딩 프로젝트 쇼케이스 커뮤니티",
              }),
            }}
          />
        </>
      )}
      <FlashBanner notice={getTextParam(sp.notice)} error={getTextParam(sp.error)} />
      <Suspense>
        <LandingVariantSwitcher
          data={serializeHomepageData(data)}
          viewer={viewer}
          savedProjectIds={viewerState.savedProjectIds}
          activeVariant={variant as ValidVariant}
          activeSubPage={subPage ?? "home"}
        />
      </Suspense>
    </div>
  );
}
