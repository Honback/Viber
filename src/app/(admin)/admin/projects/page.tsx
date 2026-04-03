import Link from "next/link";

import { FlashBanner } from "@/components/ui/flash-banner";
import { PageShell } from "@/components/ui/page-shell";
import { SectionHeading } from "@/components/ui/section-heading";
import { StatusBadge } from "@/components/ui/status-badge";
import { domainVerificationStatusLabels, projectStatusLabels, verificationLabels } from "@/lib/constants";
import { requireAdminProfile } from "@/lib/auth/session";
import { getAdminProjectListData } from "@/lib/services/read-models";

type AdminProjectsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getTone(status: string) {
  if (status === "published") return "success" as const;
  if (status === "limited" || status === "pending") return "warning" as const;
  if (status === "archived" || status === "rejected" || status === "hidden") return "danger" as const;
  return "default" as const;
}

function ModerationButton({
  targetId,
  action,
  label
}: {
  targetId: string;
  action: string;
  label: string;
}) {
  return (
    <form action="/api/admin/moderation/action" method="post">
      <input type="hidden" name="targetType" value="project" />
      <input type="hidden" name="targetId" value={targetId} />
      <input type="hidden" name="action" value={action} />
      <input type="hidden" name="redirectTo" value="/admin/projects" />
      <button className="rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-foreground">{label}</button>
    </form>
  );
}

export default async function AdminProjectsPage({ searchParams }: AdminProjectsPageProps) {
  await requireAdminProfile("/admin/projects");
  const params = await searchParams;
  const filters = {
    query: getValue(params.query),
    status: getValue(params.status),
    verification: getValue(params.verification),
    link: getValue(params.link)
  };
  const projects = await getAdminProjectListData(filters);

  return (
    <PageShell>
      <FlashBanner notice={getValue(params.notice)} error={getValue(params.error)} />

      <SectionHeading
        eyebrow="Admin Projects"
        title="전체 프로젝트 관리"
        description="프로젝트 상태, 검증 상태, 링크 상태, 중복 후보를 한 화면에서 확인하고 운영 조치를 적용합니다."
      />

      <form className="grid gap-3 rounded-[28px] border border-line bg-white/90 p-5 shadow-soft lg:grid-cols-5">
        <input
          name="query"
          defaultValue={filters.query ?? ""}
          placeholder="제목, slug, 메이커, URL 검색"
          className="rounded-2xl border border-line bg-white px-4 py-3 text-sm text-foreground lg:col-span-2"
        />
        <select name="status" defaultValue={filters.status ?? "all"} className="rounded-2xl border border-line bg-white px-4 py-3 text-sm text-foreground">
          <option value="all">모든 상태</option>
          <option value="pending">pending</option>
          <option value="published">published</option>
          <option value="limited">limited</option>
          <option value="hidden">hidden</option>
          <option value="rejected">rejected</option>
          <option value="archived">archived</option>
        </select>
        <select
          name="verification"
          defaultValue={filters.verification ?? "all"}
          className="rounded-2xl border border-line bg-white px-4 py-3 text-sm text-foreground"
        >
          <option value="all">모든 검증</option>
          <option value="unverified">unverified</option>
          <option value="github_verified">github_verified</option>
          <option value="domain_verified">domain_verified</option>
        </select>
        <div className="flex gap-3">
          <select name="link" defaultValue={filters.link ?? "all"} className="min-w-0 flex-1 rounded-2xl border border-line bg-white px-4 py-3 text-sm text-foreground">
            <option value="all">모든 링크</option>
            <option value="unknown">unknown</option>
            <option value="healthy">healthy</option>
            <option value="degraded">degraded</option>
            <option value="broken">broken</option>
          </select>
          <button className="rounded-full bg-[#111827] px-5 py-3 text-sm font-semibold text-white">검색</button>
        </div>
      </form>

      <div className="text-sm text-foreground-muted">총 {projects.length}개 프로젝트</div>

      <div className="grid gap-4">
        {projects.map((project) => (
          <article key={project.id} className="rounded-[28px] border border-line bg-white/90 p-5 shadow-soft">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <StatusBadge label={projectStatusLabels[project.status]} tone={getTone(project.status)} />
                  <StatusBadge label={verificationLabels[project.verificationState]} tone="default" />
                  {project.domainVerification.status ? (
                    <StatusBadge label={`DNS ${domainVerificationStatusLabels[project.domainVerification.status]}`} tone={project.domainVerification.status === "verified" ? "success" : project.domainVerification.status === "pending" ? "warning" : "danger"} />
                  ) : null}
                  {project.linkHealth ? <StatusBadge label={project.linkHealth.label} tone={project.linkHealth.status === "broken" ? "danger" : "default"} /> : null}
                  {project.claimPending ? <StatusBadge label="claim 대기" tone="warning" /> : null}
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-foreground">{project.title}</h2>
                  <p className="mt-1 text-sm leading-7 text-foreground-muted">{project.shortDescription}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link href={`/p/${project.slug}`} className="rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-foreground">
                  상세 보기
                </Link>
                <Link href="/admin/feature" className="rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-foreground">
                  피처드 편성
                </Link>
              </div>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="grid gap-3 rounded-[24px] border border-line bg-[rgba(255,253,248,0.96)] p-4 text-sm text-foreground">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-foreground-muted">slug</span>
                  <span className="font-semibold">{project.slug}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-foreground-muted">정규화 라이브 URL</span>
                  <span className="max-w-[65%] truncate font-semibold">{project.liveUrlNormalized}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-foreground-muted">정규화 GitHub URL</span>
                  <span className="max-w-[65%] truncate font-semibold">{project.githubUrlNormalized ?? "없음"}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-foreground-muted">owner</span>
                  <span className="font-semibold">
                    {project.ownersSummary.claimed}/{project.ownersSummary.total} 연결됨 · {project.ownersSummary.primaryMethod ?? "없음"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-foreground-muted">도메인 확인</span>
                  <span className="max-w-[65%] truncate font-semibold">
                    {project.domainVerification.registrableDomain
                      ? `${project.domainVerification.registrableDomain} / ${project.domainVerification.status ?? "토큰 없음"}`
                      : "없음"}
                  </span>
                </div>
                {project.linkHealth?.note ? (
                  <div className="rounded-2xl border border-line bg-white px-4 py-3 text-sm text-foreground-muted">{project.linkHealth.note}</div>
                ) : null}
                {project.domainVerification.lastError ? (
                  <div className="rounded-2xl border border-line bg-white px-4 py-3 text-sm text-foreground-muted">{project.domainVerification.lastError}</div>
                ) : null}
              </div>

              <div className="grid gap-3 rounded-[24px] border border-line bg-[rgba(255,253,248,0.96)] p-4">
                <div className="text-sm font-semibold text-foreground">중복 후보</div>
                {project.duplicateCandidates.length ? (
                  <div className="grid gap-2">
                    {project.duplicateCandidates.map((candidate) => (
                      <div key={candidate.id} className="rounded-2xl border border-line bg-white px-4 py-3 text-sm">
                        <div className="font-semibold text-foreground">{candidate.title}</div>
                        <div className="mt-1 text-foreground-muted">
                          {candidate.reason} · {candidate.status}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-line bg-white px-4 py-3 text-sm text-foreground-muted">
                    현재 규칙에서 잡힌 중복 후보가 없습니다.
                  </div>
                )}
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {project.status !== "published" ? <ModerationButton targetId={project.id} action="publish" label="공개" /> : null}
              {project.status !== "limited" ? <ModerationButton targetId={project.id} action="limit" label="제한" /> : null}
              {project.status !== "hidden" ? <ModerationButton targetId={project.id} action="hide" label="숨김" /> : null}
              {project.status !== "archived" ? <ModerationButton targetId={project.id} action="archive" label="보관" /> : null}
              {(project.status === "limited" || project.status === "hidden" || project.status === "archived") ? (
                <ModerationButton targetId={project.id} action="restore" label="복구" />
              ) : null}
              {project.status !== "rejected" ? <ModerationButton targetId={project.id} action="reject" label="반려" /> : null}
            </div>
          </article>
        ))}
      </div>
    </PageShell>
  );
}
