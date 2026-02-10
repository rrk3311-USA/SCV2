/**
 * One-time import: sync all products from the built-in catalog (TOP_PRODUCTS + overlays)
 * into Supabase `products` table so the store can use Supabase as the catalog.
 *
 * Run from SCV2 directory with Supabase env set:
 *   npx tsx scripts/import-products-to-supabase.ts
 * Or: NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/import-products-to-supabase.ts
 *
 * Loads .env.local if present (plain key=value lines, no quotes).
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

// Load .env.local from SCV2 or parent folder (success007)
function loadEnvLocal() {
  const cwd = process.cwd();
  for (const dir of [cwd, join(cwd, "..")]) {
    const path = join(dir, ".env.local");
    if (!existsSync(path)) continue;
    const content = readFileSync(path, "utf8");
    for (const line of content.split("\n")) {
      const idx = line.indexOf("=");
      if (idx <= 0) continue;
      const key = line.slice(0, idx).trim();
      let val = line.slice(idx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))
        val = val.slice(1, -1);
      if (key) process.env[key] = val;
    }
    return;
  }
}

loadEnvLocal();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!SUPABASE_URL?.trim() || !SUPABASE_SERVICE_ROLE_KEY?.trim()) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local or env.");
  console.error("  .env.local must be in the SCV2 folder (or the repo root) and contain exactly:");
  console.error('  NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co');
  console.error('  SUPABASE_SERVICE_ROLE_KEY=your-service-role-secret');
  process.exit(1);
}

async function main() {
  // Get catalog with same order as store; then resolve each via getProductBySlug so
  // products-from-site.json (SKU overlay) is merged for full descriptions.
  const { getStoreProductsSortedByBestSellers, getProductBySlug } = await import("../src/data/products");
  const ordered = getStoreProductsSortedByBestSellers();
  if (!ordered?.length) {
    console.error("No products from catalog.");
    process.exit(1);
  }
  const products: Array<NonNullable<ReturnType<typeof getProductBySlug>>> = [];
  for (const p of ordered) {
    const q = getProductBySlug(p.slug);
    if (q) products.push(q);
  }
  if (!products.length) {
    console.error("No products resolved.");
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL.trim(), SUPABASE_SERVICE_ROLE_KEY.trim(), {
    auth: { persistSession: false },
  });

  const rows = products.map((p, i) => ({
    slug: p.slug,
    sku: p.sku,
    name: p.name,
    price: p.price,
    category: p.category || "Best Seller",
    short_description: p.short_description ?? null,
    description: p.description ?? null,
    suggested_use: p.suggested_use ?? null,
    supplement_facts: p.supplement_facts ?? null,
    ingredients: p.ingredients ?? null,
    upc: p.upc ?? null,
    gtin: p.gtin ?? null,
    weight: p.weight ?? null,
    dimensions: p.dimensions ?? null,
    key_search_terms: p.key_search_terms ?? null,
    faqs: Array.isArray(p.faqs) && p.faqs.length ? p.faqs : null,
    image: p.image ?? null,
    images: Array.isArray(p.images) && p.images.length ? p.images : null,
    sort_order: i,
  }));

  // Upsert by slug so re-running doesn't duplicate
  const { error } = await supabase.from("products").upsert(rows, {
    onConflict: "slug",
    ignoreDuplicates: false,
  });

  if (error) {
    console.error("Supabase upsert failed:", error.message);
    if (error.message.includes("Could not find the ") && error.message.includes(" column")) {
      console.error("\nRun supabase/migrations/001_add_product_copy_columns.sql in Supabase SQL Editor, then run this script again.");
    }
    process.exit(1);
  }

  console.log(`Imported ${rows.length} products into Supabase (products table).`);
}

main();
