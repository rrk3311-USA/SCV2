import { Suspense } from "react";
import { Container } from "@/components/Container";
import { CategoryCard } from "@/components/CategoryCard";
import { CATEGORIES } from "@/data/categories";
import { StoreProductsList } from "./StoreProductsList";

export default function StorePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Container className="py-6 sm:py-8">
        {/* Categories – grayscale by default, color + frosted on hover/select */}
        <section className="mt-0">
          <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">
            Shop by Category
          </h2>
          <Suspense fallback={<div className="mt-4 grid h-[200px] animate-pulse rounded-lg bg-slate-100" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }} />}>
            <div className="mt-4 grid gap-5 sm:gap-5" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
              {CATEGORIES.map((cat) => (
                <CategoryCard
                  key={cat.id}
                  id={cat.id}
                  name={cat.name}
                  count={cat.count}
                  image={cat.image}
                />
              ))}
            </div>
          </Suspense>
        </section>

        {/* Product grid */}
        <section className="mt-10">
          <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">
            All Products
          </h2>
          <div className="mt-4">
            <StoreProductsList />
          </div>
        </section>
      </Container>

      {/* Shop hero – transparent PNG (Viewing Shop Banner top) from successchemistry.com/shop */}
      <section
        className="relative flex min-h-[250px] flex-col justify-end bg-[#2854a6] bg-cover bg-center bg-no-repeat sm:min-h-[300px]"
        style={{ backgroundImage: "url('/images/Viewing Shop Banner top.png')" }}
        aria-label="Shop banner"
      >
        <div className="bg-[#f8f9fa] px-5 py-8 text-center sm:px-6 sm:py-10">
          <div className="mx-auto max-w-4xl">
            <h3 className="mb-4 text-lg font-semibold text-[#2854a6] sm:text-xl">
              Trusted by Over 50,000+ Happy Customers
            </h3>
            <p className="mb-2 text-3xl font-extrabold text-[#667eea] sm:text-4xl">50,000+</p>
            <p className="text-base text-slate-600 sm:text-lg">
              Join thousands who&apos;ve transformed their health with our premium supplements
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
