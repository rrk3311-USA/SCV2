import { MetadataRoute } from "next";
import { TOP_PRODUCTS, TOP_12 } from "@/data/products";
import { BLOG_POST_SLUGS } from "@/data/blog-posts";
import { ROUTES } from "@/lib/constants";

const BASE =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://scv2-success-chemistry.vercel.app");

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${BASE}${ROUTES.store}`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}${ROUTES.cart}`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}${ROUTES.contact}`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}${ROUTES.privacyPolicy}`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.5 },
    { url: `${BASE}${ROUTES.termsOfService}`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.5 },
    { url: `${BASE}${ROUTES.shippingReturns}`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.5 },
    { url: `${BASE}${ROUTES.paymentPolicy}`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.5 },
    { url: `${BASE}${ROUTES.blog}`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/feeds/google-shopping`, lastModified: new Date(), changeFrequency: "daily", priority: 0.6 },
  ];

  const blogRoutes: MetadataRoute.Sitemap = BLOG_POST_SLUGS.map((slug) => ({
    url: `${BASE}${ROUTES.blogPost(slug)}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const productRoutes: MetadataRoute.Sitemap = TOP_PRODUCTS.map((p) => ({
    url: `${BASE}${ROUTES.product(p.slug)}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Markdown product pages for GPT/SEO (TOP_12) – served at /product-pages/{slug}.md
  const productPageMdSlug = (slug: string) => slug.replace(/[^a-zA-Z0-9-_]/g, "-");
  const productPageRoutes: MetadataRoute.Sitemap = TOP_12.map((p) => ({
    url: `${BASE}/product-pages/${productPageMdSlug(p.slug)}.md`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...blogRoutes, ...productRoutes, ...productPageRoutes];
}
