"use client";

import Link from "next/link";
import Image from "next/image";
import { TOP_7 } from "@/data/products";
import { getProductBySlug } from "@/data/products";
import { ROUTES } from "@/lib/constants";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/constants";
import { AddToCartButton } from "@/components/AddToCartButton";
import { CaretRight, Sparkle, Tag, Truck } from "@phosphor-icons/react";

type CartUpsellProps = {
  excludeSkus: string[];
  /** Optional subtotal to show "Add $X for free shipping" */
  subtotal?: number;
  title?: string;
  className?: string;
};

/** Cross-sell / upsell: fun "add more, save more" pitch with product grid. */
export function CartUpsell({
  excludeSkus,
  subtotal = 0,
  title,
  className = "",
}: CartUpsellProps) {
  const exclude = new Set(excludeSkus);
  const products = TOP_7.filter((p) => !exclude.has(p.sku)).slice(0, 4);
  const resolved = products.map((p) => getProductBySlug(p.slug) ?? p);

  if (resolved.length === 0) return null;

  const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const showFreeShippingPitch = subtotal > 0 && amountToFreeShipping > 0 && amountToFreeShipping < FREE_SHIPPING_THRESHOLD;

  return (
    <section className={className}>
      {/* Add more, save more – fun pitch banner */}
      <div className="overflow-hidden rounded-2xl border border-[#2854a6]/20 bg-gradient-to-br from-[#2854a6]/08 to-[#2854a6]/04 p-5 sm:p-6">
        <div className="flex flex-wrap items-start gap-4 sm:gap-6">
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2854a6] text-white">
              <Sparkle size={22} weight="fill" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                {title ?? "Add more, save more"}
              </h2>
              <p className="text-sm text-slate-600">
                Stack your order and unlock better value.
              </p>
            </div>
          </div>
          <ul className="flex flex-1 flex-wrap gap-x-6 gap-y-1 text-sm text-slate-700 sm:gap-x-8">
            <li className="flex items-center gap-1.5">
              <Tag size={18} weight="fill" className="text-green-600 shrink-0" />
              <span>Bundle & save up to 20%</span>
            </li>
            <li className="flex items-center gap-1.5">
              <Sparkle size={18} weight="fill" className="text-[#2854a6] shrink-0" />
              <span>Subscribe & Save 15%</span>
            </li>
            <li className="flex items-center gap-1.5">
              <Truck size={18} weight="fill" className="text-slate-500 shrink-0" />
              <span>Free shipping on orders ${FREE_SHIPPING_THRESHOLD}+</span>
            </li>
          </ul>
        </div>
        {showFreeShippingPitch && (
          <p className="mt-4 rounded-xl bg-white/80 px-4 py-2.5 text-center text-sm font-semibold text-[#2854a6] shadow-sm">
            Add ${amountToFreeShipping.toFixed(0)} more for <strong>FREE shipping</strong> — you’re almost there!
          </p>
        )}
      </div>

      {/* Upsell product grid */}
      <p className="mt-4 text-sm font-medium text-slate-600">
        Complete your routine — popular picks that pair perfectly:
      </p>
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {resolved.map((p) => {
          const maxSave = p.bundle_options?.reduce((best, o) => Math.max(best, o.savePercent ?? 0), 0) ?? 0;
          const subscribeSave = p.subscribe_save_percent ?? 0;
          const saveLabel = maxSave >= subscribeSave && maxSave > 0
            ? `Save up to ${maxSave}%`
            : subscribeSave > 0
              ? `Subscribe & Save ${subscribeSave}%`
              : null;
          return (
            <div
              key={p.sku}
              className="flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition hover:shadow-md"
            >
              {saveLabel && (
                <div className="bg-[#2854a6] px-2 py-1 text-center text-xs font-bold uppercase tracking-wide text-white">
                  {saveLabel}
                </div>
              )}
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
          );
        })}
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
