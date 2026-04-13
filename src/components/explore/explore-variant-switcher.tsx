"use client";

import { useState } from "react";

import type { ExploreVariantProps } from "./types";
import { VariantList } from "./variant-list";
import { VariantGrid } from "./variant-grid";
import { VariantMagazine } from "./variant-magazine";
import { VariantCompact } from "./variant-compact";
import { VariantTable } from "./variant-table";

const VARIANTS = [
  { key: "list", label: "리스트", Component: VariantList },
  { key: "grid", label: "그리드", Component: VariantGrid },
  { key: "magazine", label: "매거진", Component: VariantMagazine },
  { key: "compact", label: "핀보드", Component: VariantCompact },
  { key: "table", label: "테이블", Component: VariantTable },
] as const;

const STORAGE_KEY = "explore-variant";

export function ExploreVariantSwitcher(props: ExploreVariantProps) {
  const [active, setActive] = useState(() => {
    if (typeof window === "undefined") return 0;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const idx = parseInt(stored, 10);
      if (idx >= 0 && idx < VARIANTS.length) return idx;
    }
    return 0;
  });
  const [mounted] = useState(() => typeof window !== "undefined");

  const handleSelect = (idx: number) => {
    setActive(idx);
    localStorage.setItem(STORAGE_KEY, String(idx));
  };

  const { Component } = VARIANTS[active];

  return (
    <>
      {/* 토글 바 */}
      <div className="sticky top-14 z-40 border-b border-line bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1180px] items-center gap-3 overflow-x-auto px-4 py-2.5 sm:px-6">
          <span className="hidden shrink-0 text-xs font-medium text-foreground-muted lg:block">
            UI 테스트
          </span>
          <div className="flex items-center gap-1.5">
            {VARIANTS.map((v, idx) => (
              <button
                key={v.key}
                onClick={() => handleSelect(idx)}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
                  active === idx
                    ? "bg-foreground text-background"
                    : "border border-line text-foreground-muted hover:bg-surface-muted"
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 선택된 변형 렌더링 */}
      <div className="mx-auto w-full max-w-[1180px] px-4 py-8 sm:px-6 md:py-10">
        {mounted ? <Component {...props} /> : <Component {...props} />}
      </div>
    </>
  );
}
