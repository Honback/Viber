import type { Metadata } from "next";

import { categoryOptions, platformOptions, pricingOptions, stageOptions } from "@/lib/constants";
import { getCurrentProfile } from "@/lib/auth/session";
import { SubmitPageClient } from "./submit-client";

export const metadata: Metadata = {
  title: "프로젝트 등록",
  description: "AI 코딩으로 만든 프로젝트를 Viber에 무료로 등록하세요. 커뮤니티의 피드백을 받고 함께 성장할 수 있습니다.",
  keywords: ["바이브 코딩 프로젝트 등록", "AI 프로젝트 공유", "프로젝트 런칭"],
  openGraph: {
    title: "프로젝트 등록 | Viber",
    description: "바이브 코딩 프로젝트를 무료로 등록하고 커뮤니티의 피드백을 받으세요.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "프로젝트 등록 | Viber",
    description: "바이브 코딩 프로젝트를 무료로 등록하고 커뮤니티의 피드백을 받으세요.",
  },
  alternates: { canonical: "/submit" },
};

export default async function SubmitPage() {
  const viewer = await getCurrentProfile();
  const verificationMethod = viewer?.githubUsername ? "github" : "email";

  return (
    <SubmitPageClient
      viewer={viewer ? { displayName: viewer.displayName, githubUsername: viewer.githubUsername ?? null } : null}
      verificationMethod={verificationMethod}
      categoryOptions={[...categoryOptions]}
      platformOptions={[...platformOptions]}
      pricingOptions={[...pricingOptions]}
      stageOptions={[...stageOptions]}
    />
  );
}
