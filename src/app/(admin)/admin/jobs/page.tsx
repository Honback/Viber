import { JobsDashboard } from "@/components/admin/jobs-dashboard";
import { PageShell } from "@/components/ui/page-shell";
import { SectionHeading } from "@/components/ui/section-heading";
import { requireAdminProfile } from "@/lib/auth/session";
import { getMaintenanceJobDefinitions } from "@/lib/jobs/maintenance-jobs";

export default async function AdminJobsPage() {
  await requireAdminProfile("/admin/jobs");
  const jobs = getMaintenanceJobDefinitions().map((job) => ({
    name: job.name,
    title: job.title,
    description: job.description,
    suggestedSchedule: job.suggestedSchedule
  }));

  return (
    <PageShell>
      <SectionHeading
        eyebrow="Admin Jobs"
        title="운영 스케줄러 작업"
        description="cron이 붙기 전에도 내부 job runner를 직접 실행하고 JSON 결과를 바로 확인할 수 있습니다."
      />

      <JobsDashboard jobs={jobs} />
    </PageShell>
  );
}
