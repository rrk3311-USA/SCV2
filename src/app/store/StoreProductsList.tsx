"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { getStoreProductsSortedByBestSellers } from "@/data/products";
import { CATEGORY_ID_TO_PRODUCT_CATEGORIES } from "@/data/categories";
import { ViewItemListTracker } from "@/components/ViewItemListTracker";
import type { Product } from "@/data/products";

const PRODUCTS_PER_PAGE = 12;

function buildStoreQuery(cat: string | null, page: number): string {
  const params = new URLSearchParams();
  if (cat) params.set("cat", cat);
  if (page > 1) params.set("page", String(page));
  const q = params.toString();
  return q ? `/store?${q}` : "/store";
}

function StoreProductCard({ product }: { product: Product }) {
  const [imgError, setImgError] = useState(false);
  return (
    <Link
      href={`/product/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl bg-transparent transition hover:opacity-90"
      aria-label={product.name}
    >
      <div className="relative aspect-square w-full max-w-[200px] mx-auto bg-transparent p-2">
        {imgError ? (
          <div className="flex h-full w-full items-center justify-center rounded-lg bg-slate-100 text-slate-400 text-sm">
            Product
          </div>
        ) : (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-contain transition group-hover:scale-[1.02]"
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 28vw, 180px"
            onError={() => setImgError(true)}
          />
        )}
      </div>
      <div className="flex flex-1 flex-col p-2 text-center">
        <p className="text-xs font-medium text-slate-500">{product.category}</p>
        <p className="mt-0.5 line-clamp-2 text-sm font-semibold text-slate-900">{product.name}</p>
        <p className="mt-0.5 text-sm font-medium text-[#2854a6]">${product.price.toFixed(2)}</p>
      </div>
    </Link>
  );
}

/** Store uses local catalog only: all products, top sellers first, 12 per page, transparent hero cards. */
export function StoreProductsList() {
  const searchParams = useSearchParams();
  const orderedProducts = getStoreProductsSortedByBestSellers();
  const cat = searchParams.get("cat");
  const page = Math.max(1, Math.min(999, parseInt(searchParams.get("page") ?? "1", 10) || 1));
  const allowedCategories = cat ? CATEGORY_ID_TO_PRODUCT_CATEGORIES[cat] : null;
  const filteredProducts = allowedCategories
    ? orderedProducts.filter((p) => allowedCategories.includes(p.category))
    : orderedProducts;
  const totalProducts = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalProducts / PRODUCTS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const pageProducts = filteredProducts.slice(start, start + PRODUCTS_PER_PAGE);
  const storeItems = pageProducts.map((p: Product) => ({
    item_id: p.sku,
    item_name: p.name,
    price: p.price,
    item_category: p.category,
  }));

  return (
    <>
      <ViewItemListTracker items={storeItems} listId="store_all" listName={cat ? `Store: ${cat}` : "All Products"} />
      <div className="store-products-grid grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 w-full max-w-6xl mx-auto" role="list">
        {pageProducts.map((p) => (
          <StoreProductCard key={p.sku} product={p} />
        ))}
      </div>
      {totalPages > 1 && (
        <nav className="mt-6 flex flex-wrap items-center justify-center gap-2" aria-label="Product pagination">
          {currentPage > 1 && (
            <Link
              href={buildStoreQuery(cat, currentPage - 1)}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              Previous
            </Link>
          )}
          <span className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={buildStoreQuery(cat, p)}
                className={`inline-flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition ${
                  p === currentPage
                    ? "bg-[#2854a6] text-white shadow-sm"
                    : "border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50"
                }`}
                aria-current={p === currentPage ? "page" : undefined}
              >
                {p}
              </Link>
            ))}
          </span>
          {currentPage < totalPages && (
            <Link
              href={buildStoreQuery(cat, currentPage + 1)}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              Next
            </Link>
          )}
        </nav>
      )}
    </>
  );
}
