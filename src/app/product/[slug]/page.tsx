import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { getProductBySlug } from "@/data/products";
import { ROUTES } from "@/lib/constants";
import {
  Package,
  Info,
  ListChecks,
  FileText,
  ShoppingCart,
  Flask,
} from "@phosphor-icons/react/dist/ssr";
import { AddToCartButton } from "@/components/AddToCartButton";
import { PayPalProductButtons } from "@/components/PayPalProductButtons";
import { ProductHeroImage } from "@/components/ProductHeroImage";
import { ViewItemTracker } from "@/components/ViewItemTracker";
import { RecentlyViewed } from "@/components/RecentlyViewed";
import { RecentlyViewedTracker } from "@/components/RecentlyViewedTracker";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: "Product Not Found" };
  return {
    title: `${product.name} – Success Chemistry`,
    description: product.short_description ?? product.name,
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const sections = [
    product.description && {
      title: "About",
      icon: Info,
      content: product.description,
      className: "whitespace-pre-line",
    },
    product.suggested_use && {
      title: "Suggested Use",
      icon: ListChecks,
      content: product.suggested_use,
    },
    product.supplement_facts && {
      title: "Supplement Facts",
      icon: FileText,
      content: product.supplement_facts,
      className: "whitespace-pre-line font-mono text-sm",
    },
    product.ingredients && {
      title: "Ingredients",
      icon: Package,
      content: product.ingredients,
      className: "whitespace-pre-line",
    },
  ].filter(Boolean) as Array<{
    title: string;
    icon: typeof Info;
    content: string;
    className?: string;
  }>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <ViewItemTracker product={{ slug: product.slug, sku: product.sku, name: product.name, price: product.price, category: product.category }} />
      <RecentlyViewedTracker slug={product.slug} name={product.name} image={product.image} />
      <Container className="py-6 sm:py-10">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Gallery */}
          <div className="space-y-4">
            <ProductHeroImage
              src={product.image}
              alt={product.name}
              className="object-contain p-4"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {product.images.slice(0, 6).map((src, i) => (
                  <div
                    key={i}
                    className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white"
                  >
                    <Image
                      src={src}
                      alt=""
                      fill
                      className="object-contain p-1"
                      sizes="80px"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <p className="text-sm font-medium text-slate-500">{product.category}</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
              {product.name}
            </h1>
            {product.short_description && (
              <p className="mt-3 text-slate-600 leading-relaxed">
                {product.short_description}
              </p>
            )}
            <p className="mt-4 text-2xl font-bold text-[#2854a6]">
              ${product.price.toFixed(2)}
            </p>

            {/* Bundle options */}
            {product.bundle_options && product.bundle_options.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-slate-700">Options</p>
                <div className="flex flex-wrap gap-2">
                  {product.bundle_options.map((opt) => (
                    <button
                      key={opt.label}
                      type="button"
                      className="rounded-lg border-2 border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-[#2854a6] hover:bg-[#2854a6]/5"
                    >
                      {opt.label}
                      {opt.savePercent != null && (
                        <span className="ml-1 text-green-600">
                          Save {opt.savePercent}%
                        </span>
                      )}
                      <span className="ml-1">${opt.price.toFixed(2)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              <AddToCartButton
                sku={product.sku}
                name={product.name}
                price={product.price}
                image={product.image}
              />
            </div>

            <PayPalProductButtons
              sku={product.sku}
              name={product.name}
              price={product.price}
            />
          </div>
        </div>

        {/* Sections: About, Suggested Use, Supplement Facts, Ingredients */}
        <div className="mt-12 space-y-8 border-t border-slate-200 pt-10">
          {sections.map(({ title, icon: Icon, content, className = "" }) => (
            <section key={title}>
              <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                <Icon size={22} weight="regular" className="text-[#2854a6]" />
                {title}
              </h2>
              <div
                className={`mt-2 text-slate-600 leading-relaxed ${className}`}
              >
                {content}
              </div>
            </section>
          ))}
        </div>

        {/* FAQs */}
        {product.faqs && product.faqs.length > 0 && (
          <section className="mt-12 border-t border-slate-200 pt-10">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
              <Info size={22} weight="regular" className="text-[#2854a6]" />
              Frequently Asked Questions
            </h2>
            <ul className="mt-4 space-y-4">
              {product.faqs.map((faq, i) => (
                <li key={i} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="font-medium text-slate-900">{faq.question}</p>
                  <p className="mt-2 text-slate-600 text-sm leading-relaxed">
                    {faq.answer}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        )}

        <RecentlyViewed excludeSlug={product.slug} />
      </Container>
    </div>
  );
}
