import Link from "next/link";

import { TurnstileField } from "@/components/forms/turnstile-field";
import { ProseBlock } from "@/components/ui/prose-block";
import type { SessionProfile } from "@/lib/auth/session";
import type { ProjectCommentModel } from "@/lib/services/read-models";
import { formatRelative } from "@/lib/utils/date";

type CommentThreadProps = {
  comments: ProjectCommentModel[];
  viewer: SessionProfile | null;
  projectId: string;
  projectSlug: string;
  turnstileSiteKey: string | null;
};

type CommentComposerProps = {
  action: string;
  viewer: SessionProfile | null;
  projectSlug: string;
  submitLabel: string;
  turnstileSiteKey: string | null;
  hiddenFields?: Array<{ name: string; value: string }>;
  placeholder: string;
};

function getAuthorBadge(kind: ProjectCommentModel["author"]["kind"]) {
  if (kind === "guest") return "비회원";
  if (kind === "deleted") return "탈퇴 계정";
  return "멤버";
}

function CommentComposer({
  action,
  viewer,
  projectSlug,
  submitLabel,
  turnstileSiteKey,
  hiddenFields = [],
  placeholder
}: CommentComposerProps) {
  return (
    <form action={action} method="post" className="grid gap-3">
      {hiddenFields.map((field) => (
        <input key={`${field.name}-${field.value}`} type="hidden" name={field.name} value={field.value} />
      ))}
      <input type="hidden" name="redirectTo" value={`/p/${projectSlug}#comments`} />
      {!viewer ? (
        <label className="grid gap-2 text-sm font-semibold text-foreground">
          닉네임
          <input
            name="guestName"
            required
            minLength={2}
            maxLength={40}
            placeholder="어떻게 불러드리면 될까요?"
            className="rounded-2xl border border-line bg-white px-3 py-2 font-normal text-foreground placeholder:text-foreground-muted"
          />
        </label>
      ) : null}
      <textarea
        name="bodyMd"
        rows={4}
        required
        placeholder={placeholder}
        className="rounded-3xl border border-line bg-white px-4 py-3 text-sm text-foreground placeholder:text-foreground-muted"
      />
      {!viewer ? <TurnstileField siteKey={turnstileSiteKey} /> : null}
      <div className="flex flex-wrap items-center gap-3">
        <button className="w-fit rounded-full bg-[#111827] px-5 py-2.5 text-sm font-semibold text-white">{submitLabel}</button>
        {!viewer ? (
          <Link
            href={`/auth/sign-in?next=${encodeURIComponent(`/p/${projectSlug}#comments`)}`}
            className="text-sm font-semibold text-foreground-muted underline-offset-4 hover:underline"
          >
            로그인하면 저장과 멤버 피드백도 사용할 수 있습니다.
          </Link>
        ) : null}
      </div>
    </form>
  );
}

function CommentItem({
  comment,
  replies,
  viewer,
  projectSlug,
  projectId,
  turnstileSiteKey
}: {
  comment: ProjectCommentModel;
  replies: ProjectCommentModel[];
  viewer: SessionProfile | null;
  projectSlug: string;
  projectId: string;
  turnstileSiteKey: string | null;
}) {
  const canManageComment = Boolean(
    viewer &&
      comment.status === "active" &&
      (viewer.role === "admin" || (comment.author.kind === "member" && comment.author.id === viewer.id))
  );

  return (
    <article className="rounded-[28px] border border-line bg-white/90 p-5 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="font-semibold text-foreground">{comment.author.displayName}</div>
            <span className="rounded-full border border-line bg-surface-muted px-2.5 py-0.5 text-[11px] font-semibold text-foreground-muted">
              {getAuthorBadge(comment.author.kind)}
            </span>
          </div>
          <div className="text-sm text-foreground-muted">{formatRelative(comment.createdAt)}</div>
        </div>
        {comment.postId ? (
          <a href={`#post-${comment.postId}`} className="text-sm font-semibold text-foreground-muted">
            연결된 활동 보기
          </a>
        ) : null}
      </div>

      <div className="mt-4">
        {comment.status === "deleted" ? (
          <p className="text-sm font-medium text-foreground-muted">삭제된 댓글입니다.</p>
        ) : (
          <ProseBlock value={comment.bodyMd} muted />
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <details className="rounded-2xl border border-line bg-surface-muted px-4 py-3 text-sm text-foreground">
          <summary className="cursor-pointer font-semibold">답글 남기기</summary>
          <div className="mt-3">
            <CommentComposer
              action={`/api/comments/${comment.id}/replies`}
              viewer={viewer}
              projectSlug={projectSlug}
              submitLabel="답글 등록"
              turnstileSiteKey={turnstileSiteKey}
              hiddenFields={[{ name: "projectId", value: projectId }]}
              placeholder="짧고 구체적인 반응이 가장 도움이 됩니다."
            />
          </div>
        </details>

        <details className="rounded-2xl border border-line bg-surface-muted px-4 py-3 text-sm text-foreground">
          <summary className="cursor-pointer font-semibold">신고</summary>
          <form action="/api/reports" method="post" className="mt-3 grid gap-2">
            <input type="hidden" name="targetType" value="comment" />
            <input type="hidden" name="targetId" value={comment.id} />
            <input type="hidden" name="redirectTo" value={`/p/${projectSlug}#comments`} />
            <select name="reason" className="rounded-2xl border border-line bg-white px-3 py-2">
              <option value="spam">스팸</option>
              <option value="harassment">부적절한 내용</option>
              <option value="misleading">허위 또는 오해 소지</option>
            </select>
            <textarea
              name="note"
              rows={3}
              className="rounded-2xl border border-line bg-white px-3 py-2"
              placeholder="운영자가 참고할 내용을 남길 수 있습니다."
            />
            <TurnstileField siteKey={turnstileSiteKey} />
            <button className="rounded-full border border-line bg-white px-4 py-2 font-semibold text-foreground">신고 접수</button>
          </form>
        </details>

        {canManageComment ? (
          <details className="rounded-2xl border border-line bg-surface-muted px-4 py-3 text-sm text-foreground">
            <summary className="cursor-pointer font-semibold">수정</summary>
            <form action={`/api/comments/${comment.id}/edit`} method="post" className="mt-3 grid gap-2">
              <input type="hidden" name="redirectTo" value={`/p/${projectSlug}#comments`} />
              <textarea name="bodyMd" rows={3} defaultValue={comment.bodyMd} className="rounded-2xl border border-line bg-white px-3 py-2" />
              <button className="rounded-full bg-[#111827] px-4 py-2 font-semibold text-white">수정 저장</button>
            </form>
          </details>
        ) : null}

        {canManageComment ? (
          <form action={`/api/comments/${comment.id}/delete`} method="post">
            <input type="hidden" name="redirectTo" value={`/p/${projectSlug}#comments`} />
            <button className="rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-foreground">삭제</button>
          </form>
        ) : null}
      </div>

      {replies.length ? (
        <div className="mt-4 space-y-3 border-l border-line pl-4">
          {replies.map((reply) => (
            <div key={reply.id} className="rounded-2xl bg-surface-muted px-4 py-4">
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="font-semibold text-foreground">{reply.author.displayName}</div>
                  <span className="rounded-full border border-line bg-white px-2.5 py-0.5 text-[11px] font-semibold text-foreground-muted">
                    {getAuthorBadge(reply.author.kind)}
                  </span>
                </div>
                <div className="text-xs text-foreground-muted">{formatRelative(reply.createdAt)}</div>
              </div>
              {reply.status === "deleted" ? (
                <p className="text-sm text-foreground-muted">삭제된 댓글입니다.</p>
              ) : (
                <ProseBlock value={reply.bodyMd} muted />
              )}
            </div>
          ))}
        </div>
      ) : null}
    </article>
  );
}

export function CommentThread({ comments, viewer, projectId, projectSlug, turnstileSiteKey }: CommentThreadProps) {
  const rootComments = comments.filter((comment) => !comment.parentId);

  return (
    <div className="space-y-4">
      <div className="rounded-[28px] border border-line bg-white/90 p-5 shadow-soft">
        <div className="mb-3 text-lg font-bold tracking-tight text-foreground">댓글 남기기</div>
        <CommentComposer
          action={`/api/projects/${projectId}/comments`}
          viewer={viewer}
          projectSlug={projectSlug}
          submitLabel="댓글 등록"
          turnstileSiteKey={turnstileSiteKey}
          placeholder="실제로 써본 느낌, 개선 아이디어, 막힌 지점을 남겨 주세요."
        />
      </div>

      {rootComments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          replies={comments.filter((reply) => reply.parentId === comment.id)}
          viewer={viewer}
          projectSlug={projectSlug}
          projectId={projectId}
          turnstileSiteKey={turnstileSiteKey}
        />
      ))}
    </div>
  );
}
