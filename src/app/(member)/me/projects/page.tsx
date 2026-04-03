import Link from "next/link";

import { EmptyState } from "@/components/ui/empty-state";
import { FlashBanner } from "@/components/ui/flash-banner";
import { PageShell } from "@/components/ui/page-shell";
import { SectionHeading } from "@/components/ui/section-heading";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  categoryOptions,
  domainVerificationStatusLabels,
  platformOptions,
  pricingOptions,
  projectStatusLabels,
  stageOptions,
  verificationLabels
} from "@/lib/constants";
import { requireCurrentProfile } from "@/lib/auth/session";
import { projectMediaAccept, projectMediaMaxFileSizeLabel } from "@/lib/storage/project-media";
import { getOwnedProjectManagementData } from "@/lib/services/read-models";

type MyProjectsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getStatusTone(status: string) {
  if (status === "published") return "success" as const;
  if (status === "limited") return "warning" as const;
  if (status === "archived") return "danger" as const;
  if (status === "pending") return "warning" as const;
  return "default" as const;
}

function getStatusGuide(status: string) {
  if (status === "pending") {
    return "소유권 연결이 끝나지 않았거나 자동 보호 hold 상태입니다. claim 또는 운영 안내를 먼저 확인하세요.";
  }

  if (status === "limited") {
    return "제한 공개 상태입니다. 상세 접근은 가능하지만 홈 추천과 트렌딩에서는 제외됩니다.";
  }

  if (status === "archived") {
    return "보관 상태입니다. 다시 노출하고 싶다면 업데이트와 운영 상태를 함께 점검하는 편이 좋습니다.";
  }

  if (status === "rejected") {
    return "반려 상태입니다. 링크와 설명을 정리한 뒤 다시 요청하거나 운영 기준을 확인하세요.";
  }

  if (status === "hidden") {
    return "비공개 상태입니다. 일반 사용자는 접근할 수 없고, owner와 admin만 확인할 수 있습니다.";
  }

  return "공개 중입니다. 수정 후에는 바로 상세 페이지와 탐색 결과에 반영됩니다.";
}

function getVerificationTone(status: string) {
  if (status === "domain_verified" || status === "github_verified") return "success" as const;
  return "default" as const;
}

function getDomainVerificationTone(status: string | null) {
  if (status === "verified") return "success" as const;
  if (status === "failed" || status === "revoked") return "danger" as const;
  if (status === "pending") return "warning" as const;
  return "default" as const;
}

export default async function MyProjectsPage({ searchParams }: MyProjectsPageProps) {
  const viewer = await requireCurrentProfile("/me/projects");
  const params = await searchParams;
  const projects = await getOwnedProjectManagementData(viewer.id);

  return (
    <PageShell>
      <FlashBanner notice={getValue(params.notice)} error={getValue(params.error)} />

      <SectionHeading
        eyebrow="My Projects"
        title="내 프로젝트"
        description="상태 확인, 기본 정보 수정, 새 활동 추가를 이 화면에서 바로 이어갈 수 있게 정리했습니다."
        action={
          <Link href="/submit" className="rounded-full bg-[#111827] px-4 py-2 text-sm font-semibold text-white">
            새 프로젝트 제출
          </Link>
        }
      />

      {projects.length ? (
        <div className="grid gap-6">
          {projects.map((project) => (
            <section
              key={project.id}
              className="grid gap-5 rounded-[32px] border border-line bg-[rgba(255,253,248,0.96)] p-6 shadow-soft"
            >
              <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge label={projectStatusLabels[project.status]} tone={getStatusTone(project.status)} />
                    {project.claimPending ? <StatusBadge label="소유권 연결 대기" tone="warning" /> : null}
                    {project.linkHealth ? <StatusBadge label={project.linkHealth.label} tone={project.linkHealth.status === "broken" ? "danger" : "default"} /> : null}
                    <span className="text-sm text-foreground-muted">{project.latestActivityTitle ?? "활동 없음"}</span>
                  </div>

                  <div>
                    <h2 className="text-2xl font-extrabold tracking-tight text-foreground">{project.title}</h2>
                    <p className="mt-2 text-sm leading-7 text-foreground-muted">{project.shortDescription}</p>
                  </div>

                  <div className="rounded-[28px] border border-line bg-white px-5 py-4 text-sm leading-7 text-foreground-muted">
                    {getStatusGuide(project.status)}
                    {project.linkHealth?.note ? <div className="mt-2">{project.linkHealth.note}</div> : null}
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Link
                      href={`/p/${project.slug}`}
                      className="rounded-full border border-line bg-white px-4 py-2.5 text-sm font-semibold text-foreground"
                    >
                      공개 페이지 보기
                    </Link>
                    <a
                      href={`#compose-${project.id}`}
                      className="rounded-full border border-line bg-white px-4 py-2.5 text-sm font-semibold text-foreground"
                    >
                      새 활동 쓰기
                    </a>
                    <a
                      href={`#edit-${project.id}`}
                      className="rounded-full border border-line bg-white px-4 py-2.5 text-sm font-semibold text-foreground"
                    >
                      프로젝트 수정
                    </a>
                  </div>
                </div>

                  <div className="grid gap-3 rounded-[28px] border border-line bg-white p-5 text-sm text-foreground">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-foreground-muted">검증 배지</span>
                    <StatusBadge label={verificationLabels[project.verificationState]} tone={getVerificationTone(project.verificationState)} />
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-foreground-muted">라이브 URL</span>
                    <a href={project.liveUrl} target="_blank" rel="noreferrer" className="max-w-[60%] truncate font-semibold">
                      {project.liveUrl}
                    </a>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-foreground-muted">GitHub</span>
                    <span className="max-w-[60%] truncate font-semibold">{project.githubUrl ?? "없음"}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-foreground-muted">플랫폼 / 상태</span>
                    <span className="font-semibold">
                      {project.platform} / {project.stage}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-foreground-muted">가격 모델</span>
                    <span className="font-semibold">{project.pricingModel}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-foreground-muted">태그</span>
                    <span className="max-w-[60%] truncate font-semibold">{project.tagsCsv || "없음"}</span>
                  </div>
                </div>
              </div>

              <details className="rounded-[28px] border border-line bg-white p-5">
                <summary className="cursor-pointer text-lg font-bold tracking-tight text-foreground">도메인 확인</summary>
                <div className="mt-5 grid gap-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge
                      label={
                        project.domainVerification.status
                          ? domainVerificationStatusLabels[project.domainVerification.status]
                          : "토큰 없음"
                      }
                      tone={getDomainVerificationTone(project.domainVerification.status)}
                    />
                    {project.domainVerification.registrableDomain ? (
                      <span className="text-sm text-foreground-muted">{project.domainVerification.registrableDomain}</span>
                    ) : null}
                  </div>

                  {project.domainVerification.eligible ? (
                    <>
                      <div className="rounded-[24px] border border-line bg-[rgba(255,253,248,0.96)] p-4 text-sm text-foreground">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-foreground-muted">대상 호스트</span>
                          <span className="font-semibold">{project.domainVerification.hostname}</span>
                        </div>
                        <div className="mt-3 flex items-center justify-between gap-3">
                          <span className="text-foreground-muted">TXT 레코드 이름</span>
                          <code className="max-w-[65%] truncate rounded-xl bg-white px-3 py-2 text-xs font-semibold">{project.domainVerification.recordName}</code>
                        </div>
                        <div className="mt-3">
                          <div className="text-foreground-muted">TXT 레코드 값</div>
                          <code className="mt-2 block overflow-x-auto rounded-2xl bg-white px-4 py-3 text-xs font-semibold">
                            {project.domainVerification.token ?? "먼저 토큰 발급 버튼을 눌러 주세요."}
                          </code>
                        </div>
                      </div>

                      {project.domainVerification.lastError ? (
                        <div className="rounded-[24px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                          {project.domainVerification.lastError}
                        </div>
                      ) : null}

                      <div className="flex flex-wrap gap-3">
                        <form action={`/api/projects/${project.id}/domain-verification/issue`} method="post">
                          <input type="hidden" name="redirectTo" value="/me/projects" />
                          <button className="rounded-full border border-line bg-white px-4 py-2.5 text-sm font-semibold text-foreground">
                            {project.domainVerification.token ? "토큰 다시 발급" : "토큰 발급"}
                          </button>
                        </form>
                        <form action={`/api/projects/${project.id}/domain-verification/verify`} method="post">
                          <input type="hidden" name="redirectTo" value="/me/projects" />
                          <button className="rounded-full bg-[#111827] px-4 py-2.5 text-sm font-semibold text-white">
                            지금 검증하기
                          </button>
                        </form>
                      </div>

                      <div className="text-sm leading-7 text-foreground-muted">
                        DNS에 TXT 레코드를 추가한 뒤 검증 버튼을 누르면 `domain_verified` 배지로 바뀝니다.
                        {project.domainVerification.verifiedAt ? (
                          <div className="mt-1">최근 완료 시각: {project.domainVerification.verifiedAt.toLocaleString("ko-KR")}</div>
                        ) : null}
                        {project.domainVerification.lastCheckedAt ? (
                          <div className="mt-1">최근 확인 시각: {project.domainVerification.lastCheckedAt.toLocaleString("ko-KR")}</div>
                        ) : null}
                      </div>
                    </>
                  ) : (
                    <div className="rounded-[24px] border border-dashed border-line bg-[rgba(255,253,248,0.96)] px-4 py-3 text-sm text-foreground-muted">
                      {project.domainVerification.reason ?? "현재 라이브 URL은 도메인 확인 대상이 아닙니다."}
                    </div>
                  )}
                </div>
              </details>

              <details id={`edit-${project.id}`} className="rounded-[28px] border border-line bg-white p-5">
                <summary className="cursor-pointer text-lg font-bold tracking-tight text-foreground">프로젝트 정보 수정</summary>
                <form action={`/api/projects/${project.id}`} method="post" encType="multipart/form-data" className="mt-5 grid gap-4">
                  <input type="hidden" name="redirectTo" value="/me/projects" />

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="grid gap-2 text-sm font-semibold text-foreground">
                      프로젝트 이름
                      <input name="title" required defaultValue={project.title} className="rounded-2xl border border-line bg-white px-4 py-3 font-normal" />
                    </label>
                    <label className="grid gap-2 text-sm font-semibold text-foreground">
                      메이커 별칭
                      <input name="makerAlias" required defaultValue={project.makerAlias} className="rounded-2xl border border-line bg-white px-4 py-3 font-normal" />
                    </label>
                  </div>

                  <label className="grid gap-2 text-sm font-semibold text-foreground">
                    한 줄 소개
                    <input name="tagline" required defaultValue={project.tagline} className="rounded-2xl border border-line bg-white px-4 py-3 font-normal" />
                  </label>

                  <label className="grid gap-2 text-sm font-semibold text-foreground">
                    짧은 설명
                    <textarea name="shortDescription" rows={3} required defaultValue={project.shortDescription} className="rounded-3xl border border-line bg-white px-4 py-3 font-normal" />
                  </label>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="grid gap-2 text-sm font-semibold text-foreground md:col-span-2">
                      Live URL
                      <input type="url" name="liveUrl" required defaultValue={project.liveUrl} className="rounded-2xl border border-line bg-white px-4 py-3 font-normal" />
                    </label>
                    <label className="grid gap-2 text-sm font-semibold text-foreground">
                      GitHub URL
                      <input type="url" name="githubUrl" defaultValue={project.githubUrl ?? ""} className="rounded-2xl border border-line bg-white px-4 py-3 font-normal" />
                    </label>
                    <label className="grid gap-2 text-sm font-semibold text-foreground">
                      Demo URL
                      <input type="url" name="demoUrl" defaultValue={project.demoUrl ?? ""} className="rounded-2xl border border-line bg-white px-4 py-3 font-normal" />
                    </label>
                    <label className="grid gap-2 text-sm font-semibold text-foreground">
                      Docs URL
                      <input type="url" name="docsUrl" defaultValue={project.docsUrl ?? ""} className="rounded-2xl border border-line bg-white px-4 py-3 font-normal" />
                    </label>
                    <label className="grid gap-2 text-sm font-semibold text-foreground">
                      가격 메모
                      <input name="pricingNote" defaultValue={project.pricingNote ?? ""} className="rounded-2xl border border-line bg-white px-4 py-3 font-normal" />
                    </label>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="grid gap-2 text-sm font-semibold text-foreground">
                      카테고리
                      <select name="category" defaultValue={project.category} className="rounded-2xl border border-line bg-white px-4 py-3 font-normal">
                        {categoryOptions.map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="grid gap-2 text-sm font-semibold text-foreground">
                      플랫폼
                      <select name="platform" defaultValue={project.platform} className="rounded-2xl border border-line bg-white px-4 py-3 font-normal">
                        {platformOptions.map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="grid gap-2 text-sm font-semibold text-foreground">
                      상태
                      <select name="stage" defaultValue={project.stage} className="rounded-2xl border border-line bg-white px-4 py-3 font-normal">
                        {stageOptions.map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="grid gap-2 text-sm font-semibold text-foreground">
                      가격 모델
                      <select name="pricingModel" defaultValue={project.pricingModel} className="rounded-2xl border border-line bg-white px-4 py-3 font-normal">
                        {pricingOptions.map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <label className="grid gap-2 text-sm font-semibold text-foreground">
                    무엇인지
                    <textarea name="overviewMd" rows={4} required defaultValue={project.overviewMd} className="rounded-3xl border border-line bg-white px-4 py-3 font-normal" />
                  </label>
                  <label className="grid gap-2 text-sm font-semibold text-foreground">
                    어떤 문제를 푸는지
                    <textarea name="problemMd" rows={4} required defaultValue={project.problemMd} className="rounded-3xl border border-line bg-white px-4 py-3 font-normal" />
                  </label>
                  <label className="grid gap-2 text-sm font-semibold text-foreground">
                    누구를 위한 것인지
                    <textarea name="targetUsersMd" rows={4} required defaultValue={project.targetUsersMd} className="rounded-3xl border border-line bg-white px-4 py-3 font-normal" />
                  </label>
                  <label className="grid gap-2 text-sm font-semibold text-foreground">
                    왜 만들었는지
                    <textarea name="whyMadeMd" rows={4} defaultValue={project.whyMadeMd ?? ""} className="rounded-3xl border border-line bg-white px-4 py-3 font-normal" />
                  </label>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="grid gap-2 text-sm font-semibold text-foreground">
                      대표 이미지 파일
                      <input type="file" name="coverImageFile" accept={projectMediaAccept} className="rounded-2xl border border-line bg-white px-4 py-3 font-normal" />
                      <span className="text-xs font-normal text-foreground-muted">JPG, PNG, WEBP, GIF · 최대 {projectMediaMaxFileSizeLabel}</span>
                    </label>
                    <label className="grid gap-2 text-sm font-semibold text-foreground">
                      갤러리 이미지 파일들
                      <input type="file" name="galleryFiles" accept={projectMediaAccept} multiple className="rounded-2xl border border-line bg-white px-4 py-3 font-normal" />
                      <span className="text-xs font-normal text-foreground-muted">새 파일을 올리면 기존 갤러리 URL 입력값 대신 사용합니다.</span>
                    </label>
                    <label className="grid gap-2 text-sm font-semibold text-foreground">
                      대표 이미지 URL
                      <input name="coverImageUrl" defaultValue={project.coverImageUrl} className="rounded-2xl border border-line bg-white px-4 py-3 font-normal" />
                    </label>
                    <label className="grid gap-2 text-sm font-semibold text-foreground">
                      갤러리 이미지 URL들
                      <input name="galleryCsv" defaultValue={project.galleryCsv} className="rounded-2xl border border-line bg-white px-4 py-3 font-normal" />
                    </label>
                    <label className="grid gap-2 text-sm font-semibold text-foreground">
                      태그
                      <input name="tagCsv" defaultValue={project.tagsCsv} className="rounded-2xl border border-line bg-white px-4 py-3 font-normal" />
                    </label>
                    <label className="grid gap-2 text-sm font-semibold text-foreground">
                      사용한 AI 도구
                      <input name="aiToolsCsv" defaultValue={project.aiToolsCsv} className="rounded-2xl border border-line bg-white px-4 py-3 font-normal" />
                    </label>
                  </div>

                  <div className="flex flex-wrap gap-4 rounded-3xl border border-line bg-surface px-4 py-4 text-sm text-foreground">
                    <label className="inline-flex items-center gap-2">
                      <input type="checkbox" name="isOpenSource" defaultChecked={project.isOpenSource} />
                      오픈소스
                    </label>
                    <label className="inline-flex items-center gap-2">
                      <input type="checkbox" name="noSignupRequired" defaultChecked={project.noSignupRequired} />
                      가입 없이 체험 가능
                    </label>
                    <label className="inline-flex items-center gap-2">
                      <input type="checkbox" name="isSoloMaker" defaultChecked={project.isSoloMaker} />
                      1인 메이커
                    </label>
                  </div>

                  <button className="w-fit rounded-full bg-[#111827] px-4 py-2.5 text-sm font-semibold text-white">
                    프로젝트 저장
                  </button>
                </form>
              </details>

              <details id={`compose-${project.id}`} className="rounded-[28px] border border-line bg-white p-5">
                <summary className="cursor-pointer text-lg font-bold tracking-tight text-foreground">업데이트 또는 피드백 요청 추가</summary>
                <form action={`/api/projects/${project.id}/posts`} method="post" encType="multipart/form-data" className="mt-5 grid gap-3">
                  <label className="grid gap-2 text-sm font-semibold text-foreground">
                    활동 유형
                    <select name="kind" className="rounded-2xl border border-line bg-white px-4 py-3 font-normal">
                      <option value="update">업데이트</option>
                      <option value="feedback">피드백 요청</option>
                    </select>
                  </label>
                  <label className="grid gap-2 text-sm font-semibold text-foreground">
                    제목
                    <input name="title" required className="rounded-2xl border border-line bg-white px-4 py-3 font-normal" />
                  </label>
                  <label className="grid gap-2 text-sm font-semibold text-foreground">
                    요약
                    <input name="summary" required className="rounded-2xl border border-line bg-white px-4 py-3 font-normal" />
                  </label>
                  <label className="grid gap-2 text-sm font-semibold text-foreground">
                    본문
                    <textarea name="bodyMd" rows={4} required className="rounded-3xl border border-line bg-white px-4 py-3 font-normal" />
                  </label>
                  <label className="grid gap-2 text-sm font-semibold text-foreground">
                    원하는 피드백
                    <textarea name="requestedFeedbackMd" rows={3} className="rounded-3xl border border-line bg-white px-4 py-3 font-normal" />
                  </label>
                  <label className="grid gap-2 text-sm font-semibold text-foreground">
                    첨부 미디어 URL들
                    <input name="mediaCsv" className="rounded-2xl border border-line bg-white px-4 py-3 font-normal" placeholder="쉼표로 구분" />
                  </label>
                  <label className="grid gap-2 text-sm font-semibold text-foreground">
                    첨부 이미지 파일들
                    <input type="file" name="mediaFiles" accept={projectMediaAccept} multiple className="rounded-2xl border border-line bg-white px-4 py-3 font-normal" />
                    <span className="text-xs font-normal text-foreground-muted">최대 5개 · JPG, PNG, WEBP, GIF · 최대 {projectMediaMaxFileSizeLabel}</span>
                  </label>
                  <button className="w-fit rounded-full bg-[#111827] px-4 py-2.5 text-sm font-semibold text-white">활동 저장</button>
                </form>
              </details>
            </section>
          ))}
        </div>
      ) : (
        <EmptyState
          title="소유한 프로젝트가 없습니다."
          description="신규 프로젝트를 제출하거나 claim 링크로 소유권을 연결하면 여기에서 관리할 수 있습니다."
          action={
            <Link href="/submit" className="mx-auto rounded-full bg-[#111827] px-5 py-2.5 text-sm font-semibold text-white">
              프로젝트 제출
            </Link>
          }
        />
      )}
    </PageShell>
  );
}
