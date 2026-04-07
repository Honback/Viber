"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { FileText } from "lucide-react";
import { useLocale } from "@/lib/i18n/locale-context";

function useEntranceAnimation(delay = 0) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return { ref, isVisible };
}

export default function BlogListPage() {
  const { t, locale } = useLocale();
  const heroAnim = useEntranceAnimation(50);
  const listAnim = useEntranceAnimation(200);

  return (
    <>
      <section className="bg-[#0A0A0A] px-4 pb-10 pt-12 text-center sm:pb-14 sm:pt-16">
        <div
          ref={heroAnim.ref}
          className="mx-auto max-w-3xl"
          style={{
            opacity: heroAnim.isVisible ? 1 : 0,
            transform: heroAnim.isVisible ? "translateY(0)" : "translateY(24px)",
            transition: "opacity 0.7s ease, transform 0.7s ease",
          }}
        >
          <span
            className="inline-flex items-center gap-1.5 rounded-full bg-neutral-800 px-4 py-1.5 text-xs font-semibold"
            style={{ color: "#d76542" }}
          >
            <FileText className="h-3.5 w-3.5" /> {t.blog.badge}
          </span>
          <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            {t.blog.title1}<span style={{ color: "#d76542" }}>{t.blog.title2}</span>
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-neutral-400 sm:text-base">
            {t.blog.description}
          </p>
        </div>
      </section>

      <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-10 px-4 py-8 md:py-10">
        <div
          ref={listAnim.ref}
          className="grid gap-6 md:grid-cols-2"
          style={{
            opacity: listAnim.isVisible ? 1 : 0,
            transform: listAnim.isVisible ? "translateY(0)" : "translateY(24px)",
            transition: "opacity 0.7s ease 0.1s, transform 0.7s ease 0.1s",
          }}
        >
        </div>

        <div
          className="rounded-2xl border border-dashed border-neutral-800 px-6 py-12 text-center text-neutral-500"
          style={{
            opacity: listAnim.isVisible ? 1 : 0,
            transition: "opacity 0.7s ease 0.3s",
          }}
        >
          {t.blog.empty}
        </div>
      </div>
    </>
  );
}
