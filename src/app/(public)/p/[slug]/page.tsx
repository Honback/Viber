/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { notFound } from "next/navigation";

import { OutboundLink } from "@/components/analytics/outbound-link";
import { ProjectEventBeacon } from "@/components/analytics/project-event-beacon";
import { ActivityFeed } from "@/components/projects/activity-feed";
import { CommentThread } from "@/components/projects/comment-thread";
import { ProjectGrid } from "@/components/projects/project-grid";
import { TurnstileField } from "@/components/forms/turnstile-field";
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
import { turnstileSiteKey } from "@/lib/env";
import { getProjectDetailBySlug, getViewerState, type ProjectPostModel } from "@/lib/services/read-models";
import { formatDate, formatRelative } from "@/lib/utils/date";

type ProjectDetailPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

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

  if (!project) {
    notFound();
  }

  const isOwner = viewerState.ownedProjectIds.includes(project.id);
  const canManage = isOwner || viewer?.role === "admin";
  const canView = ["published", "limited", "archived"].includes(project.status) || canManage;
  const visiblePosts: ProjectPostModel[] = canManage ? project.posts : project.posts.filter((post) => post.status === "published");
  const visibleComments = project.comments.filter((comment) => comment.status !== "hidden");

  if (!canView) {
    notFound();
  }

  return (
    <PageShell className="gap-8">
      <ProjectEventBeacon projectId={project.id} kind="project_detail_view" source="detail_page" />
      <FlashBanner notice={getValue(query.notice)} error={getValue(query.error)} />

      {(project.status === "limited" || project.status === "archived") && (
        <div className="rounded-[28px] border border-line bg-[rgba(255,253,248,0.94)] px-5 py-4 text-sm text-foreground-muted shadow-soft">
          {project.status === "limited"
            ? "이 프로젝트는 제한 공개 상태입니다. 상세 접근은 가능하지만 메인 추천과 트렌딩에는 포함되지 않습니다."
            : "이 프로젝트는 보관 상태입니다. 최신 운영 상태가 아닐 수 있으니 체험 전 마지막 업데이트를 확인하세요."}
        </div>
      )}

      <section className="grid gap-6 rounded-[36px] border border-line bg-[rgba(255,253,248,0.96)] p-6 shadow-soft lg:grid-cols-[1.08fr_0.92fr]">
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge label={stageLabels[project.stage as keyof typeof stageLabels]} tone="default" />
            {project.verificationState !== "unverified" ? <StatusBadge label={verificationLabels[project.verificationState]} tone="success" /> : null}
            {project.status !== "published" ? <StatusBadge label={projectStatusLabels[project.status]} tone={getVisibilityTone(project.status)} /> : null}
            {project.linkHealth && project.linkHealth.status !== "healthy" ? (
              <StatusBadge label={project.linkHealth.label} tone={project.linkHealth.status === "broken" ? "danger" : "warning"} />
            ) : null}
          </div>

          <div className="space-y-3">
            <h1 className="text-[clamp(2.2rem,4vw,3.6rem)] font-extrabold tracking-tight text-foreground">{project.title}</h1>
            <p className="max-w-3xl text-base leading-8 text-foreground-muted md:text-lg">{project.tagline}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {project.badges.map((badge) => (
              <span key={badge} className="rounded-full border border-line bg-surface-muted px-3 py-1.5 text-sm font-semibold text-foreground-muted">
                {badge}
              </span>
            ))}
            {project.tags.map((tag) => (
              <Link key={tag.slug} href={`/tags/${tag.slug}`} className="rounded-full border border-line bg-white px-3 py-1.5 text-sm font-semibold text-foreground">
                #{tag.name}
              </Link>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <OutboundLink
              projectId={project.id}
              source="detail_try"
              href={project.liveUrl}
              className="grid place-items-center rounded-full bg-[#111827] px-5 py-3 text-sm font-semibold text-white"
            >
              바로 체험하기
            </OutboundLink>

            {project.githubUrl ? (
              <OutboundLink
                projectId={project.id}
                source="detail_github"
                href={project.githubUrl}
                className="grid place-items-center rounded-full border border-line bg-white px-5 py-3 text-sm font-semibold text-foreground"
              >
                GitHub 보기
              </OutboundLink>
            ) : null}

            {viewer ? (
              <form action={`/api/projects/${project.id}/save`} method="post">
                <input type="hidden" name="redirectTo" value={`/p/${project.slug}`} />
                <button className="w-full rounded-full border border-line bg-white px-5 py-3 text-sm font-semibold text-foreground">
                  {viewerState.savedProjectIds.includes(project.id) ? "저장됨" : "저장"}
                </button>
              </form>
            ) : (
              <Link
                href={`/auth/sign-in?next=${encodeURIComponent(`/p/${project.slug}`)}`}
                className="grid place-items-center rounded-full border border-line bg-white px-5 py-3 text-sm font-semibold text-foreground"
              >
                로그인 후 저장
              </Link>
            )}

            {canManage ? (
              <Link href="/me/projects" className="grid place-items-center rounded-full border border-line bg-white px-5 py-3 text-sm font-semibold text-foreground">
                내 프로젝트에서 관리
              </Link>
            ) : (
              <a href="#activity" className="grid place-items-center rounded-full border border-line bg-white px-5 py-3 text-sm font-semibold text-foreground">
                활동 보기
              </a>
            )}
          </div>

          <div className="grid gap-3 rounded-[28px] border border-line bg-white p-5 md:grid-cols-3">
            <div>
              <div className="text-sm text-foreground-muted">메이커</div>
              <div className="mt-1 font-semibold text-foreground">{project.makerAlias}</div>
            </div>
            <div>
              <div className="text-sm text-foreground-muted">마지막 활동</div>
              <div className="mt-1 font-semibold text-foreground">{formatRelative(project.latestActivityAt)}</div>
            </div>
            <div>
              <div className="text-sm text-foreground-muted">공개일</div>
              <div className="mt-1 font-semibold text-foreground">{project.publishedAt ? formatDate(project.publishedAt) : "공개 전"}</div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <img src={project.coverImageUrl} alt={`${project.title} 대표 이미지`} className="aspect-[16/10] w-full rounded-[28px] border border-line bg-surface-muted object-cover" />
          <div className="grid gap-3 sm:grid-cols-2">
            {project.gallery.slice(0, 4).map((image, index) => (
              <img key={`${project.id}-gallery-${index}`} src={image} alt={`${project.title} 갤러리 ${index + 1}`} className="aspect-[16/10] w-full rounded-3xl border border-line bg-surface-muted object-cover" />
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <div className="rounded-[32px] border border-line bg-white/90 p-6 shadow-soft">
            <SectionHeading eyebrow="소개" title="이 프로젝트를 이해하기" />
            <div className="mt-5 space-y-6">
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
            </div>
          </div>

          {project.whyMadeMd ? (
            <div className="rounded-[32px] border border-line bg-white/90 p-6 shadow-soft">
              <SectionHeading eyebrow="배경" title="왜 만들었는지" />
              <div className="mt-5">
                <ProseBlock value={project.whyMadeMd} />
              </div>
            </div>
          ) : null}

          <div id="activity" className="space-y-5">
            <SectionHeading eyebrow="활동" title="런치 이후의 변화" description="하나의 프로젝트 아래에 업데이트와 피드백 요청이 시간순으로 쌓입니다." />
            <ActivityFeed posts={visiblePosts} projectId={project.id} projectSlug={project.slug} turnstileSiteKey={turnstileSiteKey} />
          </div>

          <div id="write-feedback" className="space-y-5">
            <SectionHeading
              eyebrow="Feedback"
              title="구조화된 피드백 남기기"
              description="댓글보다 길고 구조적인 사용 후기는 feedback 활동으로 남길 수 있습니다."
            />
            {viewer ? (
              canManage ? (
                <div className="rounded-[28px] border border-line bg-white/90 px-5 py-5 text-sm text-foreground-muted shadow-soft">
                  메이커와 관리자는 내 프로젝트 화면에서 업데이트와 피드백 요청을 추가할 수 있습니다.
                  <div className="mt-4">
                    <Link href="/me/projects" className="inline-flex rounded-full border border-line bg-white px-4 py-2 font-semibold text-foreground">
                      내 프로젝트에서 작성
                    </Link>
                  </div>
                </div>
              ) : (
                <form action={`/api/projects/${project.id}/posts`} method="post" className="rounded-[28px] border border-line bg-white/90 p-5 shadow-soft">
                  <input type="hidden" name="kind" value="feedback" />
                  <input type="hidden" name="redirectTo" value={`/p/${project.slug}#write-feedback`} />
                  <div className="grid gap-3">
                    <label className="grid gap-2 text-sm font-semibold text-foreground">
                      제목
                      <input
                        name="title"
                        required
                        placeholder="예: 온보딩 첫 단계에서 막힌 지점"
                        className="rounded-2xl border border-line bg-white px-4 py-3 font-normal"
                      />
                    </label>
                    <label className="grid gap-2 text-sm font-semibold text-foreground">
                      요약
                      <input
                        name="summary"
                        required
                        placeholder="무엇이 좋았고 어디서 막혔는지 짧게 남겨 주세요."
                        className="rounded-2xl border border-line bg-white px-4 py-3 font-normal"
                      />
                    </label>
                    <label className="grid gap-2 text-sm font-semibold text-foreground">
                      상세 피드백
                      <textarea
                        name="bodyMd"
                        rows={5}
                        required
                        placeholder="실제로 눌러본 흐름, 기대와 달랐던 점, 개선되면 좋을 점을 구체적으로 적어 주세요."
                        className="rounded-3xl border border-line bg-white px-4 py-3 font-normal"
                      />
                    </label>
                    <label className="grid gap-2 text-sm font-semibold text-foreground">
                      특히 전달하고 싶은 포인트
                      <textarea
                        name="requestedFeedbackMd"
                        rows={3}
                        placeholder="메이커가 먼저 확인하면 좋을 포인트가 있다면 남겨 주세요."
                        className="rounded-3xl border border-line bg-white px-4 py-3 font-normal"
                      />
                    </label>
                    <label className="grid gap-2 text-sm font-semibold text-foreground">
                      참고 이미지 URL들
                      <input
                        name="mediaCsv"
                        placeholder="쉼표로 구분해 입력"
                        className="rounded-2xl border border-line bg-white px-4 py-3 font-normal"
                      />
                    </label>
                    <div className="rounded-3xl border border-line bg-surface px-4 py-4 text-sm text-foreground-muted">
                      멤버가 남긴 feedback 활동은 기본적으로 검토 대기 상태로 저장되고, 운영 기준을 통과하면 공개됩니다.
                    </div>
                    <button className="w-fit rounded-full bg-[#111827] px-5 py-2.5 text-sm font-semibold text-white">피드백 등록</button>
                  </div>
                </form>
              )
            ) : (
              <div className="rounded-[28px] border border-dashed border-line bg-white/80 px-5 py-5 text-sm text-foreground-muted">
                구조화된 feedback 활동 작성은 로그인한 멤버부터 사용할 수 있습니다.
                <div className="mt-4">
                  <Link
                    href={`/auth/sign-in?next=${encodeURIComponent(`/p/${project.slug}#write-feedback`)}`}
                    className="inline-flex rounded-full border border-line bg-white px-4 py-2 font-semibold text-foreground"
                  >
                    로그인하고 feedback 작성
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div id="comments" className="space-y-5">
            <SectionHeading eyebrow="댓글" title="댓글과 피드백" description="프로젝트를 써본 사람들이 남긴 반응을 한 곳에서 확인할 수 있습니다." />
            <CommentThread comments={visibleComments} viewer={viewer} projectId={project.id} projectSlug={project.slug} turnstileSiteKey={turnstileSiteKey} />
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-[32px] border border-line bg-white/90 p-6 shadow-soft">
            <SectionHeading eyebrow="상태" title="현재 상태" />
            <dl className="mt-5 space-y-4 text-sm text-foreground">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-foreground-muted">카테고리</dt>
                <dd className="font-semibold">{categoryLabels[project.category] ?? project.category}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-foreground-muted">플랫폼</dt>
                <dd className="font-semibold">{platformLabels[project.platform as keyof typeof platformLabels]}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-foreground-muted">가격 모델</dt>
                <dd className="font-semibold">{pricingLabels[project.pricingModel as keyof typeof pricingLabels] ?? project.pricingModel}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-foreground-muted">가입 필요 여부</dt>
                <dd className="font-semibold">{project.noSignupRequired ? "가입 없이 체험 가능" : "가입 필요"}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-foreground-muted">오픈소스</dt>
                <dd className="font-semibold">{project.isOpenSource ? "예" : "아니오"}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-foreground-muted">1인 메이커</dt>
                <dd className="font-semibold">{project.isSoloMaker ? "예" : "아니오"}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-[32px] border border-line bg-white/90 p-6 shadow-soft">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground-muted">Links</div>
            <div className="mt-4 grid gap-3">
              <OutboundLink
                projectId={project.id}
                source="detail_try"
                href={project.liveUrl}
                className="rounded-2xl border border-line bg-white px-4 py-3 text-sm font-semibold text-foreground"
              >
                라이브 페이지 열기
              </OutboundLink>
              {project.demoUrl ? (
                <OutboundLink
                  projectId={project.id}
                  source="detail_demo"
                  href={project.demoUrl}
                  className="rounded-2xl border border-line bg-white px-4 py-3 text-sm font-semibold text-foreground"
                >
                  데모 보기
                </OutboundLink>
              ) : null}
              {project.githubUrl ? (
                <OutboundLink
                  projectId={project.id}
                  source="detail_github"
                  href={project.githubUrl}
                  className="rounded-2xl border border-line bg-white px-4 py-3 text-sm font-semibold text-foreground"
                >
                  GitHub 저장소
                </OutboundLink>
              ) : null}
              {project.docsUrl ? (
                <OutboundLink
                  projectId={project.id}
                  source="detail_docs"
                  href={project.docsUrl}
                  className="rounded-2xl border border-line bg-white px-4 py-3 text-sm font-semibold text-foreground"
                >
                  문서 링크
                </OutboundLink>
              ) : null}
            </div>
          </div>

          <div className="rounded-[32px] border border-line bg-white/90 p-6 shadow-soft">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground-muted">AI Tools</div>
            <div className="mt-4 flex flex-wrap gap-2">
              {project.aiTools.length ? (
                project.aiTools.map((tool) => (
                  <span key={tool} className="rounded-full border border-line bg-surface-muted px-3 py-1.5 text-sm font-semibold text-foreground">
                    {tool}
                  </span>
                ))
              ) : (
                <span className="text-sm text-foreground-muted">입력된 AI 도구 정보가 없습니다.</span>
              )}
            </div>
          </div>

          <form action="/api/reports" method="post" className="rounded-[32px] border border-line bg-white/90 p-6 shadow-soft">
            <input type="hidden" name="targetType" value="project" />
            <input type="hidden" name="targetId" value={project.id} />
            <input type="hidden" name="redirectTo" value={`/p/${project.slug}`} />
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground-muted">Report</div>
            <div className="mt-4 grid gap-3">
              <select name="reason" className="rounded-2xl border border-line bg-white px-4 py-3 text-sm text-foreground">
                <option value="spam">스팸</option>
                <option value="duplicate">중복 등록</option>
                <option value="broken-link">죽은 링크</option>
                <option value="impersonation">사칭</option>
                <option value="misleading">허위 또는 오해 소지</option>
              </select>
              <textarea name="note" rows={4} placeholder="운영자가 참고할 메모를 남겨 주세요." className="rounded-3xl border border-line bg-white px-4 py-3 text-sm text-foreground placeholder:text-foreground-muted" />
              <TurnstileField siteKey={turnstileSiteKey} />
              <button className="w-fit rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-foreground">신고 접수</button>
            </div>
          </form>
        </aside>
      </section>

      <section className="space-y-5">
        <SectionHeading eyebrow="추천" title="비슷한 프로젝트" description="같은 태그와 카테고리를 가진 프로젝트를 이어서 확인할 수 있습니다." />
        <ProjectGrid items={project.relatedProjects} viewer={viewer} savedProjectIds={viewerState.savedProjectIds} surface="tag" />
      </section>
    </PageShell>
  );
}
