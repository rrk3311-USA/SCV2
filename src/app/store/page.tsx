import { Suspense } from "react";
import { Trophy, ListBullets } from "@phosphor-icons/react/dist/ssr";
import { Container } from "@/components/Container";
import { getVisitorCount } from "@/lib/constants";
import {
  TOTAL_PRODUCTS,
  getStoreProductsSortedByBestSellers,
  resolveProductForDisplay,
  defaultBundleOptions,
  DEFAULT_SUBSCRIBE_SAVE_PERCENT,
} from "@/data/products";
import { isSupabaseConfigured, getProductsFromSupabase } from "@/lib/supabase";
import type { Product } from "@/data/products";
import { CategoryPills } from "./CategoryPills";
import { StoreProductsList } from "./StoreProductsList";

async function getStoreProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured()) return getStoreProductsSortedByBestSellers();
  const fromDb = await getProductsFromSupabase();
  if (!fromDb?.length) return getStoreProductsSortedByBestSellers();
  return fromDb.map((p) =>
    resolveProductForDisplay({
      ...p,
      bundle_options: defaultBundleOptions(p.price),
      subscribe_save_percent: DEFAULT_SUBSCRIBE_SAVE_PERCENT,
    } as Product)
  );
}

export default async function StorePage() {
  const products = await getStoreProducts();
  const totalProducts = products.length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Container className="px-4 py-4 sm:px-6 sm:py-6">
        {/* Floating category pills – no cards; click filters and resets to page 1 */}
        <section className="mb-6">
          <h2 className="sr-only">Shop by Category</h2>
          <Suspense fallback={<div className="h-10 w-full max-w-md mx-auto animate-pulse rounded-full bg-slate-100" />}>
            <CategoryPills />
          </Suspense>
        </section>

        {/* Product grid (not carousel) – top 12 first, bundles last in categories, paginated */}
        <section className="mt-4">
          <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">
            All Products <span className="font-normal text-slate-500">({totalProducts})</span>
          </h2>
          <p className="mt-0.5 flex flex-wrap items-center gap-2 text-sm text-slate-600 pb-4">
            <span className="inline-flex items-center gap-1.5">
              <Trophy className="h-4 w-4 shrink-0 text-amber-500" weight="fill" aria-hidden />
              Top sellers first
            </span>
            <span className="text-slate-400">·</span>
            <span className="inline-flex items-center gap-1.5">
              <ListBullets className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
              then the rest
            </span>
          </p>
          <Suspense fallback={<div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 max-w-5xl mx-auto"><div className="aspect-square animate-pulse rounded-xl bg-slate-100" /><div className="aspect-square animate-pulse rounded-xl bg-slate-100" /><div className="aspect-square animate-pulse rounded-xl bg-slate-100" /><div className="aspect-square animate-pulse rounded-xl bg-slate-100" /></div>}>
            <StoreProductsList initialProducts={products} />
          </Suspense>
        </section>
      </Container>

      {/* Shop hero – visitor count (actual from env) + frosted map with live-style pins */}
      <section
        className="relative flex min-h-[250px] flex-col justify-end bg-[#2854a6] bg-cover bg-center bg-no-repeat sm:min-h-[300px]"
        style={{ backgroundImage: "url('/images/home/lab.jpg')" }}
        aria-label="Shop banner"
      >
        <div className="absolute inset-0 bg-[#2854a6]/50" aria-hidden="true" />
        <div className="relative z-10 px-5 py-8 text-center sm:px-6 sm:py-10">
          <div className="mx-auto max-w-4xl">
            <h3 className="mb-4 text-lg font-semibold text-white drop-shadow-md sm:text-xl">
              Trusted by {getVisitorCount()} Happy Customers
            </h3>
            <p
              className="mb-2 inline-block rounded-xl px-6 py-3 text-3xl font-extrabold text-white sm:text-4xl"
              style={{
                background: "rgba(255, 255, 255, 0.2)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1px solid rgba(255, 255, 255, 0.25)",
                textShadow: "0 2px 8px rgba(0,0,0,0.3)",
              }}
            >
              {getVisitorCount()}
            </p>
            <p className="text-base text-white/95 drop-shadow sm:text-lg">
              Join thousands who&apos;ve transformed their health with our premium supplements
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
