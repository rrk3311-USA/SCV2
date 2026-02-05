/**
 * Google Merchant Center / Google Shopping product feed (RSS 2.0 + g: namespace).
 * Served at /feeds/google-shopping – use this URL in Merchant Center for SCV2.
 * Keeps product data and tracking in sync with the live catalog.
 */

import { NextResponse } from "next/server";
import { TOP_PRODUCTS } from "@/data/products";
import { ROUTES } from "@/lib/constants";
import type { Product } from "@/data/products";

const GOOGLE_PRODUCT_CATEGORY =
  "Health & Beauty > Health Care > Fitness & Nutrition > Vitamins & Supplements";
const CONSUMER_NOTICE =
  "These statements have not been evaluated by the FDA. This product is not intended to diagnose, treat, cure, or prevent any disease.";

function getBase(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://www.successchemistry.com");
  const base = raw.replace(/\/$/, "");
  // Merchant Center requires HTTPS for link and image_link
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

/** Strip HTML tags for Merchant Center (no HTML allowed in title/description). */
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

export async function GET() {
  const base = getBase();

  const channelStart = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>Success Chemistry – Product Feed</title>
    <link>${base}</link>
    <description>Premium dietary supplements and vitamins – Success Chemistry</description>
`;

  const items = TOP_PRODUCTS.filter((p) => {
    const imageLink = imageUrl(p, base, p.image);
    return !!imageLink && imageLink.startsWith("https://");
  }).map((p) => {
    const title = escapeXml(cleanText(p.name, 150));
    const description = escapeXml(cleanText(p.short_description || p.description || p.name, 5000));
    const link = `${base}${ROUTES.product(p.slug)}`;
    const imageLink = imageUrl(p, base, p.image);
    const price = `${p.price.toFixed(2)} USD`;
    const brand = "Success Chemistry";
    // Use UPC as GTIN when present (Merchant Center accepts UPC in gtin)
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

  const xml = channelStart + items + `
  </channel>
</rss>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
