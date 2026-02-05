import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { getProductBySlug } from "@/data/products";
import { ROUTES, SITE_BASE } from "@/lib/constants";
import {
  Package,
  Info,
  ListChecks,
  FileText,
  ShoppingCart,
  Flask,
} from "@phosphor-icons/react/dist/ssr";
import { ProductImageSwipe } from "@/components/ProductImageSwipe";
import { ProductPurchaseBlock } from "@/components/ProductPurchaseBlock";
import { ViewItemTracker } from "@/components/ViewItemTracker";
import { RecentlyViewed } from "@/components/RecentlyViewed";
import { RecentlyViewedTracker } from "@/components/RecentlyViewedTracker";
import { YotpoReviews } from "@/components/YotpoReviews";
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

  const productUrl = `${SITE_BASE}${ROUTES.product(product.slug)}`;
  const imageUrl = product.image.startsWith("http") ? product.image : `${SITE_BASE}${product.image}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.sku,
    ...(product.gtin && { gtin13: product.gtin }),
    brand: { "@type": "Brand", name: "Success Chemistry" },
    image: product.images?.length ? product.images.map((src) => (src.startsWith("http") ? src : `${SITE_BASE}${src}`)) : [imageUrl],
    url: productUrl,
    description: product.short_description ?? product.description ?? product.name,
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: "USD",
      price: product.price,
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ViewItemTracker product={{ slug: product.slug, sku: product.sku, name: product.name, price: product.price, category: product.category }} />
      <RecentlyViewedTracker slug={product.slug} name={product.name} image={product.image} />
      <Container className="py-6 sm:py-10">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Gallery: swipe only, no zoom, no open-to-gallery */}
          <div className="w-full">
            <ProductImageSwipe images={product.images} alt={product.name} />
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
            <ProductPurchaseBlock product={product} />
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

        <YotpoReviews
          sku={product.sku}
          name={product.name}
          price={product.price}
          productUrl={productUrl}
          imageUrl={imageUrl}
        />

        <RecentlyViewed excludeSlug={product.slug} />
      </Container>
    </div>
  );
}
