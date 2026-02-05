"use client";

import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { ROUTES } from "@/lib/constants";
import { CATEGORIES } from "@/data/categories";

/**
 * Shop by category – image tiles (not pills). Grayscale when inactive, color when active; black/white hover.
 * Click resets to page 1.
 */
export function CategoryPills() {
  const searchParams = useSearchParams();
  const currentCat = searchParams.get("cat");

  return (
    <div className="flex flex-wrap items-stretch justify-center gap-3 sm:gap-4">
      <Link
        href={ROUTES.store}
        className={`flex min-h-[100px] min-w-[100px] sm:min-h-[120px] sm:min-w-[120px] items-center justify-center rounded-xl border-2 px-4 py-3 text-center text-sm font-semibold transition-all duration-200 sm:text-base ${
          !currentCat
            ? "border-[#2854a6] bg-[#2854a6] text-white shadow-md"
            : "border-slate-300 bg-slate-200 text-slate-600 grayscale hover:border-slate-400 hover:bg-slate-300"
        }`}
        aria-current={!currentCat ? "page" : undefined}
      >
        All
      </Link>
      {CATEGORIES.map((cat) => {
        const active = currentCat === cat.id;
        return (
          <Link
            key={cat.id}
            href={`${ROUTES.store}?cat=${cat.id}`}
            className={`relative flex aspect-square w-[100px] flex-col overflow-hidden rounded-xl border-2 shadow-sm transition-all duration-200 hover:shadow-md sm:w-[120px] ${
              active
                ? "border-[#2854a6] ring-2 ring-[#2854a6] ring-offset-2"
                : "border-slate-300 hover:border-slate-400"
            }`}
            aria-current={active ? "page" : undefined}
          >
            <div className={`absolute inset-0 transition-all duration-200 ${active ? "grayscale-0" : "grayscale"}`}>
              <Image
                src={cat.image}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100px, 120px"
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"
                aria-hidden
              />
            </div>
            <span className="absolute bottom-0 left-0 right-0 z-10 px-2 py-1.5 text-center text-xs font-semibold text-white drop-shadow sm:text-sm">
              {cat.name}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
