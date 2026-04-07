import type { Metadata } from "next";
import { Compass, ArrowUpRight, ThumbsUp } from "lucide-react";

export const metadata: Metadata = {
  title: "Discover",
  description:
    "Product Hunt에서 오늘 가장 주목받는 프로덕트 10개를 확인하세요.",
  openGraph: {
    title: "Discover | Vibeollio",
    description: "Product Hunt Today's Top 10",
    type: "website",
  },
  alternates: { canonical: "/discover" },
};

const ACCENT = "#d76542";

type Product = {
  rank: number;
  name: string;
  tagline: string;
  upvotes: number;
  phUrl: string;
};

const PRODUCTS: Product[] = [
  {
    rank: 1,
    name: "Ogoron",
    tagline: "Your best QA team — 9x faster, 20x cheaper",
    upvotes: 11,
    phUrl: "https://www.producthunt.com/products/ogoron",
  },
  {
    rank: 2,
    name: "AppSignal",
    tagline: "Real-time monitoring that helps you ship with confidence",
    upvotes: 11,
    phUrl: "https://www.producthunt.com/products/appsignal",
  },
  {
    rank: 3,
    name: "Metoro",
    tagline: "AI SRE that detects, root causes & auto-fixes K8s incidents",
    upvotes: 4,
    phUrl: "https://www.producthunt.com/products/metoro",
  },
  {
    rank: 4,
    name: "Epismo Context Pack",
    tagline: "Portable memory for agent workflows",
    upvotes: 3,
    phUrl: "https://www.producthunt.com/products/epismo",
  },
  {
    rank: 5,
    name: "Adapted",
    tagline: "AI Physical Therapy for Athletes",
    upvotes: 3,
    phUrl: "https://www.producthunt.com/products/adapted-health",
  },
  {
    rank: 6,
    name: "Moonshot",
    tagline: "Track the Artemis II mission from your Mac",
    upvotes: 3,
    phUrl: "https://www.producthunt.com/products/moonshot-13",
  },
  {
    rank: 7,
    name: "DebtMeltPro",
    tagline: "Compare debt payoff strategies and become debt-free faster",
    upvotes: 3,
    phUrl: "https://www.producthunt.com/products/debtmeltpro",
  },
  {
    rank: 8,
    name: "KREV",
    tagline: "AI creative agents for ecommerce brands",
    upvotes: 3,
    phUrl: "https://www.producthunt.com/products/krev",
  },
  {
    rank: 9,
    name: "Deploy Hermes",
    tagline: "Private Telegram AI agents, live in under a minute",
    upvotes: 2,
    phUrl: "https://www.producthunt.com/products/deployhermes",
  },
  {
    rank: 10,
    name: "PixVerse V6",
    tagline: "The AI video model that actually feels alive",
    upvotes: 2,
    phUrl: "https://www.producthunt.com/products/pixverse",
  },
];

function getRankStyle(rank: number) {
  if (rank === 1) return { bg: "bg-yellow-500/10", border: "border-yellow-500/30", text: "text-yellow-500" };
  if (rank === 2) return { bg: "bg-neutral-300/10", border: "border-neutral-400/30", text: "text-neutral-300" };
  if (rank === 3) return { bg: "bg-orange-400/10", border: "border-orange-400/30", text: "text-orange-400" };
  return { bg: "bg-neutral-800", border: "border-neutral-800", text: "text-neutral-400" };
}

export default function DiscoverPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-[#0A0A0A] px-4 pb-10 pt-12 text-center sm:pb-14 sm:pt-16">
        <div className="mx-auto max-w-3xl">
          <span
            className="inline-flex items-center gap-1.5 rounded-full bg-neutral-800 px-4 py-1.5 text-xs font-semibold"
            style={{ color: ACCENT }}
          >
            <Compass className="h-3.5 w-3.5" /> Product Hunt
          </span>
          <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            <span style={{ color: ACCENT }}>Discover</span> Today&apos;s Best
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-neutral-400 sm:text-base">
            Product Hunt에서 오늘 가장 주목받는 프로덕트를 소개합니다.
          </p>
        </div>
      </section>

      {/* List */}
      <section className="mx-auto w-full max-w-3xl px-4 pb-16 pt-4">
        <div className="flex flex-col gap-4">
          {PRODUCTS.map((product) => {
            const style = getRankStyle(product.rank);
            return (
              <a
                key={product.rank}
                href={product.phUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-5 rounded-2xl border border-neutral-800 bg-neutral-900/50 p-5 transition hover:-translate-y-0.5 hover:border-neutral-600"
              >
                {/* Rank */}
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border text-lg font-extrabold ${style.bg} ${style.border} ${style.text}`}
                >
                  {product.rank}
                </div>

                {/* Info */}
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

                {/* Upvotes */}
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
