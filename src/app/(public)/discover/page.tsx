"use client";

import { useState, useEffect, useRef } from "react";
import { Compass, ArrowUpRight, ThumbsUp } from "lucide-react";
import { useLocale } from "@/lib/i18n/locale-context";

const ACCENT = "#d76542";

type Product = {
  rank: number;
  name: string;
  tagline: string;
  upvotes: number;
  phUrl: string;
};

const PRODUCTS: Product[] = [
  { rank: 1, name: "Ogoron", tagline: "Your best QA team — 9x faster, 20x cheaper", upvotes: 11, phUrl: "https://www.producthunt.com/products/ogoron" },
  { rank: 2, name: "AppSignal", tagline: "Real-time monitoring that helps you ship with confidence", upvotes: 11, phUrl: "https://www.producthunt.com/products/appsignal" },
  { rank: 3, name: "Metoro", tagline: "AI SRE that detects, root causes & auto-fixes K8s incidents", upvotes: 4, phUrl: "https://www.producthunt.com/products/metoro" },
  { rank: 4, name: "Epismo Context Pack", tagline: "Portable memory for agent workflows", upvotes: 3, phUrl: "https://www.producthunt.com/products/epismo" },
  { rank: 5, name: "Adapted", tagline: "AI Physical Therapy for Athletes", upvotes: 3, phUrl: "https://www.producthunt.com/products/adapted-health" },
  { rank: 6, name: "Moonshot", tagline: "Track the Artemis II mission from your Mac", upvotes: 3, phUrl: "https://www.producthunt.com/products/moonshot-13" },
  { rank: 7, name: "DebtMeltPro", tagline: "Compare debt payoff strategies and become debt-free faster", upvotes: 3, phUrl: "https://www.producthunt.com/products/debtmeltpro" },
  { rank: 8, name: "KREV", tagline: "AI creative agents for ecommerce brands", upvotes: 3, phUrl: "https://www.producthunt.com/products/krev" },
  { rank: 9, name: "Deploy Hermes", tagline: "Private Telegram AI agents, live in under a minute", upvotes: 2, phUrl: "https://www.producthunt.com/products/deployhermes" },
  { rank: 10, name: "PixVerse V6", tagline: "The AI video model that actually feels alive", upvotes: 2, phUrl: "https://www.producthunt.com/products/pixverse" },
];

function useEntranceAnimation(delay = 0) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return { ref, isVisible };
}

function getRankStyle(rank: number) {
  if (rank === 1) return { bg: "bg-yellow-500/10", border: "border-yellow-500/30", text: "text-yellow-500" };
  if (rank === 2) return { bg: "bg-neutral-300/10", border: "border-neutral-400/30", text: "text-neutral-300" };
  if (rank === 3) return { bg: "bg-orange-400/10", border: "border-orange-400/30", text: "text-orange-400" };
  return { bg: "bg-neutral-800", border: "border-neutral-800", text: "text-neutral-400" };
}

export default function DiscoverPage() {
  const { t } = useLocale();
  const heroAnim = useEntranceAnimation(50);
  const listAnim = useEntranceAnimation(200);

  return (
    <>
      {/* Hero */}
      <section className="bg-[#0A0A0A] px-4 pb-10 pt-12 text-center sm:pb-14 sm:pt-16">
        <div
          ref={heroAnim.ref}
          className="mx-auto max-w-3xl"
          style={{
            opacity: heroAnim.isVisible ? 1 : 0,
            transform: heroAnim.isVisible ? "translateY(0)" : "translateY(24px)",
            transition: "opacity 0.7s ease, transform 0.7s ease",
          }}
        >
          <span
            className="inline-flex items-center gap-1.5 rounded-full bg-neutral-800 px-4 py-1.5 text-xs font-semibold"
            style={{ color: ACCENT }}
          >
            <Compass className="h-3.5 w-3.5" /> {t.discover.badge}
          </span>
          <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            <span style={{ color: ACCENT }}>Discover</span> {t.discover.title}
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-neutral-400 sm:text-base">
            {t.discover.description}
          </p>
        </div>
      </section>

      {/* List */}
      <section className="mx-auto w-full max-w-3xl px-4 pb-16 pt-4">
        <div
          ref={listAnim.ref}
          className="flex flex-col gap-4"
          style={{
            opacity: listAnim.isVisible ? 1 : 0,
            transform: listAnim.isVisible ? "translateY(0)" : "translateY(24px)",
            transition: "opacity 0.7s ease 0.1s, transform 0.7s ease 0.1s",
          }}
        >
          {PRODUCTS.map((product, idx) => {
            const style = getRankStyle(product.rank);
            return (
              <a
                key={product.rank}
                href={product.phUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-5 rounded-2xl border border-neutral-800 bg-neutral-900/50 p-5 transition hover:-translate-y-0.5 hover:border-neutral-600"
                style={{
                  opacity: listAnim.isVisible ? 1 : 0,
                  transform: listAnim.isVisible ? "translateY(0)" : "translateY(16px)",
                  transition: `opacity 0.5s ease ${0.05 * idx}s, transform 0.5s ease ${0.05 * idx}s`,
                }}
              >
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border text-lg font-extrabold ${style.bg} ${style.border} ${style.text}`}
                >
                  {product.rank}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="truncate text-base font-bold text-white group-hover:text-[#d76542]">
                      {product.name}
                    </h2>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-neutral-600 transition group-hover:text-neutral-400" />
                  </div>
                  <p className="mt-0.5 truncate text-sm text-neutral-400">
                    {product.tagline}
                  </p>
                </div>
                <div className="hidden shrink-0 flex-col items-center gap-0.5 sm:flex">
                  <ThumbsUp className="h-4 w-4 text-neutral-500" />
                  <span className="text-xs font-semibold text-neutral-400">
                    {product.upvotes.toLocaleString()}
                  </span>
                </div>
              </a>
            );
          })}
        </div>

        <p className="mt-8 text-center text-xs text-neutral-500">
          Source:{" "}
          <a
            href="https://www.producthunt.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline transition hover:text-neutral-300"
          >
            Product Hunt
          </a>
          {" "}&middot; Updated Apr 7, 2026
        </p>
      </section>
    </>
  );
}
