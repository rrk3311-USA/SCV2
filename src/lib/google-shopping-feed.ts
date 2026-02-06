/**
 * Build Google Merchant Center / Google Shopping feed XML (RSS 2.0 + g: namespace).
 * Used by the API routes and by the SFTP upload script.
 *
 * Two feeds:
 *  - International (all countries, no country-specific shipping/currency restrictions)
 *  - USA supplemental (US-only, USD, free shipping, feed_label US for approved status)
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
  // Always use production domain for Google Shopping feed to avoid mismatched domains
  const raw = process.env.NEXT_PUBLIC_SITE_URL || "https://www.successchemistry.com";
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

/* ---------- shared item builder ---------- */

type FeedVariant = "international" | "us";

function buildItemXml(p: Product, base: string, variant: FeedVariant): string {
  // Clean text first, then escape, then truncate to account for XML entities
  const cleanedTitle = cleanText(p.name, 200); // Pre-truncate at 200 to be safe
  const escapedTitle = escapeXml(cleanedTitle);
  const title = escapedTitle.length > 150 ? escapedTitle.substring(0, 147) + "..." : escapedTitle;
  const description = escapeXml(cleanText(p.short_description || p.description || p.name, 5000));
  const link = `${base}${ROUTES.product(p.slug)}`;
  const imgLink = imageUrl(p, base, p.image);
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

  const identifierBlock = gtin
    ? `<g:gtin>${escapeXml(gtin)}</g:gtin>`
    : `<g:identifier_exists>false</g:identifier_exists>\n      <g:mpn>${escapeXml(p.sku)}</g:mpn>`;

  // --- variant-specific blocks ---
  let shippingBlock = "";
  let feedLabelBlock = "";

  if (variant === "us") {
    shippingBlock = `
      <g:shipping>
        <g:country>US</g:country>
        <g:service>Standard</g:service>
        <g:price>0.00 USD</g:price>
      </g:shipping>
      <g:shipping>
        <g:country>US</g:country>
        <g:service>Express</g:service>
        <g:price>15.00 USD</g:price>
      </g:shipping>`;
    feedLabelBlock = `\n      <g:feed_label>US</g:feed_label>`;
  }

  return `
    <item>
      <g:id>${escapeXml(p.sku)}</g:id>
      <g:title>${title}</g:title>
      <g:description>${description}</g:description>
      <g:link>${escapeXml(link)}</g:link>
      <g:image_link>${escapeXml(imgLink)}</g:image_link>
      <g:price>${price}</g:price>
      <g:availability>in_stock</g:availability>
      <g:brand>${escapeXml(brand)}</g:brand>
      <g:condition>new</g:condition>
      <g:google_product_category>${escapeXml(GOOGLE_PRODUCT_CATEGORY)}</g:google_product_category>
      <g:product_type>${productType}</g:product_type>
      ${identifierBlock}
      <g:merchant_item_id>${escapeXml(p.sku)}</g:merchant_item_id>
${additionalImages ? `\n${additionalImages}` : ""}${shippingBlock}${feedLabelBlock}
      <g:consumer_notice>${escapeXml(CONSUMER_NOTICE)}</g:consumer_notice>
      <g:custom_label_0>${escapeXml(p.category)}</g:custom_label_0>
      <g:custom_label_1>${escapeXml(customLabel1)}</g:custom_label_1>
      <g:custom_label_2>${escapeXml(customLabel2)}</g:custom_label_2>
    </item>`;
}

/* ---------- feed builders ---------- */

function buildFeed(variant: FeedVariant): string {
  const base = getFeedBaseUrl();
  const feedTitle = variant === "us"
    ? "Success Chemistry – US Product Feed"
    : "Success Chemistry – International Product Feed";

  const channelStart = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>${escapeXml(feedTitle)}</title>
    <link>${escapeXml(base)}</link>
    <description>Premium dietary supplements and vitamins – Success Chemistry</description>
`;

  let items: string;
  try {
    // Get merged products with overlay data (GTINs, descriptions, prices, etc.)
    const mergedProducts = TOP_PRODUCTS
      .map((p) => getProductBySku(p.sku))
      .filter((p): p is Product => p != null);

    items = mergedProducts
      .filter((p) => {
        const img = imageUrl(p, base, p.image);
        return !!img && img.startsWith("https://");
      })
      .map((p) => buildItemXml(p, base, variant))
      .join("");
  } catch (err) {
    console.error(`[google-shopping feed/${variant}]`, err);
    items = "<!-- Feed error -->";
  }

  return channelStart + items + `
  </channel>
</rss>`;
}

/* ---------- public API ---------- */

/**
 * International feed (all countries). No country-specific shipping or Korea exclusion.
 * Use as primary data source in Merchant Center.
 * Endpoint: /feeds/google-shopping
 */
export function buildGoogleShoppingFeedXml(): string {
  return buildFeed("international");
}

/**
 * USA supplemental feed. Adds US shipping (free standard + $15 express),
 * feed_label=US so Merchant Center maps it to the United States target.
 * Use as supplemental data source in Merchant Center for the US target.
 * Endpoint: /feeds/google-shopping-us
 */
export function buildGoogleShoppingFeedXmlUS(): string {
  return buildFeed("us");
}
