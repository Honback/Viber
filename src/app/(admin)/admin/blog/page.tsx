import Link from "next/link";

import { FlashBanner } from "@/components/ui/flash-banner";
import { PageShell } from "@/components/ui/page-shell";
import { SectionHeading } from "@/components/ui/section-heading";
import { StatusBadge } from "@/components/ui/status-badge";
import { requireAdminProfile } from "@/lib/auth/session";
import { getAllPostsWithDrafts, type BlogPost } from "@/lib/blog/posts";

type AdminBlogPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function PostRow({ post }: { post: BlogPost }) {
  const isDraft = post.status === "draft";
  return (
    <div className="flex flex-col gap-4 rounded-[24px] border border-line bg-surface p-5 shadow-soft md:flex-row md:items-start md:justify-between">
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge
            label={isDraft ? "초안" : "공개"}
            tone={isDraft ? "warning" : "success"}
          />
          <time className="text-xs text-foreground-muted">{post.date}</time>
        </div>

        <h3 className="text-base font-bold text-foreground">
          <Link href={`/blog/${post.slug}`} className="hover:text-accent">
            {post.title}
          </Link>
        </h3>

        <p className="line-clamp-2 text-sm text-foreground-muted">
          {post.description}
        </p>

        <div className="flex flex-wrap gap-1.5">
          {post.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-surface-muted px-2.5 py-0.5 text-xs text-foreground-muted"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap gap-2">
        {isDraft ? (
          <form action="/api/admin/blog/action" method="post">
            <input type="hidden" name="slug" value={post.slug} />
            <input type="hidden" name="action" value="publish" />
            <input type="hidden" name="redirectTo" value="/admin/blog" />
            <button className="rounded-full bg-green px-4 py-2 text-sm font-semibold text-white">
              공개하기
            </button>
          </form>
        ) : (
          <form action="/api/admin/blog/action" method="post">
            <input type="hidden" name="slug" value={post.slug} />
            <input type="hidden" name="action" value="unpublish" />
            <input type="hidden" name="redirectTo" value="/admin/blog" />
            <button className="rounded-full border border-line bg-surface px-4 py-2 text-sm font-semibold text-foreground-muted">
              비공개로
            </button>
          </form>
        )}
        <form action="/api/admin/blog/action" method="post">
          <input type="hidden" name="slug" value={post.slug} />
          <input type="hidden" name="action" value="delete" />
          <input type="hidden" name="redirectTo" value="/admin/blog" />
          <button className="rounded-full border border-danger/30 bg-surface px-4 py-2 text-sm font-semibold text-danger">
            삭제
          </button>
        </form>
      </div>
    </div>
  );
}

export default async function AdminBlogPage({ searchParams }: AdminBlogPageProps) {
  await requireAdminProfile("/admin/blog");
  const params = await searchParams;
  const filterStatus = getValue(params.status);
  const allPosts = getAllPostsWithDrafts();

  const filtered = filterStatus && filterStatus !== "all"
    ? allPosts.filter((p) => p.status === filterStatus)
    : allPosts;

  const draftCount = allPosts.filter((p) => p.status === "draft").length;
  const publishedCount = allPosts.filter((p) => p.status === "published").length;

  return (
    <PageShell>
      <FlashBanner notice={getValue(params.notice)} error={getValue(params.error)} />

      <SectionHeading
        eyebrow="Admin Blog"
        title="블로그 관리"
        description="블로그 포스트의 공개/비공개 상태를 관리하고, 불필요한 글을 삭제합니다."
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-[20px] border border-line bg-surface p-4 text-center shadow-soft">
          <div className="text-2xl font-extrabold text-foreground">{allPosts.length}</div>
          <div className="mt-1 text-xs text-foreground-muted">전체</div>
        </div>
        <div className="rounded-[20px] border border-line bg-surface p-4 text-center shadow-soft">
          <div className="text-2xl font-extrabold text-green">{publishedCount}</div>
          <div className="mt-1 text-xs text-foreground-muted">공개</div>
        </div>
        <div className="rounded-[20px] border border-line bg-surface p-4 text-center shadow-soft">
          <div className="text-2xl font-extrabold text-warning">{draftCount}</div>
          <div className="mt-1 text-xs text-foreground-muted">초안 (검토 대기)</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {(["all", "draft", "published"] as const).map((s) => {
          const isActive = (filterStatus ?? "all") === s;
          const label = s === "all" ? "전체" : s === "draft" ? "초안" : "공개";
          return (
            <Link
              key={s}
              href={s === "all" ? "/admin/blog" : `/admin/blog?status=${s}`}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                isActive
                  ? "bg-foreground text-background"
                  : "border border-line bg-surface text-foreground-muted hover:text-foreground"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </div>

      {/* Post List */}
      <div className="space-y-4">
        {filtered.map((post) => (
          <PostRow key={post.slug} post={post} />
        ))}

        {filtered.length === 0 && (
          <div className="rounded-[24px] border border-dashed border-line px-6 py-12 text-center text-foreground-muted">
            {filterStatus === "draft"
              ? "검토 대기 중인 초안이 없습니다."
              : "표시할 포스트가 없습니다."}
          </div>
        )}
      </div>
    </PageShell>
  );
}
