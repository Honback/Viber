import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageShell } from "@/components/ui/page-shell";
import { getAllSlugs, getPostBySlug } from "@/lib/blog/posts";
import { renderBlogMarkdown } from "@/lib/blog/render";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.description,
    keywords: post.tags,
    openGraph: {
      title: `${post.title} | Viber 블로그`,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
    alternates: { canonical: `/blog/${slug}` },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://127.0.0.1:3000";

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: { "@type": "Person", name: post.author },
    publisher: {
      "@type": "Organization",
      name: "Viber",
      url: appUrl,
    },
    mainEntityOfPage: `${appUrl}/blog/${slug}`,
    keywords: post.tags.join(", "),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "홈", item: appUrl },
      { "@type": "ListItem", position: 2, name: "블로그", item: `${appUrl}/blog` },
      { "@type": "ListItem", position: 3, name: post.title, item: `${appUrl}/blog/${slug}` },
    ],
  };

  // Build FAQ JSON-LD from H2 question headers
  const faqItems = extractFaqFromContent(post.content);
  const faqJsonLd = faqItems.length > 0
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqItems.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      }
    : null;

  return (
    <PageShell className="gap-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      {faqJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      )}

      <div>
        <Link
          href="/blog"
          className="inline-flex items-center gap-1 text-sm font-semibold text-foreground-muted hover:text-foreground"
        >
          &larr; 블로그 목록
        </Link>
      </div>

      <article className="rounded-[36px] border border-line bg-surface p-6 shadow-soft md:p-10">
        <header className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-surface-muted px-3 py-1 text-xs font-semibold text-foreground-muted"
              >
                {tag}
              </span>
            ))}
          </div>

          <h1 className="text-[clamp(1.8rem,3.5vw,2.8rem)] font-extrabold leading-tight tracking-tight text-foreground">
            {post.title}
          </h1>

          <p className="max-w-3xl text-base leading-relaxed text-foreground-muted md:text-lg">
            {post.description}
          </p>

          <div className="flex items-center gap-3 text-sm text-foreground-muted">
            <span className="font-semibold">{post.author}</span>
            <span>-</span>
            <time dateTime={post.date}>
              {new Date(post.date).toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          </div>
        </header>

        <hr className="my-8 border-line" />

        <div
          className="blog-prose prose-block"
          dangerouslySetInnerHTML={{ __html: renderBlogMarkdown(post.content) }}
        />
      </article>

      <div className="text-center">
        <Link
          href="/blog"
          className="inline-flex rounded-full border border-line bg-surface px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-surface-muted"
        >
          다른 글 읽기
        </Link>
      </div>
    </PageShell>
  );
}

function extractFaqFromContent(content: string): { question: string; answer: string }[] {
  const lines = content.split("\n");
  const faqs: { question: string; answer: string }[] = [];
  let currentQuestion = "";
  let currentAnswer: string[] = [];

  for (const line of lines) {
    const h2Match = line.match(/^## (.+\?)\s*$/);
    if (h2Match) {
      if (currentQuestion && currentAnswer.length > 0) {
        faqs.push({
          question: currentQuestion,
          answer: currentAnswer.join(" ").replace(/[#*_`[\]()]/g, "").trim().slice(0, 300),
        });
      }
      currentQuestion = h2Match[1];
      currentAnswer = [];
    } else if (currentQuestion && line.trim() && !line.startsWith("##")) {
      currentAnswer.push(line.trim());
    } else if (line.startsWith("## ") && !line.includes("?")) {
      if (currentQuestion && currentAnswer.length > 0) {
        faqs.push({
          question: currentQuestion,
          answer: currentAnswer.join(" ").replace(/[#*_`[\]()]/g, "").trim().slice(0, 300),
        });
      }
      currentQuestion = "";
      currentAnswer = [];
    }
  }

  if (currentQuestion && currentAnswer.length > 0) {
    faqs.push({
      question: currentQuestion,
      answer: currentAnswer.join(" ").replace(/[#*_`[\]()]/g, "").trim().slice(0, 300),
    });
  }

  return faqs;
}
