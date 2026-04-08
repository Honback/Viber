import type { Metadata } from "next";
import { Poiret_One } from "next/font/google";
import "./globals.css";

export const dynamic = "force-dynamic";

const logoFont = Poiret_One({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-logo",
});
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ThemeProvider } from "@/components/theme-provider";
import { LocaleProvider } from "@/lib/i18n/locale-context";
import { getLocale } from "@/lib/i18n/get-locale";
import { getCurrentProfile } from "@/lib/auth/session";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://127.0.0.1:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "Vibeollio - 바이브 코딩 프로젝트 쇼케이스 커뮤니티",
    template: "%s | Vibeollio"
  },
  description: "바이브 코딩(Vibe Coding)으로 만든 프로젝트를 발견하고, 체험하고, 피드백하는 커뮤니티. AI 코딩 프로젝트를 무료로 등록하고 트렌딩에 올려보세요.",
  keywords: ["바이브 코딩", "바이브코딩", "vibe coding", "AI 코딩", "AI 프로젝트", "프로젝트 쇼케이스", "바이브 코딩 커뮤니티", "AI 앱"],
  authors: [{ name: "Vibeollio" }],
  creator: "Vibeollio",
  openGraph: {
    title: "Vibeollio - 바이브 코딩 프로젝트 쇼케이스 커뮤니티",
    description: "바이브 코딩으로 만든 프로젝트를 발견하고, 체험하고, 피드백하는 커뮤니티",
    type: "website",
    siteName: "Vibeollio",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vibeollio - 바이브 코딩 프로젝트 쇼케이스 커뮤니티",
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
  const [viewer, locale] = await Promise.all([getCurrentProfile(), getLocale()]);

  return (
    <html lang={locale} data-theme="dark">
      <head />
      <body className={`min-h-screen text-foreground antialiased ${logoFont.variable}`}>
        <LocaleProvider initialLocale={locale}>
          <ThemeProvider>
            <div className="min-h-screen">
              <SiteHeader viewer={viewer} />
              <main>{children}</main>
              <SiteFooter />
            </div>
          </ThemeProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
