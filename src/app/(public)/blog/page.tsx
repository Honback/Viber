import type { Metadata } from "next";
import Link from "next/link";
import { FileText } from "lucide-react";

import { PageShell } from "@/components/ui/page-shell";
import { getAllPosts } from "@/lib/blog/posts";

export const metadata: Metadata = {
  title: "블로그",
  description:
    "바이브 코딩, AI 코딩 도구, 프로젝트 개발 팁에 대한 최신 글을 읽어보세요. Vibeollio 커뮤니티의 인사이트와 가이드를 제공합니다.",
  keywords: ["바이브 코딩 블로그", "AI 코딩 가이드", "vibe coding blog", "프로젝트 개발 팁"],
  openGraph: {
    title: "블로그 | Vibeollio",
    description: "바이브 코딩과 AI 프로젝트에 대한 인사이트와 가이드",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "블로그 | Vibeollio",
    description: "바이브 코딩과 AI 프로젝트에 대한 인사이트와 가이드",
  },
  alternates: { canonical: "/blog" },
};

export default function BlogListPage() {
  const posts = getAllPosts();

  return (
    <>
      <section className="bg-[#0A0A0A] px-4 pb-10 pt-12 text-center sm:pb-14 sm:pt-16">
        <div className="mx-auto max-w-3xl">
          <span
            className="inline-flex items-center gap-1.5 rounded-full bg-neutral-800 px-4 py-1.5 text-xs font-semibold"
            style={{ color: "#d76542" }}
          >
            <FileText className="h-3.5 w-3.5" /> 블로그
          </span>
          <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            인사이트 & <span style={{ color: "#d76542" }}>가이드</span>
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-neutral-400 sm:text-base">
            바이브 코딩, AI 도구, 프로젝트 개발에 대한 이야기를 나눕니다.
          </p>
        </div>
      </section>

      <PageShell>
        <div className="grid gap-6 md:grid-cols-2">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6 transition hover:-translate-y-1 hover:border-neutral-600"
          >
            <div className="flex flex-wrap gap-2">
              {post.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-neutral-800 px-3 py-1 text-xs font-semibold text-neutral-400"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h2 className="mt-4 text-xl font-bold text-white group-hover:text-accent">
              {post.title}
            </h2>
            <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-neutral-400">
              {post.description}
            </p>
            <div className="mt-4 flex items-center gap-3 text-xs text-neutral-500">
              <span>{post.author}</span>
              <span>-</span>
              <time dateTime={post.date}>
                {new Date(post.date).toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            </div>
          </Link>
        ))}
      </div>

      {posts.length === 0 && (
        <div className="rounded-2xl border border-dashed border-neutral-800 px-6 py-12 text-center text-neutral-500">
          아직 작성된 글이 없습니다. 곧 새로운 콘텐츠가 업로드됩니다.
        </div>
      )}
      </PageShell>
    </>
  );
}
