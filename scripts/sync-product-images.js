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

// Prefer .png for hero (01) when both .png and .jpg exist; otherwise one per base name.
function pickOnePerBase(files) {
  const byBase = new Map();
  for (const f of files) {
    const base = path.basename(f, path.extname(f));
    const ext = path.extname(f).toLowerCase();
    const existing = byBase.get(base);
    if (!existing) {
      byBase.set(base, f);
    } else if (base === "01" && ext === ".png") {
      byBase.set(base, f);
    } else if (base !== "01" && ext === ".png" && path.extname(existing).toLowerCase() !== ".png") {
      byBase.set(base, f);
    }
  }
  return Array.from(byBase.values()).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

const map = {};
for (const dir of skuDirs) {
  const sku = dir.name;
  const dirPath = path.join(productsDir, sku);
  const files = fs.readdirSync(dirPath)
    .filter((f) => EXT.includes(path.extname(f).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  if (files.length) {
    const chosen = pickOnePerBase(files);
    map[sku] = chosen.map((f) => `/images/products/${sku}/${f}`);
  }
}

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(map, null, 2), "utf8");
console.log("Wrote", outPath, "—", Object.keys(map).length, "SKUs with images");
process.exit(0);
