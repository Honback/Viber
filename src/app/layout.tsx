import type { Metadata } from "next";
import "./globals.css";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ThemeProvider } from "@/components/theme-provider";
import { getCurrentProfile } from "@/lib/auth/session";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://127.0.0.1:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "Viber - 바이브 코딩 프로젝트 쇼케이스 커뮤니티",
    template: "%s | Viber"
  },
  description: "바이브 코딩(Vibe Coding)으로 만든 프로젝트를 발견하고, 체험하고, 피드백하는 커뮤니티. AI 코딩 프로젝트를 무료로 등록하고 트렌딩에 올려보세요.",
  keywords: ["바이브 코딩", "바이브코딩", "vibe coding", "AI 코딩", "AI 프로젝트", "프로젝트 쇼케이스", "바이브 코딩 커뮤니티", "AI 앱"],
  authors: [{ name: "Viber" }],
  creator: "Viber",
  openGraph: {
    title: "Viber - 바이브 코딩 프로젝트 쇼케이스 커뮤니티",
    description: "바이브 코딩으로 만든 프로젝트를 발견하고, 체험하고, 피드백하는 커뮤니티",
    type: "website",
    siteName: "Viber",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Viber - 바이브 코딩 프로젝트 쇼케이스 커뮤니티",
    description: "바이브 코딩으로 만든 프로젝트를 발견하고, 체험하고, 피드백하는 커뮤니티",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const viewer = await getCurrentProfile();

  return (
    <html lang="ko" data-theme="dark">
      <head />
      <body className="min-h-screen text-foreground antialiased">
        <ThemeProvider>
          <div className="min-h-screen">
            <SiteHeader viewer={viewer} />
            <main>{children}</main>
            <SiteFooter />
          </div>
        </ThemeProvider>
        {/* 랜딩 페이지에서 공통 헤더/푸터 숨기기 */}
        <style dangerouslySetInnerHTML={{ __html: `
          .landing-fullpage { margin-top: -56px; }
          body:has(.landing-fullpage) header:not(.landing-fullpage header),
          body:has(.landing-fullpage) footer:not(.landing-fullpage footer) { display: none !important; }
          body:has(.landing-fullpage) { background: none !important; }
        ` }} />
      </body>
    </html>
  );
}
