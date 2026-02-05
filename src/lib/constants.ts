/**
 * Shared constants – one place for colors and copy.
 */

/** Visitor count for trust banner – set NEXT_PUBLIC_VISITOR_COUNT from GA/Vercel Analytics (e.g. annual). Not labeled as yearly. */
export function getVisitorCount(): string {
  const raw =
    typeof process !== "undefined" && process.env?.NEXT_PUBLIC_VISITOR_COUNT
      ? process.env.NEXT_PUBLIC_VISITOR_COUNT.trim()
      : "";
  const n = raw ? parseInt(raw.replace(/\D/g, ""), 10) : 50000;
  if (!Number.isFinite(n) || n < 0) return "50,000+";
  if (n >= 1000000) return `${(n / 1000000).toFixed(1).replace(/\.0$/, "")}M+`;
  return `${n.toLocaleString()}+`;
}

export const SC = {
  blue: "#2854a6",
  blueDark: "#1e3a8a",
  blueLight: "rgba(40, 84, 166, 0.1)",
} as const;

export const ROUTES = {
  home: "/",
  store: "/store",
  cart: "/cart",
  admin: "/admin",
  preview: "/preview",
  blog: "/blog",
  blogPost: (slug: string) => `/blog/${slug}`,
  blogSample: "/blog-sample",
  blogIngredients: "/blog/ingredients-we-use",
  product: (slug: string) => `/product/${slug}`,
  termsOfService: "/terms-of-service",
  shippingReturns: "/shipping-returns",
  paymentPolicy: "/payment-policy",
  privacyPolicy: "/privacy-policy",
  contact: "/contact",
} as const;

export const CONTACT = {
  email: "info@successchemistry.com",
  phone: "(929) 642-7553",
  phoneRaw: "+19296427553",
  address: "8400 West Sunset Road",
  cityStateZip: "Las Vegas NV, 89113",
} as const;

/** Free shipping threshold (USD) for cart upsell messaging. */
export const FREE_SHIPPING_THRESHOLD = 50;

/** Site origin for absolute URLs (e.g. Yotpo, OG tags). Set NEXT_PUBLIC_SITE_URL in production. */
export const SITE_BASE =
  (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_SITE_URL) ||
  "https://www.successchemistry.com";

/** Google Merchant Center account ID (Skinny Bean / Success Chemistry). Use same product identifiers (sku, gtin, brand) so Google can link Merchant Center reviews to our product pages. */
export const GOOGLE_MERCHANT_CENTER_ID = "118364265";
