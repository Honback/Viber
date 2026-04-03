import type { PricingModel, ProjectPlatform, ProjectStage, ProjectStatus, VerificationState } from "@/db/schema";

export const categoryOptions = [
  { value: "productivity", label: "생산성" },
  { value: "creator", label: "크리에이터 도구" },
  { value: "health", label: "헬스케어" },
  { value: "developer-tools", label: "개발 도구" },
  { value: "education", label: "교육" }
] as const;

export const categoryLabels = Object.fromEntries(categoryOptions.map((item) => [item.value, item.label])) as Record<string, string>;

export const platformOptions: { value: ProjectPlatform; label: string }[] = [
  { value: "web", label: "웹" },
  { value: "mobile", label: "모바일" },
  { value: "desktop", label: "데스크톱" }
];

export const stageOptions: { value: ProjectStage; label: string }[] = [
  { value: "alpha", label: "알파" },
  { value: "beta", label: "베타" },
  { value: "live", label: "운영 중" }
];

export const stageLabels = Object.fromEntries(stageOptions.map((item) => [item.value, item.label])) as Record<ProjectStage, string>;

export const pricingOptions: { value: PricingModel; label: string }[] = [
  { value: "free", label: "무료" },
  { value: "freemium", label: "부분 유료" },
  { value: "paid", label: "유료" },
  { value: "custom", label: "문의" }
];

export const pricingLabels = Object.fromEntries(pricingOptions.map((item) => [item.value, item.label])) as Record<PricingModel, string>;

export const platformLabels = Object.fromEntries(platformOptions.map((item) => [item.value, item.label])) as Record<ProjectPlatform, string>;

export const projectStatusLabels: Record<ProjectStatus, string> = {
  pending: "공개 전",
  published: "공개 중",
  limited: "제한 공개",
  hidden: "비공개",
  rejected: "반려",
  archived: "보관"
};

export const verificationLabels: Record<VerificationState, string> = {
  unverified: "미확인",
  github_verified: "GitHub 확인",
  domain_verified: "도메인 확인"
};

export const domainVerificationStatusLabels = {
  pending: "대기",
  verified: "검증 완료",
  failed: "확인 실패",
  revoked: "무효화"
} as const;

export const projectPostLabels = {
  launch: "런치",
  update: "업데이트",
  feedback: "피드백"
} as const;

export const navLinks = [
  { href: "/", label: "홈" },
  { href: "/projects", label: "탐색" },
  { href: "/submit", label: "등록하기" }
] as const;

export const defaultTagCatalog = [
  { slug: "web", name: "Web" },
  { slug: "mobile", name: "Mobile" },
  { slug: "open-source", name: "Open Source" },
  { slug: "no-signup", name: "No Signup" },
  { slug: "free", name: "Free" },
  { slug: "beta", name: "Beta" },
  { slug: "solo-maker", name: "Solo Maker" },
  { slug: "developer-tools", name: "Developer Tools" }
] as const;
