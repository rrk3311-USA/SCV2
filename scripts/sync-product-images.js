#!/usr/bin/env node
/**
 * Scan public/images/products/{sku}/ and build a JSON map of sku -> image paths
 * so product pages can show all images in the swipe (not just the one in TOP_PRODUCTS).
 *
 * Run from repo root: node SCV2/scripts/sync-product-images.js
 * Or from SCV2: node scripts/sync-product-images.js
 */

const path = require("path");
const fs = require("fs");

const EXT = [".png", ".jpg", ".jpeg", ".webp"];
const productsDir = path.join(__dirname, "..", "public", "images", "products");
const outPath = path.join(__dirname, "..", "src", "data", "product-images.json");

if (!fs.existsSync(productsDir)) {
  console.warn("Missing", productsDir);
  fs.writeFileSync(outPath, "{}", "utf8");
  process.exit(0);
}

const skuDirs = fs.readdirSync(productsDir, { withFileTypes: true })
  .filter((d) => d.isDirectory() && !d.name.startsWith("."));

const map = {};
for (const dir of skuDirs) {
  const sku = dir.name;
  const dirPath = path.join(productsDir, sku);
  const files = fs.readdirSync(dirPath)
    .filter((f) => EXT.includes(path.extname(f).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  if (files.length) {
    map[sku] = files.map((f) => `/images/products/${sku}/${f}`);
  }
}

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(map, null, 2), "utf8");
console.log("Wrote", outPath, "—", Object.keys(map).length, "SKUs with images");
process.exit(0);
