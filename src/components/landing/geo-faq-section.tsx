import Link from "next/link";
import type { SerializedHomepageData } from "./types";

type FaqItem = {
  question: string;
  answer: string;
};

function buildFaqItems(data: SerializedHomepageData): FaqItem[] {
  const totalProjects =
    data.featured.length + data.launches.length + data.feedback.length + data.updates.length;

  const topTags = data.tags.slice(0, 5).map((t) => t.name);

  const topProject = data.featured[0];

  const items: FaqItem[] = [
    {
      question: "Viber는 어떤 플랫폼인가요?",
      answer:
        "Viber는 바이브 코딩(Vibe Coding)으로 만든 프로젝트를 공유하고, 커뮤니티의 피드백과 평가를 받을 수 있는 쇼케이스 플랫폼입니다. 누구나 무료로 프로젝트를 등록하고 즉시 노출할 수 있습니다.",
    },
    {
      question: "바이브 코딩이란 무엇인가요?",
      answer:
        "바이브 코딩(Vibe Coding)은 AI 도구를 활용하여 자연어로 소프트웨어를 개발하는 새로운 프로그래밍 방식입니다. 전통적인 코딩 지식 없이도 아이디어를 빠르게 프로토타입하고 실제 서비스로 만들 수 있습니다.",
    },
  ];

  if (totalProjects > 0) {
    items.push({
      question: `현재 Viber에 등록된 프로젝트는 몇 개인가요?`,
      answer: `현재 Viber에는 ${totalProjects}개 이상의 바이브 코딩 프로젝트가 등록되어 있으며, 매일 새로운 프로젝트가 추가되고 있습니다.`,
    });
  }

  if (topTags.length > 0) {
    items.push({
      question: "가장 인기 있는 프로젝트 카테고리는 무엇인가요?",
      answer: `현재 Viber에서 가장 활발한 태그는 ${topTags.join(", ")} 등이 있습니다. 다양한 분야의 바이브 코딩 프로젝트를 탐색할 수 있습니다.`,
    });
  }

  if (topProject) {
    items.push({
      question: "지금 가장 주목받는 프로젝트는 무엇인가요?",
      answer: `현재 트렌딩 1위는 "${topProject.title}"입니다. ${topProject.tagline} — 커뮤니티에서 ${topProject.metrics.saves}회 저장, ${topProject.metrics.comments}개의 피드백을 받고 있습니다.`,
    });
  }

  items.push(
    {
      question: "프로젝트를 등록하려면 비용이 드나요?",
      answer:
        "아니요, Viber에 프로젝트를 등록하는 것은 완전히 무료입니다. 계정을 만들고 프로젝트 정보를 입력하면 즉시 커뮤니티에 공개됩니다.",
    },
    {
      question: "Viber에서 피드백은 어떻게 받을 수 있나요?",
      answer:
        "등록된 프로젝트에 커뮤니티 멤버들이 댓글과 평가를 남길 수 있습니다. 트렌딩 랭킹은 저장 수, 클릭 수, 피드백 활동을 종합하여 실시간으로 계산됩니다.",
    },
  );

  return items;
}

export function GeoFaqSection({ data }: { data: SerializedHomepageData }) {
  const faqs = buildFaqItems(data);

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <section className="mx-auto max-w-[1180px] px-4 py-16 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground">자주 묻는 질문</h2>
        <p className="mt-2 text-sm text-foreground-muted">
          Viber와 바이브 코딩에 대해 궁금한 점을 확인하세요
        </p>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {faqs.map((faq, i) => (
          <div
            key={i}
            className="rounded-2xl border border-line bg-surface p-6"
          >
            <h3 className="text-base font-bold text-foreground">
              {faq.question}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-foreground-muted">
              {faq.answer}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline"
        >
          프로젝트 둘러보기 →
        </Link>
      </div>
    </section>
  );
}
