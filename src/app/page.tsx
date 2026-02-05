import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/Container";
import { HeroBannerImage } from "@/components/HeroBannerImage";
import { ProductCarousel } from "@/components/ProductCarousel";
import { ProductHeroImage } from "@/components/ProductHeroImage";
import { ViewItemListTracker } from "@/components/ViewItemListTracker";
import { HomeVideo } from "@/components/HomeVideo";
import { TOP_7 } from "@/data/products";
import { ROUTES } from "@/lib/constants";
import { Flask, Factory, Leaf, CaretRight } from "@phosphor-icons/react/dist/ssr";

/** Top sellers shown in homepage carousel (exclude specific products). */
const CAROUSEL_PRODUCTS = TOP_7.filter(
  (p) => p.slug !== "1960-102" && p.slug !== "B072MMW71X-1"
);

/** Home page – clone of main site (localhost:8080) layout and media only, clean code. */
export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero – full width, touches header divider; section background edge-to-edge */}
      <section className="relative flex min-h-[260px] w-full max-h-[360px] items-start justify-center overflow-hidden rounded-b-2xl bg-[#2854a6] shadow-sm sm:min-h-[280px] lg:min-h-[260px] lg:max-h-[340px]">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40"
          style={{ backgroundImage: "url('/images/home/BannerTOP.jpg')" }}
        />
        <div
          className="absolute inset-0 z-[1]"
          style={{ background: "rgba(0, 31, 52, 0.3)" }}
        />
        <div className="relative z-10 flex w-full max-w-[1200px] flex-col items-center justify-center px-4 pt-0">
          <HeroBannerImage />
        </div>
        {/* Frosted bottom bar – same as 8080 */}
        <div
          className="absolute bottom-0 left-0 right-0 z-20 px-5 py-6 sm:px-6"
          style={{
            background: "rgba(255, 255, 255, 0.15)",
            backdropFilter: "blur(20px) saturate(180%)",
            WebkitBackdropFilter: "blur(20px) saturate(180%)",
            borderTop: "1px solid rgba(255, 255, 255, 0.2)",
          }}
        >
          <div className="mx-auto max-w-4xl text-center">
            <h1
              className="text-white"
              style={{
                fontSize: "clamp(2rem, 4vw, 3.5rem)",
                fontWeight: 800,
                textShadow: "0 4px 20px rgba(0,0,0,0.7), 0 2px 10px rgba(0,0,0,0.5)",
                marginBottom: "15px",
                lineHeight: 1.2,
              }}
            >
              FROM EARTH TO FORMULA
            </h1>
            <p
              className="mx-auto max-w-2xl text-white"
              style={{
                fontSize: "clamp(1rem, 2vw, 1.3rem)",
                fontWeight: 500,
                textShadow: "0 3px 15px rgba(0,0,0,0.7), 0 2px 8px rgba(0,0,0,0.5)",
                lineHeight: 1.6,
              }}
            >
              Formulated With The Freshest Nutrients
            </p>
          </div>
        </div>
      </section>

      <Container className="py-6 sm:py-8">
        {/* Top Sellers – carousel style (matches 8080), not full grid */}
        <section className="mt-12">
          <ViewItemListTracker
            items={CAROUSEL_PRODUCTS.map((p) => ({ item_id: p.sku, item_name: p.name, price: p.price, item_category: p.category }))}
            listId="home_top_sellers"
            listName="Top Sellers"
          />
          <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">Top Sellers</h2>
          <p className="mt-2 text-slate-600 text-sm sm:text-base">
            Our best-selling supplements. Scroll the carousel or use the arrows. Tap any product to open its page.
          </p>
          <ProductCarousel products={CAROUSEL_PRODUCTS} />
          <p className="mt-6">
            <Link href={ROUTES.store} className="inline-flex items-center gap-1.5 font-medium text-[#2854a6] hover:underline">
              View all products
              <CaretRight size={18} weight="bold" className="text-[#2854a6]" />
            </Link>
          </p>
        </section>

        {/* Why People Trust Us – new-building image + video in same blue module */}
        <section className="mt-12 rounded-2xl bg-[#2854a6] p-6 shadow-lg sm:p-8">
          <h2 className="text-xl font-semibold text-white sm:text-2xl">Why People Trust Us</h2>
          <p className="mt-2 text-sm text-white/95 sm:text-base">
            3rd party safety testing with both Eurofins and NSF playing crucial roles in ensuring the reliability of dietary supplements by providing essential testing services that uphold high industry standards for quality assurance.
          </p>
          <div className="mt-4 overflow-hidden rounded-2xl border border-white/20 bg-white shadow-sm">
            <div className="relative aspect-[16/9] min-h-[240px] sm:min-h-[300px]">
              <Image
                src="/images/real-factory-images/new-building-full.png"
                alt="New Manufacturing Facility"
                fill
                className="object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 sm:p-5">
                <p className="font-semibold text-white text-sm sm:text-base">State-of-the-Art Facility</p>
                <p className="text-xs text-white/90 sm:text-sm">195,000 sq ft designed for optimal supplement manufacturing</p>
              </div>
            </div>
          </div>
          <div className="mt-5 overflow-hidden rounded-2xl border border-white/20 shadow-sm">
            <div className="relative aspect-video max-h-[500px] w-full">
              <HomeVideo />
            </div>
          </div>
        </section>

        {/* Factory collage – cleanroom first, then LLE, then 2-up and QA */}
        <section className="mt-12 space-y-4">
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
            <div className="relative aspect-[2.2/1] min-h-[160px] sm:min-h-[190px]">
              <Image
                src="/images/real-factory-images/manufacturing-cleanroom-large.png"
                alt="Advanced Manufacturing Cleanroom"
                fill
                className="object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 sm:p-4">
                <p className="font-semibold text-white text-sm">Precision Manufacturing</p>
                <p className="text-xs text-white/90">State-of-the-art cleanroom facilities</p>
              </div>
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
            <Image
              src="/images/home/LLEand2x.png"
              alt="LLE Extraction, 2x Fine Grind, Made to Order Fresh"
              width={1200}
              height={600}
              className="w-full rounded-xl object-cover shadow-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="relative aspect-[4/3] min-h-[120px] overflow-hidden rounded-xl border border-slate-200/80 bg-slate-100 shadow-sm sm:min-h-[140px]">
              <Image
                src="/images/real-factory-images/Screenshot-2024-07-17-at-8.48.51-PM.png"
                alt="Manufacturing"
                fill
                className="object-cover"
              />
            </div>
            <div className="relative aspect-[4/3] min-h-[120px] overflow-hidden rounded-xl border border-slate-200/80 bg-slate-100 shadow-sm sm:min-h-[140px]">
              <Image
                src="/images/real-factory-images/AAAAIMG_2367.jpg"
                alt="Factory"
                fill
                className="object-cover"
              />
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
            <div className="relative aspect-[2.5/1] min-h-[160px] sm:min-h-[200px]">
              <Image
                src="/images/real-factory-images/Screenshot-2024-07-17-at-8.48.34-PM-full.png"
                alt="Quality Control Process"
                fill
                className="object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 sm:p-4">
                <p className="font-semibold text-white text-sm">Advanced Quality Control</p>
                <p className="text-xs text-white/90">Precision manufacturing with automated QA</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features module – same media: features-module.png */}
        <section className="mt-12 rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-50 to-white p-6 shadow-sm sm:flex sm:items-center sm:gap-8 sm:p-8">
          <div className="shrink-0 sm:w-80 lg:w-96">
            <Image
              src="/images/features-module.png"
              alt="Quality Features"
              width={400}
              height={300}
              className="w-full rounded-xl object-cover shadow-md"
            />
          </div>
          <div className="mt-6 space-y-5 sm:mt-0 sm:flex-1">
            <div className="flex gap-4">
              <span className="flex shrink-0 text-[#2854a6]">
                <Flask size={28} weight="regular" />
              </span>
              <div>
                <p className="font-semibold text-slate-900">Quality-First Formulation</p>
                <p className="text-sm text-slate-600">Purpose-built blends combining botanicals with targeted nutrients.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="flex shrink-0 text-[#2854a6]">
                <Factory size={28} weight="regular" />
              </span>
              <div>
                <p className="font-semibold text-slate-900">USA Manufacturing</p>
                <p className="text-sm text-slate-600">Manufactured in the USA with clean, consistent standards.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="flex shrink-0 text-[#2854a6]">
                <Leaf size={28} weight="regular" />
              </span>
              <div>
                <p className="font-semibold text-slate-900">Clean Ingredients</p>
                <p className="text-sm text-slate-600">Non-GMO friendly ingredients for everyday use.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Women's Balance – transparent hero product image */}
        <section className="mt-12 rounded-2xl border border-slate-200/80 bg-gradient-to-br from-blue-50/80 to-white p-6 shadow-sm sm:flex sm:items-center sm:gap-10 sm:p-8">
          <div className="flex w-full max-w-[224px] flex-col items-center sm:w-72 sm:max-w-[280px] sm:shrink-0">
            <ProductHeroImage
              src="/images/products/52274-401/01.png"
              alt="Women's Balance Supplement"
              className="object-contain p-2"
              sizes="(max-width: 640px) 192px, 224px"
            />
            <span className="mt-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">New Release</span>
          </div>
          <div className="mt-6 sm:mt-0">
            <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">Women's Balance — Now Available</h2>
            <p className="mt-2 text-sm text-slate-600 sm:text-base">
              Our newest formula supports feminine wellness with L-Arginine, Maca, Ashwagandha & Ginseng. Clean ingredients, made in the USA.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href={ROUTES.product("52274-401")}
                className="inline-flex items-center justify-center rounded-full bg-[#2854a6] px-5 py-2 text-sm font-semibold text-white no-underline shadow-md transition hover:opacity-90"
              >
                View Product
              </Link>
              <Link
                href={ROUTES.store}
                className="inline-flex items-center justify-center rounded-full border-2 border-[#2854a6] px-5 py-2 text-sm font-semibold text-[#2854a6] no-underline transition hover:bg-[#2854a6] hover:text-white"
              >
                Shop All
              </Link>
            </div>
          </div>
        </section>

        {/* Chat CTA – same media: CTA_chatbot image.png */}
        <Link
          href={ROUTES.contact}
          className="group relative mt-12 flex min-h-[280px] items-center justify-center overflow-hidden rounded-2xl border border-slate-200/80 shadow-sm transition hover:shadow-lg sm:min-h-[350px]"
        >
          <Image
            src="/images/CTA_chatbot image.png"
            alt="Chat with us"
            fill
            className="object-cover object-center transition group-hover:scale-[1.02]"
          />
          <div className="absolute inset-0 bg-[#2854a6]/75 transition group-hover:bg-[#2854a6]/80" />
          <div className="relative z-10 px-6 py-8 text-center text-white">
            <h2 className="text-2xl font-bold sm:text-3xl">Chat with us</h2>
            <p className="mt-2 text-sm text-white/95 sm:text-base">
              Questions about products, orders, or shipping? We&apos;re here to help.
            </p>
            <span className="mt-4 inline-flex rounded-full border-2 border-white/80 px-6 py-2 text-sm font-semibold text-white transition group-hover:bg-white/20">
              Contact Us
            </span>
          </div>
        </Link>
      </Container>
    </div>
  );
}
