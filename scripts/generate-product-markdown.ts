#!/usr/bin/env npx tsx
/**
 * Generate markdown files for products so GPT/SEO crawlers can index product copy.
 * Writes to content/products/{slug}.md for TOP_12 (or all products with full copy).
 *
 * Run from SCV2: npx tsx scripts/generate-product-markdown.ts
 * Or: npm run generate-product-md
 */

import * as fs from "fs";
import * as path from "path";
import { TOP_12, getProductBySlug } from "../src/data/products";
import { SITE_BASE } from "../src/lib/constants";

const CONTENT_DIR = path.join(__dirname, "..", "content", "products");
/** Also write to public so MD is served at /product-pages/{slug}.md for GPT/crawlers */
const PUBLIC_DIR = path.join(__dirname, "..", "public", "product-pages");
const BASE = (typeof SITE_BASE === "string" ? SITE_BASE : "https://www.successchemistry.com").replace(/\/$/, "");

function escapeMd(text: string): string {
  return text.replace(/\n/g, " ").trim();
}

function productToMarkdown(p: {
  slug: string;
  sku: string;
  name: string;
  price: number;
  category: string;
  short_description?: string;
  description?: string;
  suggested_use?: string;
  supplement_facts?: string;
  ingredients?: string;
  key_search_terms?: string;
  faqs?: { question: string; answer: string }[];
}): string {
  const url = `${BASE}/product/${p.slug}`;
  const lines: string[] = [
    `# ${p.name}`,
    "",
    `**Product page:** [View on Success Chemistry](${url})`,
    "",
    `| | |`,
    `| --- | --- |`,
    `| **SKU** | ${p.sku} |`,
    `| **Category** | ${p.category} |`,
    `| **Price** | $${p.price.toFixed(2)} USD |`,
    "",
  ];

  if (p.short_description) {
    lines.push("## Summary", "", escapeMd(p.short_description), "");
  }

  if (p.description) {
    lines.push("## Description", "", p.description.replace(/\n\n/g, "\n\n").trim(), "");
  }

  if (p.suggested_use) {
    lines.push("## Suggested use", "", escapeMd(p.suggested_use), "");
  }

  if (p.supplement_facts) {
    lines.push("## Supplement facts", "", p.supplement_facts.replace(/\n/g, "  \n"), "");
  }

  if (p.ingredients) {
    lines.push("## Ingredients", "", p.ingredients.replace(/\n/g, "  \n"), "");
  }

  if (p.faqs && p.faqs.length > 0) {
    lines.push("## FAQs", "");
    for (const faq of p.faqs) {
      lines.push(`### ${faq.question}`, "", faq.answer, "");
    }
  }

  if (p.key_search_terms) {
    lines.push("## Keywords", "", escapeMd(p.key_search_terms), "");
  }

  lines.push("---", "", `[Buy ${p.name}](${url}) | [Shop all](${BASE}/store)`);
  return lines.join("\n");
}

function main() {
  for (const dir of [CONTENT_DIR, PUBLIC_DIR]) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }

  let count = 0;
  for (const p of TOP_12) {
    const resolved = getProductBySlug(p.slug) ?? p;
    const md = productToMarkdown(resolved);
    const safeSlug = p.slug.replace(/[^a-zA-Z0-9-_]/g, "-");
    fs.writeFileSync(path.join(CONTENT_DIR, `${safeSlug}.md`), md, "utf8");
    fs.writeFileSync(path.join(PUBLIC_DIR, `${safeSlug}.md`), md, "utf8");
    count++;
  }

  console.log(`Wrote ${count} product markdown files to content/products and public/product-pages`);
}

main();
