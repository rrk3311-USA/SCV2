"use client";

import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { ROUTES } from "@/lib/constants";
import type { Category } from "@/data/categories";

/**
 * Category card – exact 8080 style but smaller. Grayscale default, color on hover/select.
 * Solid gradient overlay (no blur) – same colors as deploy-site.
 */
export function CategoryCard({ id, name, count, image }: Category) {
  const searchParams = useSearchParams();
  const selected = searchParams.get("cat") === id;
  const active = selected;

  const href = `${ROUTES.store}?cat=${id}`;
  const isColored = active;

  return (
    <Link
      href={href}
      className={`group relative block overflow-hidden rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] ${
        active ? "ring-2 ring-[#2854a6]/40" : ""
      }`}
    >
      <div className="relative h-[140px] sm:h-[160px]">
        <Image
          src={image}
          alt={name}
          fill
          className={`object-cover transition-all duration-300 ${
            isColored ? "grayscale-0 contrast-[1.2] brightness-110" : "grayscale contrast-[1.1] group-hover:grayscale-0 group-hover:contrast-[1.2] group-hover:brightness-110 group-hover:scale-105"
          }`}
          sizes="(max-width: 640px) 50vw, 25vw"
        />
        {/* Lower overlay – exact 8080 style (solid gradient, no blur) */}
        <div
          className={`absolute bottom-0 left-0 right-0 z-[2] border-t-2 border-white/60 px-4 py-3 transition-all duration-300 ${
            active
              ? "bg-gradient-to-t from-[#2854a6]/95 to-[#2854a6]/40 text-white"
              : "bg-gradient-to-t from-white/[0.98] to-white/40 text-[#2D3748] group-hover:bg-gradient-to-t group-hover:from-[#2854a6]/95 group-hover:to-[#2854a6]/40 group-hover:text-white"
          }`}
          style={{
            boxShadow: "0 -4px 20px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.5)",
          }}
        >
          <p className="text-xs font-extrabold uppercase tracking-[1.5px] text-inherit sm:text-sm" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            {name}
          </p>
          <p className="mt-0.5 text-[11px] font-semibold opacity-95 text-inherit sm:text-xs" style={{ textShadow: "0 1px 2px rgba(255,255,255,0.5)" }}>
            {count} Products
          </p>
        </div>
      </div>
    </Link>
  );
}
