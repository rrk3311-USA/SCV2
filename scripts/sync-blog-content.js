#!/usr/bin/env node
/**
 * Sync blog content from the parent repo (success007/blog-content) into SCV2.
 *
 * Copies the 11 English product-guide .md files into SCV2/content/blog/
 * so the Next.js blog uses the same source as the main site.
 *
 * Run from repo root: node SCV2/scripts/sync-blog-content.js
 * Or from SCV2: node scripts/sync-blog-content.js
 */

const path = require("path");
const fs = require("fs");

const repoRoot = path.resolve(__dirname, "..", "..");
const sourceDir = path.join(repoRoot, "blog-content");
const targetDir = path.join(repoRoot, "SCV2", "content", "blog");

const expectedSlugs = [
  "ashwagandha-complete-guide",
  "babybean-fertility-complete-guide",
  "beauty-sleep-complete-guide",
  "colon-cleanse-complete-guide",
  "hair-growth-complete-guide",
  "irish-sea-moss-complete-guide",
  "liver-cleanse-complete-guide",
  "lung-detox-complete-guide",
  "mushroom-immune-complete-guide",
  "sclera-white-complete-guide",
  "str82sleep-complete-guide",
];

if (!fs.existsSync(sourceDir)) {
  console.error("Source not found:", sourceDir);
  console.error("Run this script from the success007 repo (parent of SCV2).");
  process.exit(1);
}

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

let copied = 0;
for (const slug of expectedSlugs) {
  const src = path.join(sourceDir, `${slug}.md`);
  const dest = path.join(targetDir, `${slug}.md`);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log("Copied:", slug + ".md");
    copied++;
  } else {
    console.warn("Skip (missing):", src);
  }
}

console.log("\nDone. Copied", copied, "of", expectedSlugs.length, "blog guides to SCV2/content/blog/");
