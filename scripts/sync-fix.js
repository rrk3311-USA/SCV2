#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const deployPath = path.join(__dirname, '../../deploy-site/products-data.js');
const data = require(deployPath);
const PRODUCTS_DATA = data.PRODUCTS_DATA;

console.log('Loaded products:', Object.keys(PRODUCTS_DATA || {}).length);

if (!PRODUCTS_DATA || Object.keys(PRODUCTS_DATA).length === 0) {
  console.error('PRODUCTS_DATA is empty or missing');
  process.exit(1);
}

const overlay = {};
let count = 0;
for (const [sku, p] of Object.entries(PRODUCTS_DATA)) {
  if (!p || typeof p !== 'object') continue;
  const entry = {};
  if (p.description != null) entry.description = p.description;
  if (p.short_description != null) entry.short_description = p.short_description;
  if (p.suggested_use != null) entry.suggested_use = p.suggested_use;
  if (p.supplement_facts != null) entry.supplement_facts = p.supplement_facts;
  if (p.ingredients != null) entry.ingredients = p.ingredients;
  if (p.upc != null) entry.upc = p.upc;
  if (p.gtin != null) entry.gtin = p.gtin;
  if (p.weight != null) entry.weight = p.weight;
  if (p.dimensions != null) entry.dimensions = p.dimensions;
  if (p.key_search_terms != null) entry.key_search_terms = p.key_search_terms;
  if (p.faqs != null && Array.isArray(p.faqs)) entry.faqs = p.faqs;
  if (Object.keys(entry).length > 0) {
    overlay[sku] = entry;
    count++;
  }
}

const outPath = path.join(__dirname, '../src/data/products-from-site.json');
fs.writeFileSync(outPath, JSON.stringify(overlay, null, 2), 'utf8');
console.log('Wrote', count, 'products to', outPath);
