"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageSquare, MessageCircle } from "lucide-react";

import type { SessionProfile } from "@/lib/auth/session";
import type { ProjectCommentModel } from "@/lib/services/read-models";
import { formatRelative } from "@/lib/utils/date";
import { ProseBlock } from "@/components/ui/prose-block";

type CommentThreadProps = {
  comments: ProjectCommentModel[];
  viewer: SessionProfile | null;
  projectId: string;
  projectSlug: string;
};

/* ── Single comment card ── */
function CommentItem({
  comment,
  replies,
  viewer,
  projectSlug,
  projectId,
}: {
  comment: ProjectCommentModel;
  replies: ProjectCommentModel[];
  viewer: SessionProfile | null;
  projectSlug: string;
  projectId: string;
}) {
  const canEdit =
    viewer && viewer.id === comment.author.id && comment.status === "active";

  return (
    <article className="rounded-xl border border-line bg-surface px-4 py-3">
      {/* author + time */}
      <div className="flex items-center gap-2">
        <div className="grid size-6 shrink-0 place-items-center rounded-full bg-surface-muted text-[10px] font-bold text-foreground">
          {comment.author.displayName.charAt(0).toUpperCase()}
        </div>
        <span className="text-sm font-semibold text-foreground">
          {comment.author.displayName}
        </span>
        <span className="text-xs text-foreground-muted">
          {formatRelative(comment.createdAt)}
        </span>
      </div>

      {/* body */}
      <div className="mt-1.5 text-sm leading-relaxed text-foreground">
        {comment.status === "deleted" ? (
          <p className="text-foreground-muted">삭제된 댓글입니다.</p>
        ) : (
          <ProseBlock value={comment.bodyMd} muted />
        )}
      </div>

      {/* edit/delete (owner only) */}
      {canEdit && (
        <div className="mt-2 flex gap-1.5 text-xs">
          <details className="rounded-lg border border-line px-2.5 py-1 text-foreground-muted">
            <summary className="cursor-pointer font-semibold hover:text-foreground">수정</summary>
            <form action={`/api/comments/${comment.id}/edit`} method="post" className="mt-2 grid gap-2">
              <input type="hidden" name="redirectTo" value={`/p/${projectSlug}#comments`} />
              <textarea name="bodyMd" rows={2} defaultValue={comment.bodyMd} className="rounded-lg border border-line bg-surface-muted px-3 py-2 text-sm text-foreground" />
              <button className="w-fit rounded-lg bg-foreground px-3 py-1.5 text-xs font-semibold text-surface">저장</button>
            </form>
          </details>
          <form action={`/api/comments/${comment.id}/delete`} method="post">
            <input type="hidden" name="redirectTo" value={`/p/${projectSlug}#comments`} />
            <button className="rounded-lg border border-line px-2.5 py-1 text-foreground-muted hover:text-red-500 transition">삭제</button>
          </form>
        </div>
      )}

      {/* replies — arrow style */}
      {replies.length > 0 && (
        <div className="mt-2 space-y-1">
          {replies.map((reply) => (
            <div key={reply.id} className="flex items-start gap-2 pl-2 text-sm">
              <span className="mt-0.5 text-foreground-muted">↳</span>
              <div className="min-w-0 flex-1">
                <span className="font-semibold text-foreground">{reply.author.displayName}</span>
                <span className="ml-1.5 text-[10px] text-foreground-muted">{formatRelative(reply.createdAt)}</span>
                {reply.status === "deleted" ? (
                  <p className="mt-0.5 text-foreground-muted">삭제된 댓글입니다.</p>
                ) : (
                  <div className="mt-0.5 text-foreground"><ProseBlock value={reply.bodyMd} muted /></div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}

/* ── Main export ── */
export function CommentThread({
  comments,
  viewer,
  projectId,
  projectSlug,
}: CommentThreadProps) {
  const [tab, setTab] = useState<"comments" | "feedback">("comments");

  const generalComments = comments.filter((c) => !c.parentId && !c.postId);
  const feedbackComments = comments.filter((c) => !c.parentId && !!c.postId);

  const generalReplies = (id: string) =>
    comments.filter((r) => r.parentId === id);

  const activeList =
    tab === "comments" ? generalComments : feedbackComments;

  return (
    <div className="space-y-3">
      {/* Tabs */}
      <div className="flex gap-1 rounded-xl border border-line bg-surface-muted p-1">
        <button
          onClick={() => setTab("comments")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
            tab === "comments"
              ? "bg-surface text-foreground shadow-sm"
              : "text-foreground-muted hover:text-foreground"
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          댓글
          <span className="rounded-full bg-surface-muted px-2 py-0.5 text-xs">
            {generalComments.length}
          </span>
        </button>
        <button
          onClick={() => setTab("feedback")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
            tab === "feedback"
              ? "bg-surface text-foreground shadow-sm"
              : "text-foreground-muted hover:text-foreground"
          }`}
        >
          <MessageCircle className="h-4 w-4" />
          피드백
          <span className="rounded-full bg-surface-muted px-2 py-0.5 text-xs">
            {feedbackComments.length}
          </span>
        </button>
      </div>

      {/* Comment form (only on comments tab) */}
      {tab === "comments" && (
        <form
          action={`/api/projects/${projectId}/comments`}
          method="post"
          className="rounded-xl border border-line bg-surface px-4 py-3"
        >
          <input
            type="hidden"
            name="redirectTo"
            value={`/p/${projectSlug}#comments`}
          />
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-foreground">댓글 남기기</span>
            <button className="rounded-lg bg-foreground px-3 py-1.5 text-xs font-semibold text-surface transition hover:opacity-90">
              등록
            </button>
          </div>
          {!viewer && (
            <input
              name="guestName"
              type="text"
              required
              placeholder="닉네임"
              className="mb-2 w-full rounded-lg border border-line bg-surface-muted px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted"
            />
          )}
          <textarea
            name="bodyMd"
            rows={2}
            required
            placeholder="사용해본 경험이나 의견을 남겨주세요."
            className="w-full rounded-lg border border-line bg-surface-muted px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted"
          />
        </form>
      )}

      {/* Feedback info (on feedback tab) */}
      {tab === "feedback" && (
        <div className="rounded-2xl border border-dashed border-line bg-surface p-5 text-sm text-foreground-muted">
          {viewer ? (
            "프로젝트 활동에 연결된 피드백 목록입니다. 답글로 의견을 남겨주세요."
          ) : (
            <div>
              피드백에 답글을 남기려면 로그인이 필요합니다.
              <Link
                href={`/auth/sign-in?next=${encodeURIComponent(`/p/${projectSlug}#comments`)}`}
                className="ml-2 font-semibold text-foreground hover:underline"
              >
                로그인
              </Link>
            </div>
          )}
        </div>
      )}

      {/* List */}
      {activeList.length === 0 ? (
        <div className="py-10 text-center text-sm text-foreground-muted">
          {tab === "comments"
            ? "아직 댓글이 없습니다. 첫 번째 댓글을 남겨보세요!"
            : "아직 피드백이 없습니다."}
        </div>
      ) : (
        activeList.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            replies={generalReplies(comment.id)}
            viewer={viewer}
            projectSlug={projectSlug}
            projectId={projectId}
          />
        ))
      )}
    </div>
  );
}
