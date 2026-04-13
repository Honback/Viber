"use client";

import { useCallback, createContext, useContext, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";

import type { LandingVariantProps } from "./types";
import { VariantFeature } from "./variant-feature";
import { FeatureProducts } from "./variant-feature/products";
import { FeatureTrending } from "./variant-feature/trending";
import { FeatureNew } from "./variant-feature/new";
import { FeatureFeedback } from "./variant-feature/feedback";

/* ── types ── */
type SubPage = "home" | "products" | "trending" | "new" | "feedback";

/* ── context ── */
type VariantNavContextType = {
  subPage: SubPage;
  navigate: (page: SubPage) => void;
};

export const VariantNavContext = createContext<VariantNavContextType>({
  subPage: "home",
  navigate: () => {},
});

export function useVariantNav() {
  return useContext(VariantNavContext);
}

/* ── helpers ── */
function buildSubPageHref(page: SubPage): string {
  if (page === "home") return "/";
  return `/feature/${page}`;
}

/* ── main component ── */
type SwitcherProps = LandingVariantProps & {
  activeVariant: string;
  activeSubPage: string;
};

export function LandingVariantSwitcher({ activeSubPage, ...props }: SwitcherProps) {
  const router = useRouter();

  const subPage: SubPage =
    activeSubPage && ["home", "products", "trending", "new", "feedback"].includes(activeSubPage)
      ? (activeSubPage as SubPage)
      : "home";

  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);

  const handleNavigate = useCallback(
    (page: SubPage) => {
      router.push(buildSubPageHref(page), { scroll: false });
    },
    [router],
  );

  function renderContent() {
    switch (subPage) {
      case "products": return <FeatureProducts />;
      case "trending": return <FeatureTrending />;
      case "new":      return <FeatureNew />;
      case "feedback": return <FeatureFeedback />;
      default:         return <VariantFeature {...props} />;
    }
  }

  return (
    <VariantNavContext.Provider value={{ subPage, navigate: handleNavigate }}>
      <div>
        {mounted ? renderContent() : null}
      </div>
    </VariantNavContext.Provider>
  );
}
