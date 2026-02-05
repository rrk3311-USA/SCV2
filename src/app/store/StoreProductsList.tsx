"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { sdk } from "@/lib/sdk";
import { TOP_7, TOP_PRODUCTS } from "@/data/products";
import { ViewItemListTracker } from "@/components/ViewItemListTracker";
import type { Product } from "@/data/products";

type StoreProduct = {
  id: string;
  title: string | null;
  handle: string | null;
  thumbnail?: string | null;
  variants?: Array<{ id: string; prices?: Array<{ amount: number; currency_code?: string }> }>;
};

export function StoreProductsList() {
  const [loading, setLoading] = useState(true);
  const [medusaProducts, setMedusaProducts] = useState<StoreProduct[]>([]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    sdk.store.product
      .list({ limit: 20, offset: 0 })
      .then(({ products: list }) => {
        if (!cancelled) setMedusaProducts((list ?? []) as StoreProduct[]);
      })
      .catch(() => {
        if (!cancelled) setMedusaProducts([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <p className="text-gray-500">Loading products…</p>;
  }

  if (medusaProducts.length > 0) {
    const items = medusaProducts.map((p) => ({
      item_id: p.id,
      item_name: p.title ?? p.handle ?? p.id,
      price: (p.variants?.[0]?.prices?.[0]?.amount ?? 0) / 100,
    }));
    return (
      <>
        <ViewItemListTracker items={items} listId="store_all" listName="All Products" />
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
        {medusaProducts.map((p) => (
          <Link
            key={p.id}
            href={`/product/${p.id}`}
            className="group block aspect-square relative p-4 hover:opacity-90 transition-opacity"
            aria-label={p.title ?? p.handle ?? p.id}
          >
            {p.thumbnail ? (
              <Image
                src={p.thumbnail}
                alt={p.title ?? ""}
                fill
                className="object-contain drop-shadow-[0_12px_28px_rgba(0,0,0,0.12)] transition-transform group-hover:scale-105"
                unoptimized
              />
            ) : (
              <span className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">No image</span>
            )}
          </Link>
        ))}
      </div>
      </>
    );
  }

  // No Medusa: show all products, top sellers (TOP_7) first
  const topSellerSlugs = new Set(TOP_7.map((p) => p.slug));
  const rest = TOP_PRODUCTS.filter((p) => !topSellerSlugs.has(p.slug));
  const orderedProducts = [...TOP_7, ...rest];
  const storeItems = orderedProducts.map((p: Product) => ({
    item_id: p.sku,
    item_name: p.name,
    price: p.price,
    item_category: p.category,
  }));

  return (
    <>
      <ViewItemListTracker items={storeItems} listId="store_all" listName="All Products" />
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {orderedProducts.map((p: Product) => (
        <Link
          key={p.sku}
          href={`/product/${p.slug}`}
          className="group block aspect-square relative p-4"
          aria-label={p.name}
        >
          <Image
            src={p.image}
            alt={p.name}
            fill
            className="object-contain drop-shadow-[0_12px_28px_rgba(0,0,0,0.12)] transition-transform group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, 20vw"
          />
        </Link>
      ))}
    </div>
    </>
  );
}
