"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { sdk } from "@/lib/sdk";
import { getStoreProductsSortedByBestSellers } from "@/data/products";
import { CATEGORY_ID_TO_PRODUCT_CATEGORIES } from "@/data/categories";
import { ViewItemListTracker } from "@/components/ViewItemListTracker";
import type { Product } from "@/data/products";

const PRODUCTS_PER_PAGE = 6;

function buildStoreQuery(cat: string | null, page: number): string {
  const params = new URLSearchParams();
  if (cat) params.set("cat", cat);
  if (page > 1) params.set("page", String(page));
  const q = params.toString();
  return q ? `/store?${q}` : "/store";
}

type StoreProduct = {
  id: string;
  title: string | null;
  handle: string | null;
  thumbnail?: string | null;
  variants?: Array<{ id: string; prices?: Array<{ amount: number; currency_code?: string }> }>;
};

function MedusaProductCard({ product }: { product: StoreProduct }) {
  const [imgError, setImgError] = useState(false);
  const title = product.title ?? product.handle ?? product.id;
  return (
    <Link
      href={`/product/${product.id}`}
      className="group flex flex-col rounded-xl bg-transparent transition hover:opacity-90"
      aria-label={title}
    >
      <div className="relative aspect-square w-full max-w-[200px] mx-auto bg-transparent p-2">
        {!product.thumbnail || imgError ? (
          <div className="flex h-full w-full items-center justify-center rounded-lg bg-slate-100 text-sm text-slate-400">
            Product
          </div>
        ) : (
          <Image
            src={product.thumbnail}
            alt={title}
            fill
            className="object-contain transition group-hover:scale-[1.02]"
            sizes="(max-width: 640px) 45vw, 180px"
            unoptimized
            onError={() => setImgError(true)}
          />
        )}
      </div>
    </Link>
  );
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

export function StoreProductsList() {
  const [loading, setLoading] = useState(true);
  const [medusaProducts, setMedusaProducts] = useState<StoreProduct[]>([]);
  const searchParams = useSearchParams();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const PAGE_SIZE = 100;
    async function fetchAll() {
      const all: StoreProduct[] = [];
      let offset = 0;
      for (;;) {
        const { products: list } = await sdk.store.product.list({
          limit: PAGE_SIZE,
          offset,
        });
        const chunk = (list ?? []) as StoreProduct[];
        if (cancelled) return;
        all.push(...chunk);
        if (chunk.length < PAGE_SIZE) break;
        offset += PAGE_SIZE;
      }
      if (!cancelled) setMedusaProducts(all);
    }
    fetchAll()
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
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4" aria-busy="true">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="aspect-square animate-pulse rounded-xl bg-slate-100" />
        ))}
      </div>
    );
  }

  if (medusaProducts.length > 0) {
    const cat = searchParams.get("cat");
    const page = Math.max(1, Math.min(999, parseInt(searchParams.get("page") ?? "1", 10) || 1));
    const totalProducts = medusaProducts.length;
    const totalPages = Math.max(1, Math.ceil(totalProducts / PRODUCTS_PER_PAGE));
    const currentPage = Math.min(page, totalPages);
    const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
    const pageProducts = medusaProducts.slice(start, start + PRODUCTS_PER_PAGE);
    const items = pageProducts.map((p) => ({
      item_id: p.id,
      item_name: p.title ?? p.handle ?? p.id,
      price: (p.variants?.[0]?.prices?.[0]?.amount ?? 0) / 100,
    }));
    return (
      <>
        <ViewItemListTracker items={items} listId="store_all" listName="All Products" />
        <div className="store-products-grid grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 w-full max-w-6xl mx-auto" role="list">
          {pageProducts.map((p) => (
            <MedusaProductCard key={p.id} product={p} />
          ))}
        </div>
        {totalPages > 1 && (
          <nav className="mt-6 flex flex-wrap items-center justify-center gap-2" aria-label="Product pagination">
            {currentPage > 1 && (
              <Link href={buildStoreQuery(cat, currentPage - 1)} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50">
                Previous
              </Link>
            )}
            <span className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={buildStoreQuery(cat, p)}
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition ${p === currentPage ? "bg-[#2854a6] text-white shadow-sm" : "border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50"}`}
                  aria-current={p === currentPage ? "page" : undefined}
                >
                  {p}
                </Link>
              ))}
            </span>
            {currentPage < totalPages && (
              <Link href={buildStoreQuery(cat, currentPage + 1)} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50">
                Next
              </Link>
            )}
          </nav>
        )}
      </>
    );
  }

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
