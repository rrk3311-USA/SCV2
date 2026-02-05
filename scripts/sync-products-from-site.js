#!/usr/bin/env node
/**
 * Sync product COPY from deploy-site/products-data.js into SCV2.
 *
 * Reads PRODUCTS_DATA from ../deploy-site/products-data.js and writes
 * src/data/products-from-site.json (description overlay keyed by SKU).
 * getProductBySlug() in products.ts merges this overlay so product pages
 * use the same descriptions as the main site.
 *
 * Run from repo root: node SCV2/scripts/sync-products-from-site.js
 * Or from SCV2: node scripts/sync-products-from-site.js
 *
 * If require() returns empty (e.g. large file), run from deploy-site:
 *   cd deploy-site && node -e "const m=require('./products-data.js'); const fs=require('fs'); ..."
 * or copy products-from-site.json from the main site build.
 */

const path = require("path");
const fs = require("fs");

const repoRoot = path.resolve(__dirname, "../..");
const deployPath = path.join(repoRoot, "deploy-site", "products-data.js");
const outPath = path.join(repoRoot, "SCV2", "src", "data", "products-from-site.json");

let PRODUCTS_DATA;
try {
  const mod = require(deployPath);
  PRODUCTS_DATA = mod.PRODUCTS_DATA || mod;
} catch (e) {
  console.error("Could not load deploy-site/products-data.js:", e.message);
  process.exit(1);
}

if (!PRODUCTS_DATA || typeof PRODUCTS_DATA !== "object" || Object.keys(PRODUCTS_DATA).length === 0) {
  console.warn("PRODUCTS_DATA empty or missing. Run from deploy-site or copy products-from-site.json manually.");
  console.warn("Writing empty overlay so app still runs.");
  PRODUCTS_DATA = {};
}

const overlay = {};
for (const [sku, p] of Object.entries(PRODUCTS_DATA)) {
  if (!p || typeof p !== "object") continue;
  const entry = {};
  if (p.description != null) entry.description = p.description;
  if (p.short_description != null) entry.short_description = p.short_description;
  if (p.suggested_use != null) entry.suggested_use = p.suggested_use;
  if (p.supplement_facts != null) entry.supplement_facts = p.supplement_facts;
  if (p.ingredients != null) entry.ingredients = p.ingredients;
  if (p.faqs != null && Array.isArray(p.faqs)) entry.faqs = p.faqs;
  if (Object.keys(entry).length > 0) overlay[sku] = entry;
}

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(overlay, null, 2), "utf8");
console.log("Wrote", outPath, "—", Object.keys(overlay).length, "SKUs");
process.exit(0);
