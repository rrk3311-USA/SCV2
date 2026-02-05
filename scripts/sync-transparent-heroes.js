#!/usr/bin/env node
/**
 * Copy transparent hero images (01.png) from deploy-site into SCV2.
 * Run from repo root: node SCV2/scripts/sync-transparent-heroes.js
 *
 * Copies deploy-site/public/images/products/<sku>/01.png
 * → SCV2/public/images/products/<sku>/01.png
 * for every product folder that has 01.png in deploy-site.
 * Use this after adding a batch of transparent hero PNGs to the other project.
 */

const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "../..");
const sourceDir = path.join(repoRoot, "deploy-site", "public", "images", "products");
const targetDir = path.join(repoRoot, "SCV2", "public", "images", "products");

if (!fs.existsSync(sourceDir)) {
  console.warn("Source not found:", sourceDir);
  process.exit(1);
}

let copied = 0;
let skipped = 0;
const dirs = fs.readdirSync(sourceDir, { withFileTypes: true }).filter((d) => d.isDirectory() && !d.name.startsWith("."));

for (const dir of dirs) {
  const sku = dir.name;
  const srcFile = path.join(sourceDir, sku, "01.png");
  if (!fs.existsSync(srcFile)) {
    skipped++;
    continue;
  }
  const destFolder = path.join(targetDir, sku);
  const destFile = path.join(destFolder, "01.png");
  fs.mkdirSync(destFolder, { recursive: true });
  fs.copyFileSync(srcFile, destFile);
  copied++;
  console.log("Copied", sku, "01.png");
}

console.log("\nDone. Copied:", copied, "| Skipped (no 01.png):", skipped);
process.exit(0);
