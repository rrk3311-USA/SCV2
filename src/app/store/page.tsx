import { Suspense } from "react";
import { Container } from "@/components/Container";
import { TOTAL_PRODUCTS } from "@/data/products";
import { CategoryPills } from "./CategoryPills";
import { StoreProductsList } from "./StoreProductsList";

export default function StorePage() {
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
            All Products <span className="font-normal text-slate-500">({TOTAL_PRODUCTS})</span>
          </h2>
          <p className="mt-0.5 text-sm text-slate-600">
            Top 12 sellers first. Categories above (Bundle Deals last). Use filters to narrow.
          </p>
          <Suspense fallback={<div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 max-w-5xl mx-auto"><div className="aspect-square animate-pulse rounded-xl bg-slate-100" /><div className="aspect-square animate-pulse rounded-xl bg-slate-100" /><div className="aspect-square animate-pulse rounded-xl bg-slate-100" /><div className="aspect-square animate-pulse rounded-xl bg-slate-100" /></div>}>
            <StoreProductsList />
          </Suspense>
        </section>
      </Container>

      {/* Shop hero – green chemistry / lab flask image */}
      <section
        className="relative flex min-h-[250px] flex-col justify-end bg-[#2854a6] bg-cover bg-center bg-no-repeat sm:min-h-[300px]"
        style={{ backgroundImage: "url('/images/home/lab.jpg')" }}
        aria-label="Shop banner"
      >
        <div className="absolute inset-0 bg-[#2854a6]/50" aria-hidden="true" />
        <div className="relative z-10 px-5 py-8 text-center sm:px-6 sm:py-10">
          <div className="mx-auto max-w-4xl">
            <h3 className="mb-4 text-lg font-semibold text-white drop-shadow-md sm:text-xl">
              Trusted by Over 50,000+ Happy Customers
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
              50,000+
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
