"use client";

import { useState, useEffect } from "react";
import { FileText } from "lucide-react";
import { useLocale } from "@/lib/i18n/locale-context";

function useEntranceAnimation(delay = 0) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return isVisible;
}

export default function BlogListPage() {
  const { t } = useLocale();
  const heroVisible = useEntranceAnimation(50);
  const listVisible = useEntranceAnimation(200);

  return (
    <>
      <section className="bg-[#0A0A0A] px-4 pb-10 pt-12 text-center sm:pb-14 sm:pt-16">
        <div
          className={`mx-auto max-w-3xl transition-all duration-700 ${
            heroVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
          }`}
        >
          <span
            className="inline-flex items-center gap-1.5 rounded-full bg-neutral-800 px-4 py-1.5 text-xs font-semibold text-accent"
          >
            <FileText className="h-3.5 w-3.5" /> {t.blog.badge}
          </span>
          <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            {t.blog.title1}<span className="text-accent">{t.blog.title2}</span>
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-neutral-400 sm:text-base">
            {t.blog.description}
          </p>
        </div>
      </section>

      <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-10 px-4 py-8 md:py-10">
        <div
          className={`grid gap-6 md:grid-cols-2 transition-all duration-700 delay-100 ${
            listVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
          }`}
        >
        </div>

        <div
          className={`rounded-2xl border border-dashed border-neutral-800 px-6 py-12 text-center text-neutral-500 transition-opacity duration-700 delay-300 ${
            listVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          {t.blog.empty}
        </div>
      </div>
    </>
  );
}
