"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";

/**
 * Product images: swipe/slide only. No zoom, no click-to-open, no gallery/lightbox.
 * Horizontal scroll with scroll-snap; touchAction pan-x for swipe. Images are not clickable.
 */
type Props = {
  images: string[];
  alt: string;
};

export function ProductImageSwipe({ images, alt }: Props) {
  const [errors, setErrors] = useState<Record<number, boolean>>({});
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  if (images.length === 0) return null;

  const handleError = (i: number) => {
    setErrors((prev) => ({ ...prev, [i]: true }));
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || images.length <= 1) return;
    const onScroll = () => {
      const index = Math.round(el.scrollLeft / el.clientWidth);
      setActiveIndex(Math.min(index, images.length - 1));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [images.length]);

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl bg-transparent"
      style={{ touchAction: "pan-x" }}
    >
      <div
        ref={scrollRef}
        className="scrollbar-hide flex overflow-x-auto overflow-y-hidden scroll-smooth pb-2"
        style={{
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
        }}
        aria-label="Product images – swipe to view"
      >
        {images.map((src, i) => (
          <div
            key={i}
            className="relative aspect-square w-full min-w-full shrink-0 snap-center snap-always"
            style={{ scrollSnapAlign: "center" }}
          >
            {errors[i] ? (
              <div className="flex aspect-square w-full items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 text-slate-500">
                <span className="text-sm">Image</span>
              </div>
            ) : (
              <Image
                src={src}
                alt={images.length > 1 ? `${alt} – image ${i + 1}` : alt}
                fill
                className="object-contain p-4 select-none"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority={i === 0}
                draggable={false}
                onError={() => handleError(i)}
                style={{ pointerEvents: "none" }}
              />
            )}
          </div>
        ))}
      </div>
      {images.length > 1 && (
        <div className="mt-2 flex justify-center gap-1.5" aria-hidden>
          {images.map((_, i) => (
            <span
              key={i}
              className={`h-2 w-2 rounded-full transition-colors ${
                i === activeIndex ? "bg-slate-700" : "bg-slate-300"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
