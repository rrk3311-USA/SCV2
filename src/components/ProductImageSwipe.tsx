"use client";

import { useState } from "react";
import Image from "next/image";

/**
 * Product images: swipe only. No zoom, no open-to-gallery.
 * One image at a time on mobile/desktop; horizontal scroll with scroll-snap.
 */
type Props = {
  images: string[];
  alt: string;
};

export function ProductImageSwipe({ images, alt }: Props) {
  const [errors, setErrors] = useState<Record<number, boolean>>({});

  if (images.length === 0) return null;

  const handleError = (i: number) => {
    setErrors((prev) => ({ ...prev, [i]: true }));
  };

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl bg-transparent"
      style={{ touchAction: "pan-x" }}
    >
      <div
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
    </div>
  );
}
