/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Heart } from "lucide-react";

import { OutboundLink } from "@/components/analytics/outbound-link";
import { ProjectEventBeacon } from "@/components/analytics/project-event-beacon";
import { ActivityFeed } from "@/components/projects/activity-feed";
import { CommentThread } from "@/components/projects/comment-thread";
import { ProjectGrid } from "@/components/projects/project-grid";
import { FlashBanner } from "@/components/ui/flash-banner";
import { PageShell } from "@/components/ui/page-shell";
import { ProseBlock } from "@/components/ui/prose-block";
import { SectionHeading } from "@/components/ui/section-heading";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  categoryLabels,
  platformLabels,
  pricingLabels,
  projectStatusLabels,
  stageLabels,
  verificationLabels
} from "@/lib/constants";
import { getCurrentProfile } from "@/lib/auth/session";
import { getProjectDetailBySlug, getProjectMetaBySlug, getViewerState, type ProjectPostModel } from "@/lib/services/read-models";
import { formatDate, formatRelative } from "@/lib/utils/date";

type ProjectDetailPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: ProjectDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectMetaBySlug(slug);
  if (!project) return {};

  const title = project.title;
  const description = `${project.tagline} — ${project.shortDescription}`.slice(0, 160);
  const categoryLabel = categoryLabels[project.category] ?? project.category;

  return {
    title,
    description,
    keywords: [
      "바이브 코딩",
      "vibe coding",
      categoryLabel,
      ...project.tags.map((t) => t.name),
    ],
    openGraph: {
      title: `${project.title} | Vibeollio`,
      description,
      type: "article",
      images: project.coverImageUrl ? [{ url: project.coverImageUrl, alt: `${project.title} 대표 이미지` }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: `${project.title} | Vibeollio`,
      description,
      images: project.coverImageUrl ? [project.coverImageUrl] : [],
    },
    alternates: {
      canonical: `/p/${slug}`,
    },
  };
}

function getValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getVisibilityTone(status: string) {
  if (status === "limited") return "warning" as const;
  if (status === "archived") return "danger" as const;
  if (status === "published") return "success" as const;
  return "default" as const;
}

export default async function ProjectDetailPage({ params, searchParams }: ProjectDetailPageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const viewer = await getCurrentProfile();
  const viewerState = await getViewerState(viewer?.id);
  const project = await getProjectDetailBySlug(slug);

  if (!project) notFound();

  const isOwner = viewerState.ownedProjectIds.includes(project.id);
  const canManage = isOwner || viewer?.role === "admin";
  const canView = ["published", "limited", "archived"].includes(project.status) || canManage;
  const visiblePosts = canManage ? project.posts : project.posts.filter((post) => post.status === "published");
  const visibleComments = project.comments.filter((comment) => comment.status !== "hidden");

  if (!canView) notFound();

  const isSaved = viewerState.savedProjectIds.includes(project.id);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://127.0.0.1:3000";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: project.title,
    description: project.tagline,
    url: `${appUrl}/p/${project.slug}`,
    image: project.coverImageUrl,
    applicationCategory: categoryLabels[project.category] ?? project.category,
    operatingSystem: platformLabels[project.platform as keyof typeof platformLabels],
    offers: {
      "@type": "Offer",
      price: project.pricingModel === "free" ? "0" : undefined,
      priceCurrency: "KRW",
      availability: "https://schema.org/InStock",
    },
    author: {
      "@type": "Person",
      name: project.makerAlias,
    },
    aggregateRating: project.metrics.saves > 0
      ? {
          "@type": "AggregateRating",
          ratingCount: project.metrics.saves,
          reviewCount: project.metrics.comments,
        }
      : undefined,
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "홈", item: appUrl },
      { "@type": "ListItem", position: 2, name: "프로젝트 탐색", item: `${appUrl}/projects` },
      { "@type": "ListItem", position: 3, name: project.title, item: `${appUrl}/p/${project.slug}` },
    ],
  };

  return (
    <PageShell className="gap-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <ProjectEventBeacon projectId={project.id} kind="project_detail_view" source="detail_page" />
      <FlashBanner notice={getValue(query.notice)} error={getValue(query.error)} />

      {(project.status === "limited" || project.status === "archived") && (
        <div className="rounded-2xl border border-line bg-surface px-5 py-4 text-sm text-foreground-muted">
          {project.status === "limited"
            ? "이 프로젝트는 제한 공개 상태입니다."
            : "이 프로젝트는 보관 상태입니다. 최신 운영 상태가 아닐 수 있습니다."}
        </div>
      )}

      {/* ── PH 스타일 헤더 ── */}
      <div className="flex items-start gap-4">
        {/* 로고 */}
        <div className="size-14 shrink-0 overflow-hidden rounded-2xl border border-line bg-surface-muted">
          <img src={project.coverImageUrl} alt={`${project.title} 로고`} className="h-full w-full object-cover" />
        </div>
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">{project.title}</h1>
            <StatusBadge label={stageLabels[project.stage as keyof typeof stageLabels]} tone="default" />
            {project.verificationState !== "unverified" && (
              <StatusBadge label={verificationLabels[project.verificationState]} tone="success" />
            )}
            {project.status !== "published" && (
              <StatusBadge label={projectStatusLabels[project.status]} tone={getVisibilityTone(project.status)} />
            )}
          </div>
          <p className="text-base text-foreground-muted">{project.tagline}</p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {project.badges.map((badge) => (
              <span key={badge} className="rounded-full border border-line bg-surface-muted px-2.5 py-0.5 text-xs font-semibold text-foreground-muted">
                {badge}
              </span>
            ))}
            {project.tags.map((tag) => (
              <Link key={tag.slug} href={`/tags/${tag.slug}`} className="rounded-full border border-line bg-surface px-2.5 py-0.5 text-xs font-semibold text-foreground hover:bg-surface-muted">
                #{tag.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── 메인 2컬럼 ── */}
      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">

        {/* 왼쪽: 커버 + 갤러리 + 소개 + 활동 + 댓글 */}
        <div className="space-y-6">
          {/* 커버 이미지 */}
          <img
            src={project.coverImageUrl}
            alt={`${project.title} 대표 이미지`}
            className="aspect-video w-full rounded-2xl border border-line bg-surface-muted object-cover"
          />

          {/* 갤러리 */}
          {project.gallery.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {project.gallery.slice(0, 4).map((image, index) => (
                <img
                  key={`${project.id}-gallery-${index}`}
                  src={image}
                  alt={`${project.title} 스크린샷 ${index + 1}`}
                  className="aspect-video w-full rounded-xl border border-line bg-surface-muted object-cover"
                />
              ))}
            </div>
          )}

          {/* 소개 */}
          <div className="space-y-5 rounded-2xl border border-line bg-surface p-6">
            <div>
              <div className="mb-2 text-sm font-semibold text-foreground">무엇인지</div>
              <ProseBlock value={project.overviewMd} />
            </div>
            <div>
              <div className="mb-2 text-sm font-semibold text-foreground">어떤 문제를 푸는지</div>
              <ProseBlock value={project.problemMd} />
            </div>
            <div>
              <div className="mb-2 text-sm font-semibold text-foreground">누구를 위한 것인지</div>
              <ProseBlock value={project.targetUsersMd} />
            </div>
            {project.whyMadeMd && (
              <div>
                <div className="mb-2 text-sm font-semibold text-foreground">왜 만들었는지</div>
                <ProseBlock value={project.whyMadeMd} />
              </div>
            )}
          </div>

          {/* 활동 */}
          <div id="activity" className="space-y-4">
            <SectionHeading eyebrow="활동" title="런치 이후의 변화" description="업데이트와 피드백 요청이 시간순으로 쌓입니다." />
            <ActivityFeed posts={visiblePosts} projectId={project.id} projectSlug={project.slug} />
          </div>

          {/* 댓글 */}
          <div id="comments" className="space-y-4">
            <SectionHeading eyebrow="댓글" title="댓글과 피드백" />
            <CommentThread comments={visibleComments} viewer={viewer} projectId={project.id} projectSlug={project.slug} />
          </div>
        </div>

        {/* 오른쪽 사이드바 */}
        <aside className="space-y-4">

          {/* Visit Site */}
          <OutboundLink
            projectId={project.id}
            source="detail_try"
            href={project.liveUrl}
            className="flex w-full items-center justify-center rounded-xl bg-surface py-3 text-sm font-bold text-foreground border border-line hover:bg-surface-muted transition"
          >
            Visit Site
          </OutboundLink>

          {/* 저장 */}
          {viewer ? (
            <form action={`/api/projects/${project.id}/save`} method="post">
              <input type="hidden" name="redirectTo" value={`/p/${project.slug}`} />
              <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-line bg-surface py-3 text-sm font-semibold text-foreground hover:bg-surface-muted transition">
                <Heart className={`size-4 ${isSaved ? "fill-current text-red-500" : ""}`} />
                {isSaved ? "저장됨" : "저장"}
              </button>
            </form>
          ) : (
            <Link
              href={`/auth/sign-in?next=${encodeURIComponent(`/p/${project.slug}`)}`}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-line bg-surface py-3 text-sm font-semibold text-foreground hover:bg-surface-muted transition"
            >
              <Heart className="size-4" />
              로그인 후 저장
            </Link>
          )}

          {/* Makers */}
          <div className="rounded-2xl border border-line bg-surface p-4 space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-foreground-muted">Makers</p>
            <div className="flex items-center gap-3">
              <div className="grid size-9 shrink-0 place-items-center rounded-full bg-surface-muted text-sm font-bold text-foreground">
                {project.makerAlias.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{project.makerAlias}</p>
                <p className="text-xs text-foreground-muted">{formatRelative(project.latestActivityAt)}</p>
              </div>
            </div>
          </div>

          {/* Topics */}
          {project.tags.length > 0 && (
            <div className="rounded-2xl border border-line bg-surface p-4 space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-foreground-muted">Topics</p>
              <div className="flex flex-col gap-2">
                {project.tags.map((tag) => (
                  <Link
                    key={tag.slug}
                    href={`/tags/${tag.slug}`}
                    className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-foreground-muted transition"
                  >
                    <span className="grid size-7 place-items-center rounded-lg border border-line bg-surface-muted text-xs">
                      #
                    </span>
                    {tag.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* 카테고리 / 플랫폼 */}
          <div className="rounded-2xl border border-line bg-surface p-4 space-y-2 text-sm">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-foreground-muted">Info</p>
            <div className="flex justify-between">
              <span className="text-foreground-muted">카테고리</span>
              <span className="font-semibold">{categoryLabels[project.category] ?? project.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground-muted">플랫폼</span>
              <span className="font-semibold">{platformLabels[project.platform as keyof typeof platformLabels]}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground-muted">가격</span>
              <span className="font-semibold">{pricingLabels[project.pricingModel as keyof typeof pricingLabels] ?? project.pricingModel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground-muted">가입 필요</span>
              <span className="font-semibold">{project.noSignupRequired ? "불필요" : "필요"}</span>
            </div>
          </div>

          {/* Featured */}
          {project.publishedAt && (
            <div className="rounded-2xl border border-line bg-surface p-4 space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-foreground-muted">Featured</p>
              <p className="text-sm font-semibold text-foreground">{formatDate(project.publishedAt)}</p>
            </div>
          )}

          {/* Links */}
          <div className="rounded-2xl border border-line bg-surface p-4 space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-foreground-muted">Links</p>
            {project.githubUrl && (
              <OutboundLink projectId={project.id} source="detail_github" href={project.githubUrl} className="block rounded-xl border border-line bg-background px-3 py-2 text-sm font-medium text-foreground hover:bg-surface-muted transition">
                GitHub
              </OutboundLink>
            )}
            {project.demoUrl && (
              <OutboundLink projectId={project.id} source="detail_demo" href={project.demoUrl} className="block rounded-xl border border-line bg-background px-3 py-2 text-sm font-medium text-foreground hover:bg-surface-muted transition">
                Demo
              </OutboundLink>
            )}
            {project.docsUrl && (
              <OutboundLink projectId={project.id} source="detail_docs" href={project.docsUrl} className="block rounded-xl border border-line bg-background px-3 py-2 text-sm font-medium text-foreground hover:bg-surface-muted transition">
                Docs
              </OutboundLink>
            )}
          </div>

          {/* AI Tools */}
          {project.aiTools.length > 0 && (
            <div className="rounded-2xl border border-line bg-surface p-4 space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-foreground-muted">AI Tools</p>
              <div className="flex flex-wrap gap-1.5">
                {project.aiTools.map((tool) => (
                  <span key={tool} className="rounded-full border border-line bg-surface-muted px-2.5 py-0.5 text-xs font-semibold text-foreground">
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 관리 */}
          {canManage && (
            <Link href="/me/projects" className="flex w-full items-center justify-center rounded-xl border border-line bg-surface py-2.5 text-sm font-semibold text-foreground hover:bg-surface-muted transition">
              내 프로젝트에서 관리
            </Link>
          )}

          {/* 신고 */}
          <form action="/api/reports" method="post" className="rounded-2xl border border-line bg-surface p-4 space-y-3">
            <input type="hidden" name="targetType" value="project" />
            <input type="hidden" name="targetId" value={project.id} />
            <input type="hidden" name="redirectTo" value={`/p/${project.slug}`} />
            <p className="text-[11px] font-semibold uppercase tracking-widest text-foreground-muted">Report this startup</p>
            <select name="reason" className="w-full rounded-xl border border-line bg-background px-3 py-2 text-sm text-foreground">
              <option value="spam">스팸</option>
              <option value="duplicate">중복 등록</option>
              <option value="broken-link">죽은 링크</option>
              <option value="impersonation">사칭</option>
              <option value="misleading">허위 또는 오해 소지</option>
            </select>
            <textarea name="note" rows={3} placeholder="운영자 메모" className="w-full rounded-xl border border-line bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted" />
            <button className="rounded-full border border-line bg-background px-4 py-1.5 text-sm font-semibold text-foreground hover:bg-surface-muted transition">
              신고 접수
            </button>
          </form>
        </aside>
      </div>

      {/* 관련 프로젝트 */}
      {project.relatedProjects.length > 0 && (
        <section className="space-y-5">
          <SectionHeading eyebrow="추천" title="비슷한 프로젝트" />
          <ProjectGrid items={project.relatedProjects} viewer={viewer} savedProjectIds={viewerState.savedProjectIds} surface="tag" />
        </section>
      )}
    </PageShell>
  );
}
