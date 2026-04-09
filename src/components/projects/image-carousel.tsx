"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  images: string[];
  alt: string;
};

export function ImageCarousel({ images, alt }: Props) {
  const [current, setCurrent] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const total = images.length;

  const scrollTo = useCallback(
    (index: number) => {
      const el = trackRef.current;
      if (!el) return;
      const child = el.children[index] as HTMLElement | undefined;
      if (child) {
        el.scrollTo({ left: child.offsetLeft, behavior: "smooth" });
      }
      setCurrent(index);
    },
    []
  );

  const prev = () => scrollTo(Math.max(0, current - 1));
  const next = () => scrollTo(Math.min(total - 1, current + 1));

  /* sync current index when user scrolls manually / with touch */
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const scrollLeft = el.scrollLeft;
        const width = el.offsetWidth;
        const idx = Math.round(scrollLeft / width);
        if (idx !== current && idx >= 0 && idx < total) {
          setCurrent(idx);
        }
        ticking = false;
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [current, total]);

  if (total === 0) return null;

  return (
    <div className="group relative">
      {/* Scrollable track */}
      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-0 overflow-x-auto scroll-smooth rounded-2xl border border-line bg-surface-muted"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {images.map((src, i) => (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            key={`${alt}-${i}`}
            src={src}
            alt={`${alt} ${i === 0 ? "대표 이미지" : `스크린샷 ${i}`}`}
            className="aspect-video w-full shrink-0 snap-center object-cover"
            draggable={false}
          />
        ))}
      </div>

      {/* Prev / Next buttons */}
      {total > 1 && (
        <>
          <button
            onClick={prev}
            disabled={current === 0}
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white opacity-0 backdrop-blur transition hover:bg-black/80 group-hover:opacity-100 disabled:pointer-events-none disabled:opacity-0"
            aria-label="이전 이미지"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={next}
            disabled={current === total - 1}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white opacity-0 backdrop-blur transition hover:bg-black/80 group-hover:opacity-100 disabled:pointer-events-none disabled:opacity-0"
            aria-label="다음 이미지"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* Dots */}
      {total > 1 && (
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              className={`h-2 rounded-full transition-all ${
                i === current ? "w-6 bg-white" : "w-2 bg-white/50 hover:bg-white/70"
              }`}
              aria-label={`이미지 ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* Counter */}
      {total > 1 && (
        <div className="absolute right-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur">
          {current + 1} / {total}
        </div>
      )}
    </div>
  );
}
