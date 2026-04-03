import type { Metadata } from "next";

import { PageShell } from "@/components/ui/page-shell";
import { SectionHeading } from "@/components/ui/section-heading";
import { getPolicyParagraphs } from "@/lib/services/mutations";

export const metadata: Metadata = {
  title: "개인정보처리방침",
  description: "Viber 플랫폼의 개인정보 수집, 이용, 보관에 관한 정책을 안내합니다.",
  alternates: { canonical: "/policy/privacy" },
};

export default function PrivacyPolicyPage() {
  const policy = getPolicyParagraphs().privacy;

  return (
    <PageShell>
      <SectionHeading eyebrow="개인정보" title={policy.title} description="현재 로컬 검증 환경과 실제 상용 전환 시 분리되는 항목을 안내합니다." />
      <div className="rounded-[32px] border border-line bg-white/90 p-6 shadow-soft">
        <div className="space-y-4 text-sm leading-7 text-foreground-muted md:text-base">
          {policy.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
