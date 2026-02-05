"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ROUTES } from "@/lib/constants";
import { getRecentlyViewed } from "@/lib/recentlyViewed";
import type { RecentlyViewedItem } from "@/lib/recentlyViewed";

type Props = {
  /** Exclude this slug from the list (e.g. current product page). */
  excludeSlug?: string;
};

/**
 * Horizontal list of recently viewed products. Hide when empty.
 */
export function RecentlyViewed({ excludeSlug }: Props = {}) {
  const [items, setItems] = useState<RecentlyViewedItem[]>([]);

  useEffect(() => {
    const update = () => {
      let list = getRecentlyViewed();
      if (excludeSlug) list = list.filter((i) => i.slug !== excludeSlug);
      setItems(list);
    };
    update();
    window.addEventListener("recentlyViewedUpdated", update);
    return () => window.removeEventListener("recentlyViewedUpdated", update);
  }, [excludeSlug]);

  if (items.length === 0) return null;

  return (
    <section className="mt-12 border-t border-slate-200 pt-10">
      <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">Recently Viewed</h2>
      <div className="mt-4 flex gap-4 overflow-x-auto pb-2 scroll-smooth scrollbar-hide" style={{ scrollbarWidth: "thin" }}>
        {items.map((p) => (
          <Link
            key={p.slug}
            href={ROUTES.product(p.slug)}
            className="group flex w-[140px] shrink-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md sm:w-[160px]"
          >
            <div className="relative aspect-square w-full shrink-0 bg-slate-50">
              <Image
                src={p.image}
                alt={p.name}
                fill
                className="hero-banner-float object-contain p-3 transition group-hover:scale-105"
                sizes="(max-width: 640px) 140px, 160px"
              />
            </div>
            <div className="min-h-0 shrink-0 border-t border-slate-100 bg-white px-3 py-2">
              <p className="line-clamp-2 text-sm font-medium text-slate-900">{p.name}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
