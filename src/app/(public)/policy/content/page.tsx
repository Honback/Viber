import type { Metadata } from "next";

import { PageShell } from "@/components/ui/page-shell";
import { SectionHeading } from "@/components/ui/section-heading";
import { getPolicyParagraphs } from "@/lib/services/mutations";

export const metadata: Metadata = {
  title: "콘텐츠 정책",
  description: "Viber 프로젝트 쇼케이스 플랫폼의 콘텐츠 운영 기준과 정책을 안내합니다.",
  alternates: { canonical: "/policy/content" },
};

export default function ContentPolicyPage() {
  const policy = getPolicyParagraphs().content;

  return (
    <PageShell>
      <SectionHeading eyebrow="정책" title={policy.title} description="프로젝트 중심 쇼케이스를 유지하기 위한 최소 운영 기준입니다." />
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
