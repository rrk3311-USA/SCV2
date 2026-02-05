"use client";

import Link from "next/link";
import Image from "next/image";
import { ROUTES } from "@/lib/constants";
import type { Product } from "@/data/products";

type ProductCardProps = Pick<Product, "slug" | "name" | "image" | "category">;

/**
 * Clean product card – image, name, category, link. No legacy code.
 */
export function ProductCard({ slug, name, image, category }: ProductCardProps) {
  const href = ROUTES.product(slug);
  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition hover:border-slate-300 hover:shadow-md"
    >
      <div className="relative aspect-square bg-slate-100">
        <Image
          src={image}
          alt={name}
          fill
          className="object-contain p-4 transition group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, 25vw"
        />
      </div>
      <div className="flex flex-1 flex-col justify-end p-4">
        <p className="text-xs font-medium text-slate-500">{category}</p>
        <p className="mt-1 line-clamp-2 font-semibold text-slate-900">{name}</p>
      </div>
    </Link>
  );
}
