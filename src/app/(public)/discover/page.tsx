import type { Metadata } from "next";
import { Compass, ExternalLink, Triangle } from "lucide-react";

export const metadata: Metadata = {
  title: "Best Vibe Coding Tools in 2026 | Vibeollio",
  description: "2026년 최고의 바이브 코딩 도구를 소개합니다. Cursor, Lovable, v0, Windsurf 등 AI 기반 코딩 도구를 만나보세요.",
  openGraph: {
    title: "Best Vibe Coding Tools in 2026 | Vibeollio",
    description: "2026년 최고의 바이브 코딩 도구를 소개합니다.",
    type: "website",
  },
  alternates: { canonical: "/discover" },
};

const VIBE_CODING_TOOLS = [
  { rank: 1, name: "Cursor", tagline: "The AI Code Editor", category: "AI Code Editor", url: "https://cursor.com", upvotes: 789, logo: "https://ph-files.imgix.net/d2edfb12-0064-4ea2-af46-12b43bbb2842.png?auto=compress&codec=mozjpeg&cs=strip&auto=format&w=84&h=84&fit=crop&frame=1" },
  { rank: 2, name: "Lovable", tagline: "The world's first AI Fullstack Engineer", category: "AI Coding Agent", url: "https://lovable.dev", upvotes: 173, logo: "https://ph-files.imgix.net/9e98593b-4dc9-4d9e-afb9-0b339e3243c8.jpeg?auto=compress&codec=mozjpeg&cs=strip&auto=format&w=84&h=84&fit=crop&frame=1" },
  { rank: 3, name: "v0 by Vercel", tagline: "Full stack vibe coding platform. Created by Vercel.", category: "Full Stack Platform", url: "https://v0.dev", upvotes: 153, logo: "https://ph-files.imgix.net/7225c497-8c9e-4e00-a832-0485c4eb50b4.png?auto=compress&codec=mozjpeg&cs=strip&auto=format&w=84&h=84&fit=crop&frame=1" },
  { rank: 4, name: "Windsurf", tagline: "The first agentic IDE. Tomorrow's editor, today.", category: "AI IDE", url: "https://windsurf.com", upvotes: 62, logo: "https://ph-files.imgix.net/eeb9b2eb-49ed-4be5-8db0-4bd1a01d39e4.png?auto=compress&codec=mozjpeg&cs=strip&auto=format&w=84&h=84&fit=crop&frame=1" },
  { rank: 5, name: "Softr", tagline: "Build custom business apps powered by AI and no-code.", category: "No-code Platform", url: "https://softr.io", upvotes: 66, logo: "https://ph-files.imgix.net/c8767056-0459-4726-8148-571d1262e127.png?auto=compress&codec=mozjpeg&cs=strip&auto=format&w=84&h=84&fit=crop&frame=1" },
  { rank: 6, name: "Dreamflow", tagline: "The Fastest Way to Build Mobile Apps, powered by Flutter", category: "Mobile Builder", url: "https://dreamflow.dev", upvotes: 45, logo: "https://ph-files.imgix.net/3bfb8cd3-ca70-4c80-9c72-3e2c05c74a99.png?auto=compress&codec=mozjpeg&cs=strip&auto=format&w=84&h=84&fit=crop&frame=1" },
  { rank: 7, name: "Replit", tagline: "Idea to app, fast.", category: "AI Coding Agent", url: "https://replit.com", upvotes: 44, logo: "https://ph-files.imgix.net/5f621a68-2838-4ad2-97a5-fd3fc6dad117.jpeg?auto=compress&codec=mozjpeg&cs=strip&auto=format&w=84&h=84&fit=crop&frame=1" },
  { rank: 8, name: "bolt.new", tagline: "Prompt, run, edit, and deploy full-stack web apps", category: "AI Coding Agent", url: "https://bolt.new", upvotes: 42, logo: "https://ph-files.imgix.net/8ab7b055-745d-4580-b924-20a6cfaaa7f7.svg?auto=compress&codec=mozjpeg&cs=strip&auto=format&w=84&h=84&fit=crop&frame=1" },
  { rank: 9, name: "Base44", tagline: "Build fully-functional apps in minutes. No coding necessary.", category: "AI Coding Agent", url: "https://base44.com", upvotes: 34, logo: "https://ph-files.imgix.net/08d3bb67-614f-4562-a46e-b84de507789a.png?auto=compress&codec=mozjpeg&cs=strip&auto=format&w=84&h=84&fit=crop&frame=1" },
  { rank: 10, name: "Floot", tagline: "Build serious apps with AI without getting stuck", category: "AI Coding Agent", url: "https://floot.ai", upvotes: 19, logo: "https://ph-files.imgix.net/b66f0961-7df0-4d63-82a4-b29d8084afdb.png?auto=compress&codec=mozjpeg&cs=strip&auto=format&w=84&h=84&fit=crop&frame=1" },
  { rank: 11, name: "Solid", tagline: "AI that builds real web apps", category: "Website Builder", url: "https://solid.new", upvotes: 9, logo: "https://ph-files.imgix.net/dd777399-28fa-406d-a4c6-8cf948ea3808.png?auto=compress&codec=mozjpeg&cs=strip&auto=format&w=84&h=84&fit=crop&frame=1" },
  { rank: 12, name: "Zencoder", tagline: "The AI coding agent", category: "AI Coding Agent", url: "https://zencoder.ai", upvotes: 8, logo: "https://ph-files.imgix.net/10d8e84f-d1b7-43d9-86ba-2337b29f10fb.png?auto=compress&codec=mozjpeg&cs=strip&auto=format&w=84&h=84&fit=crop&frame=1" },
];

function getRankStyle(rank: number) {
  if (rank === 1) return "border-yellow-500/40 bg-yellow-500/10 text-yellow-500";
  if (rank === 2) return "border-neutral-400/40 bg-neutral-300/10 text-neutral-300";
  if (rank === 3) return "border-orange-400/40 bg-orange-400/10 text-orange-400";
  return "border-neutral-800 bg-neutral-800 text-neutral-400";
}

export default function DiscoverPage() {

  return (
    <>
      {/* Hero */}
      <section className="bg-[#0A0A0A] px-4 pb-10 pt-12 text-center sm:pb-14 sm:pt-16">
        <div className="mx-auto max-w-3xl animate-[fadeSlideUp_0.7s_ease_both]">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-800 px-4 py-1.5 text-xs font-semibold text-[#d76542] animate-[fadeSlideUp_0.5s_ease_both]">
            <Compass className="h-3.5 w-3.5" /> Discover
          </span>
          <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl animate-[fadeSlideUp_0.7s_ease_0.1s_both]">
            Best <span className="text-[#d76542]">Vibe Coding</span> Tools in 2026
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-neutral-400 sm:text-base animate-[fadeSlideUp_0.7s_ease_0.2s_both]">
            AI 기반 코딩 도구의 최전선. Cursor, Lovable, v0 등 가장 주목받는 바이브 코딩 도구를 만나보세요.
          </p>
        </div>
      </section>

      {/* External Tools List */}
      <section className="mx-auto w-full max-w-3xl px-4 pb-8 pt-4 animate-[fadeSlideUp_0.7s_ease_0.3s_both]">
        <h2 className="mb-6 text-lg font-bold text-white">
          Top Vibe Coding Tools
          <span className="ml-2 text-sm font-normal text-neutral-500">by Product Hunt</span>
        </h2>
        <div className="space-y-3">
          {VIBE_CODING_TOOLS.map((tool, i) => (
            <a
              key={tool.name}
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 rounded-xl border border-neutral-800 bg-neutral-900/50 px-5 py-4 transition hover:-translate-y-0.5 hover:border-neutral-600"
              style={{ animation: `fadeSlideUp 0.5s ease ${0.35 + i * 0.05}s both` }}
            >
              {/* Rank */}
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-xs font-extrabold ${getRankStyle(tool.rank)}`}>
                {tool.rank}
              </div>

              {/* Logo */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={tool.logo}
                alt={`${tool.name} logo`}
                className="h-10 w-10 shrink-0 rounded-xl bg-neutral-800 object-cover"
              />

              {/* Info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white group-hover:text-[#d76542] transition">
                    {tool.name}
                  </h3>
                  <span className="hidden rounded bg-neutral-800 px-1.5 py-0.5 text-[10px] font-semibold text-neutral-500 sm:inline">
                    {tool.category}
                  </span>
                  <ExternalLink className="h-3 w-3 shrink-0 text-neutral-600 transition group-hover:text-neutral-400" />
                </div>
                <p className="mt-0.5 truncate text-xs text-neutral-400">
                  {tool.tagline}
                </p>
              </div>

              {/* Upvotes */}
              <div className="flex shrink-0 items-center gap-1 text-sm text-neutral-500">
                <Triangle className="h-3 w-3 fill-neutral-500" />
                <span className="font-semibold">{tool.upvotes}</span>
              </div>
            </a>
          ))}
        </div>
      </section>

      <div className="pb-16" />
    </>
  );
}
