"use client";

import Link from "next/link";
import Image from "next/image";
import { TOP_7 } from "@/data/products";
import { ROUTES } from "@/lib/constants";
import { AddToCartButton } from "@/components/AddToCartButton";
import { CaretRight } from "@phosphor-icons/react";

type CartUpsellProps = {
  excludeSkus: string[];
  title?: string;
  className?: string;
};

/** Cross-sell / upsell: products to add, excluding those already in cart. */
export function CartUpsell({ excludeSkus, title = "You might also like", className = "" }: CartUpsellProps) {
  const exclude = new Set(excludeSkus);
  const products = TOP_7.filter((p) => !exclude.has(p.sku)).slice(0, 4);

  if (products.length === 0) return null;

  return (
    <section className={className}>
      <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">{title}</h2>
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {products.map((p) => (
          <div
            key={p.sku}
            className="flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition hover:shadow-md"
          >
            <Link href={ROUTES.product(p.slug)} className="relative block aspect-square overflow-hidden bg-slate-50">
              <Image
                src={p.image}
                alt={p.name}
                fill
                className="object-contain p-3"
                sizes="(max-width: 640px) 50vw, 25vw"
              />
            </Link>
            <div className="flex flex-1 flex-col p-3">
              <Link
                href={ROUTES.product(p.slug)}
                className="line-clamp-2 text-sm font-medium text-slate-900 hover:text-[#2854a6] hover:underline"
              >
                {p.name}
              </Link>
              <p className="mt-1 text-sm font-semibold text-[#2854a6]">${p.price.toFixed(2)}</p>
              <div className="mt-auto pt-2">
                <AddToCartButton
                  sku={p.sku}
                  name={p.name}
                  price={p.price}
                  image={p.image}
                  className="w-full rounded-lg bg-[#2854a6] px-3 py-2 text-sm font-medium text-white"
                >
                  Add to cart
                </AddToCartButton>
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4">
        <Link
          href={ROUTES.store}
          className="inline-flex items-center gap-1 font-medium text-[#2854a6] hover:underline"
        >
          View all products
          <CaretRight size={18} weight="bold" />
        </Link>
      </p>
    </section>
  );
}
