"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n/locale-context";
import { Logo } from "@/components/ui/logo";

export function SiteFooter() {
  const { t } = useLocale();

  return (
    <footer className="border-t border-neutral-800 bg-[#0A0A0A]">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-8 text-sm text-neutral-500 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <Logo height={18} />
          <p>{t.footer.description}</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/blog" className="transition hover:text-white">{t.nav.blog}</Link>
          <Link href="/policy/content" className="transition hover:text-white">{t.footer.policy}</Link>
          <Link href="/policy/privacy" className="transition hover:text-white">{t.footer.privacy}</Link>
          <Link href="/submit" className="transition hover:text-white">{t.footer.submitProject}</Link>
        </div>
      </div>
    </footer>
  );
}
