import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { FlashBanner } from "@/components/ui/flash-banner";
import { LandingVariantSwitcher } from "@/components/landing/landing-variant-switcher";
import type { SerializedHomepageData } from "@/components/landing/types";
import { getCurrentProfile } from "@/lib/auth/session";
import { getHomepageData, getViewerState } from "@/lib/services/read-models";
import type { ProjectCardModel } from "@/lib/services/read-models";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
  robots: {
    index: false,
    follow: true,
  },
};

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

type VariantPageProps = {
  params: Promise<{ variant: string; sub?: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

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

  const viewer = await getCurrentProfile();
  const viewerState = await getViewerState(viewer?.id);
  const data = await getHomepageData();

  return (
    <div>
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
