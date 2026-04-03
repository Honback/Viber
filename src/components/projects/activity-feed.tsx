/* eslint-disable @next/next/no-img-element */
import { TurnstileField } from "@/components/forms/turnstile-field";
import { projectPostLabels } from "@/lib/constants";
import type { ProjectPostModel } from "@/lib/services/read-models";
import { formatDate } from "@/lib/utils/date";
import { ProseBlock } from "@/components/ui/prose-block";
import { StatusBadge } from "@/components/ui/status-badge";

type ActivityFeedProps = {
  posts: ProjectPostModel[];
  projectId: string;
  projectSlug: string;
  turnstileSiteKey: string | null;
};

function getTone(type: ProjectPostModel["type"]) {
  if (type === "launch") return "success" as const;
  if (type === "feedback") return "info" as const;
  return "default" as const;
}

function getPostHeading(post: ProjectPostModel) {
  if (post.type !== "feedback") {
    return projectPostLabels[post.type];
  }

  return post.author.kind === "member" ? "멤버 피드백" : "피드백 요청";
}

export function ActivityFeed({ posts, projectId, projectSlug, turnstileSiteKey }: ActivityFeedProps) {
  if (!posts.length) {
    return (
      <div className="rounded-[28px] border border-dashed border-line bg-white/80 px-5 py-8 text-sm text-foreground-muted">
        아직 공개된 활동이 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <article key={post.id} className="rounded-[28px] border border-line bg-white/90 p-5 shadow-soft">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge label={getPostHeading(post)} tone={getTone(post.type)} />
                {post.status !== "published" ? <StatusBadge label={post.status === "pending" ? "게시 전" : post.status === "hidden" ? "비공개" : "반려"} tone="warning" /> : null}
              </div>
              <h3 className="text-lg font-bold tracking-tight text-foreground">{post.title}</h3>
              <p className="text-sm leading-6 text-foreground-muted">{post.summary}</p>
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground-muted">
                {post.author.label} · {post.author.displayName}
              </div>
            </div>
            <div className="text-sm text-foreground-muted">{post.publishedAt ? formatDate(post.publishedAt) : "게시 전"}</div>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-4">
              <ProseBlock value={post.bodyMd} />
              {post.requestedFeedbackMd ? (
                <div className="rounded-3xl bg-surface-muted px-4 py-4">
                  <div className="mb-2 text-sm font-semibold text-foreground">
                    {post.author.kind === "member" ? "핵심 피드백 포인트" : "원하는 피드백"}
                  </div>
                  <ProseBlock value={post.requestedFeedbackMd} muted />
                </div>
              ) : null}
            </div>

            <div className="space-y-3">
              {post.media.length ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {post.media.slice(0, 2).map((item, index) => (
                    <img key={`${post.id}-${index}`} src={item} alt={`${post.title} 미디어 ${index + 1}`} className="aspect-[16/10] w-full rounded-2xl border border-line bg-surface-muted object-cover" />
                  ))}
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-line bg-surface-muted px-4 py-5 text-sm text-foreground-muted">
                  첨부된 미디어가 없습니다.
                </div>
              )}

              <form action={`/api/reports`} method="post" className="rounded-3xl border border-line bg-[rgba(255,253,248,0.92)] p-4">
                <input type="hidden" name="targetType" value="post" />
                <input type="hidden" name="targetId" value={post.id} />
                <input type="hidden" name="redirectTo" value={`/p/${projectSlug}#activity`} />
                <div className="mb-2 text-sm font-semibold text-foreground">활동 신고</div>
                <div className="grid gap-2">
                  <select name="reason" className="rounded-2xl border border-line bg-white px-3 py-2 text-sm text-foreground">
                    <option value="spam">스팸</option>
                    <option value="duplicate">중복</option>
                    <option value="impersonation">사칭</option>
                    <option value="misleading">허위 또는 오해 소지</option>
                  </select>
                  <textarea
                    name="note"
                    rows={3}
                    placeholder="운영자가 참고할 메모를 남길 수 있습니다."
                    className="rounded-2xl border border-line bg-white px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted"
                  />
                  <TurnstileField siteKey={turnstileSiteKey} />
                  <button className="rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-foreground">신고 접수</button>
                </div>
              </form>
            </div>
          </div>

          <div id={`post-${post.id}`} className="sr-only">
            {projectId}
          </div>
        </article>
      ))}
    </div>
  );
}
