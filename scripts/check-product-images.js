#!/usr/bin/env node
/**
 * Check that every product image path (product-images.json and products.ts fallbacks)
 * exists on disk. Report missing files and products with no/single image.
 *
 * Run from SCV2: node scripts/check-product-images.js
 */

const path = require("path");
const fs = require("fs");

const productsDir = path.join(__dirname, "..", "public", "images", "products");
const productImagesPath = path.join(__dirname, "..", "src", "data", "product-images.json");

// Load product-images.json (what getProductBySlug uses when present)
let productImagesBySku = {};
try {
  productImagesBySku = require(productImagesPath);
} catch (e) {
  console.warn("No product-images.json found. Run: node scripts/sync-product-images.js");
}

const publicDir = path.join(__dirname, "..", "public");

function pathExists(relativePath) {
  const full = path.join(publicDir, relativePath.replace(/^\//, ""));
  return fs.existsSync(full);
}

const missingBySku = {};
let totalMissing = 0;
let singleImageSkus = [];
let noImagesSkus = [];

for (const [sku, paths] of Object.entries(productImagesBySku)) {
  if (!Array.isArray(paths) || paths.length === 0) {
    noImagesSkus.push(sku);
    continue;
  }
  if (paths.length === 1) singleImageSkus.push(sku);
  const missing = paths.filter((p) => !pathExists(p));
  if (missing.length) {
    missingBySku[sku] = missing;
    totalMissing += missing.length;
  }
}

// Report
console.log("\n=== Product image check ===\n");

if (totalMissing > 0) {
  console.log("Missing image files (" + totalMissing + " total):");
  for (const [sku, arr] of Object.entries(missingBySku)) {
    console.log("  " + sku + ":");
    arr.forEach((p) => console.log("    " + p));
  }
  console.log("");
} else {
  console.log("All paths in product-images.json exist on disk.\n");
}

if (noImagesSkus.length) {
  console.log("SKUs with no images in product-images.json: " + noImagesSkus.join(", ") + "\n");
}

console.log(
  "Products with only 1 image in product-images.json: " +
    singleImageSkus.length +
    " (" +
    singleImageSkus.slice(0, 15).join(", ") +
    (singleImageSkus.length > 15 ? " ..." : "") +
    ")\n"
);

// Check TOP_PRODUCTS that might not be in product-images.json (folder missing)
const productsTsPath = path.join(__dirname, "..", "src", "data", "products.ts");
const productsTs = fs.readFileSync(productsTsPath, "utf8");
const skuInTs = productsTs.match(/sku:\s*"([^"]+)"/g);
const allSkusInTs = skuInTs ? skuInTs.map((s) => s.replace(/sku:\s*"/, "").replace(/"$/, "")) : [];
const skusWithoutFolder = allSkusInTs.filter((sku) => {
  const dir = path.join(productsDir, sku);
  return !fs.existsSync(dir) || !fs.statSync(dir).isDirectory();
});

if (skusWithoutFolder.length) {
  console.log("Products in products.ts with no image folder (will 404): " + skusWithoutFolder.join(", ") + "\n");
}

// Summary
console.log("Summary:");
console.log("  SKUs in product-images.json: " + Object.keys(productImagesBySku).length);
console.log("  Missing files: " + totalMissing);
console.log("  Products with only 1 image: " + singleImageSkus.length);
console.log("  Products in products.ts with no folder: " + skusWithoutFolder.length);

// Products by image count (find ones with few images to add more)
const countToSkus = {};
Object.entries(productImagesBySku).forEach(([sku, paths]) => {
  const n = Array.isArray(paths) ? paths.length : 0;
  if (!countToSkus[n]) countToSkus[n] = [];
  countToSkus[n].push(sku);
});
console.log("\nImage count → SKUs (consider adding more images for low-count products):");
[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].filter((n) => countToSkus[n]?.length).forEach((n) => {
  console.log("  " + n + " image(s): " + countToSkus[n].join(", "));
});
