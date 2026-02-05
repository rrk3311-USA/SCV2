/**
 * Build Google Merchant Center / Google Shopping feed XML (RSS 2.0 + g: namespace).
 * Used by the API route and by the SFTP upload script.
 *
 * Uses same identifiers (id=sku, gtin, brand, link) as product page JSON-LD so Google
 * can link Merchant Center reviews to our product URLs.
 */

import { TOP_PRODUCTS, getProductBySku } from "@/data/products";
import { ROUTES } from "@/lib/constants";
import type { Product } from "@/data/products";

const GOOGLE_PRODUCT_CATEGORY =
  "Health & Beauty > Health Care > Fitness & Nutrition > Vitamins & Supplements";
const CONSUMER_NOTICE =
  "These statements have not been evaluated by the FDA. This product is not intended to diagnose, treat, cure, or prevent any disease.";

export function getFeedBaseUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://www.successchemistry.com");
  const base = raw.replace(/\/$/, "");
  return base.startsWith("http://") ? base.replace("http://", "https://") : base;
}

function escapeXml(text: string): string {
  if (!text) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function stripHtml(text: string): string {
  if (!text) return "";
  return String(text).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function cleanText(text: string, maxLen: number): string {
  if (!text) return "";
  const cleaned = stripHtml(text)
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/[^\x20-\x7E]/g, "")
    .trim();
  return cleaned.length > maxLen ? cleaned.substring(0, maxLen) : cleaned;
}

function imageUrl(p: Product, base: string, src: string): string {
  if (!src) return "";
  return src.startsWith("http") ? src : `${base}${src.startsWith("/") ? "" : "/"}${src}`;
}

/** Build full RSS XML string for the product feed. */
export function buildGoogleShoppingFeedXml(): string {
  const base = getFeedBaseUrl();

  const channelStart = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>Success Chemistry – Product Feed</title>
    <link>${escapeXml(base)}</link>
    <description>Premium dietary supplements and vitamins – Success Chemistry</description>
`;

  let items: string;
  try {
    // Get merged products with overlay data (GTINs, descriptions, etc.)
    const mergedProducts = TOP_PRODUCTS.map((p) => getProductBySku(p.sku)).filter((p): p is Product => p != null);

    items = mergedProducts.filter((p) => {
      const imageLink = imageUrl(p, base, p.image);
      return !!imageLink && imageLink.startsWith("https://");
    }).map((p) => {
      const title = escapeXml(cleanText(p.name, 150));
      const description = escapeXml(cleanText(p.short_description || p.description || p.name, 5000));
      const link = `${base}${ROUTES.product(p.slug)}`;
      const imageLink = imageUrl(p, base, p.image);
      const price = `${p.price.toFixed(2)} USD`;
      const brand = "Success Chemistry";
      const gtin = (p.gtin || p.upc || "").trim();
      const productType = `Health > Supplements > ${escapeXml(p.category)}`;
      const customLabel1 = p.price < 30 ? "Low Price" : p.price < 50 ? "Mid Price" : "High Price";
      const customLabel2 = /\d\s*[-]?pack|bundle/i.test(p.name) ? "Bundle" : "Single";

      const additionalImages = (p.images || [])
        .filter((src) => src !== p.image)
        .slice(0, 9)
        .map((src) => `      <g:additional_image_link>${escapeXml(imageUrl(p, base, src))}</g:additional_image_link>`)
        .join("\n");

      return `
    <item>
      <g:id>${escapeXml(p.sku)}</g:id>
      <g:title>${title}</g:title>
      <g:description>${description}</g:description>
      <g:link>${escapeXml(link)}</g:link>
      <g:image_link>${escapeXml(imageLink)}</g:image_link>
      <g:price>${price}</g:price>
      <g:availability>in_stock</g:availability>
      <g:brand>${escapeXml(brand)}</g:brand>
      <g:condition>new</g:condition>
      <g:google_product_category>${escapeXml(GOOGLE_PRODUCT_CATEGORY)}</g:google_product_category>
      <g:product_type>${productType}</g:product_type>
      ${gtin ? `<g:gtin>${escapeXml(gtin)}</g:gtin>` : `<g:identifier_exists>false</g:identifier_exists>
      <g:mpn>${escapeXml(p.sku)}</g:mpn>`}
      <g:merchant_item_id>${escapeXml(p.sku)}</g:merchant_item_id>
${additionalImages ? `\n${additionalImages}` : ""}
      <g:consumer_notice>${escapeXml(CONSUMER_NOTICE)}</g:consumer_notice>
      <g:custom_label_0>${escapeXml(p.category)}</g:custom_label_0>
      <g:custom_label_1>${escapeXml(customLabel1)}</g:custom_label_1>
      <g:custom_label_2>${escapeXml(customLabel2)}</g:custom_label_2>
    </item>`;
    }).join("");
  } catch (err) {
    console.error("[google-shopping feed]", err);
    items = "<!-- Feed error -->";
  }

  return channelStart + items + `
  </channel>
</rss>`;
}
