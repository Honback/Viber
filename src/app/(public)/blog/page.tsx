import type { Metadata } from "next";
import Link from "next/link";

import { PageShell } from "@/components/ui/page-shell";
import { SectionHeading } from "@/components/ui/section-heading";
import { getAllPosts } from "@/lib/blog/posts";

export const metadata: Metadata = {
  title: "블로그",
  description:
    "바이브 코딩, AI 코딩 도구, 프로젝트 개발 팁에 대한 최신 글을 읽어보세요. Viber 커뮤니티의 인사이트와 가이드를 제공합니다.",
  keywords: ["바이브 코딩 블로그", "AI 코딩 가이드", "vibe coding blog", "프로젝트 개발 팁"],
  openGraph: {
    title: "블로그 | Viber",
    description: "바이브 코딩과 AI 프로젝트에 대한 인사이트와 가이드",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "블로그 | Viber",
    description: "바이브 코딩과 AI 프로젝트에 대한 인사이트와 가이드",
  },
  alternates: { canonical: "/blog" },
};

export default function BlogListPage() {
  const posts = getAllPosts();

  return (
    <PageShell>
      <SectionHeading
        eyebrow="블로그"
        title="인사이트 & 가이드"
        description="바이브 코딩, AI 도구, 프로젝트 개발에 대한 이야기를 나눕니다."
      />

      <div className="grid gap-6 md:grid-cols-2">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group rounded-[32px] border border-line bg-surface p-6 shadow-soft transition hover:border-line-strong hover:shadow-lg"
          >
            <div className="flex flex-wrap gap-2">
              {post.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-surface-muted px-3 py-1 text-xs font-semibold text-foreground-muted"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h2 className="mt-4 text-xl font-bold text-foreground group-hover:text-accent">
              {post.title}
            </h2>
            <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-foreground-muted">
              {post.description}
            </p>
            <div className="mt-4 flex items-center gap-3 text-xs text-foreground-muted">
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
        <div className="rounded-[28px] border border-dashed border-line px-6 py-12 text-center text-foreground-muted">
          아직 작성된 글이 없습니다. 곧 새로운 콘텐츠가 업로드됩니다.
        </div>
      )}
    </PageShell>
  );
}
