"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ROUTES } from "@/lib/constants";
import type { Product } from "@/data/products";

type ProductCarouselProps = {
  products: Pick<Product, "slug" | "sku" | "name" | "image" | "category">[];
};

/**
 * Carousel – prev/next buttons, horizontal scroll track.
 * Transparent hero style: links with image + text, no cards.
 */
export function ProductCarousel({ products }: ProductCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "prev" | "next") => {
    const track = trackRef.current;
    if (!track) return;
    const amount = Math.min(280, track.clientWidth - 40);
    track.scrollBy({ left: dir === "prev" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <div className="carousel mt-4 grid grid-cols-[auto_1fr_auto] items-center gap-3 bg-transparent" style={{ gridTemplateColumns: "auto 1fr auto" }}>
      <button
        type="button"
        onClick={() => scroll("prev")}
        aria-label="Previous"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200/60 bg-white/60 text-slate-700 backdrop-blur-sm transition hover:translate-y-[-2px] hover:bg-white/80"
      >
        <span className="text-xl font-semibold">‹</span>
      </button>
      <div className="track min-w-0 overflow-hidden bg-transparent">
        <div ref={trackRef} className="track-inner flex gap-6 overflow-x-auto py-5 px-3 scroll-smooth bg-transparent" style={{ scrollbarWidth: "thin" }}>
          {products.map((p) => (
            <Link
              key={p.sku}
              href={ROUTES.product(p.slug)}
              className="group flex shrink-0 min-w-[200px] max-w-[200px] flex-col overflow-hidden rounded-2xl transition hover:opacity-90"
            >
              <div className="relative aspect-square bg-transparent">
                <Image
                  src={p.image}
                  alt={p.name}
                  fill
                  className="object-contain p-4 transition group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, 25vw"
                />
              </div>
              <div className="flex flex-1 flex-col justify-end p-4">
                <p className="text-xs font-medium text-slate-500">{p.category}</p>
                <p className="mt-1 line-clamp-2 font-semibold text-slate-900">{p.name}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <button
        type="button"
        onClick={() => scroll("next")}
        aria-label="Next"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200/60 bg-white/60 text-slate-700 backdrop-blur-sm transition hover:translate-y-[-2px] hover:bg-white/80"
      >
        <span className="text-xl font-semibold">›</span>
      </button>
    </div>
  );
}
