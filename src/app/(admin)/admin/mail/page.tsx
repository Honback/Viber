import Link from "next/link";

import { PageShell } from "@/components/ui/page-shell";
import { SectionHeading } from "@/components/ui/section-heading";
import { StatusBadge } from "@/components/ui/status-badge";
import { requireAdminProfile } from "@/lib/auth/session";
import { getAdminEmailDeliveries } from "@/lib/services/read-models";
import { formatRelative } from "@/lib/utils/date";

function getTone(status: string) {
  if (status === "sent") return "success" as const;
  if (status === "simulated") return "info" as const;
  if (status === "failed") return "danger" as const;
  return "warning" as const;
}

function getLabel(status: string) {
  if (status === "sent") return "전송 완료";
  if (status === "simulated") return "로컬 저장";
  if (status === "failed") return "전송 실패";
  return "대기";
}

export default async function AdminMailPage() {
  await requireAdminProfile("/admin/mail");
  const deliveries = await getAdminEmailDeliveries();

  return (
    <PageShell>
      <SectionHeading
        eyebrow="Admin Mail"
        title="메일 기록"
        description="claim, 댓글 알림, 운영 상태 변경 메일의 최근 발송 기록을 확인합니다. 로컬에서는 simulate 모드로 저장된 메일도 여기에서 확인할 수 있습니다."
      />

      <div className="grid gap-4">
        {deliveries.length ? (
          deliveries.map((delivery) => {
            const actionUrl = typeof delivery.metadata.actionUrl === "string" ? delivery.metadata.actionUrl : null;

            return (
              <article key={delivery.id} className="rounded-[28px] border border-line bg-white/90 p-5 shadow-soft">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      <StatusBadge label={getLabel(delivery.status)} tone={getTone(delivery.status)} />
                      <StatusBadge label={delivery.template} tone="default" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold tracking-tight text-foreground">{delivery.subject}</h2>
                      <p className="mt-1 text-sm leading-7 text-foreground-muted">
                        수신자 {delivery.recipient} · 발신자 {delivery.fromEmail}
                      </p>
                    </div>
                  </div>

                  <div className="text-sm text-foreground-muted">
                    {delivery.sentAt ? `보냄 ${formatRelative(delivery.sentAt)}` : `생성 ${formatRelative(delivery.createdAt)}`}
                  </div>
                </div>

                {delivery.error ? (
                  <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{delivery.error}</div>
                ) : null}

                <pre className="mt-4 overflow-x-auto rounded-2xl border border-line bg-[rgba(255,253,248,0.96)] p-4 text-xs leading-6 text-foreground">
                  {delivery.textBody}
                </pre>

                {actionUrl ? (
                  <div className="mt-4">
                    <Link href={actionUrl} className="inline-flex rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-foreground">
                      메일 링크 열기
                    </Link>
                  </div>
                ) : null}
              </article>
            );
          })
        ) : (
          <div className="rounded-[28px] border border-dashed border-line bg-white/80 px-5 py-8 text-sm text-foreground-muted">
            아직 기록된 메일이 없습니다.
          </div>
        )}
      </div>
    </PageShell>
  );
}
