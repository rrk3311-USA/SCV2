#!/usr/bin/env node

/**
 * Migrate products from products-data.js to PocketBase
 * Includes SKU, GTIN, UPC and all WooCommerce-like fields.
 *
 * Usage:
 *   1. Start PocketBase: cd pocketbase && ./start.sh  (or use Fly)
 *   2. Collections (products, orders, customers) are created by migration on first serve
 *   3. Run: PB_ADMIN_PASSWORD=yourpassword node migrate-products.js
 */

const path = require('path');

// PocketBase config
const PB_URL = process.env.PB_URL || 'http://localhost:8090';
const PB_ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL || 'admin@successchemistry.com';
const PB_ADMIN_PASSWORD = process.env.PB_ADMIN_PASSWORD;

// Load products from products-data.js (PRODUCTS_DATA object)
let productsData = [];
const possiblePaths = [
  path.join(__dirname, '../deploy-site/products-data.js'),
  path.join(__dirname, '../public/products-data.js'),
  path.join(__dirname, 'products-data.js'),
];

for (const p of possiblePaths) {
  try {
    const mod = require(p);
    const data = mod.PRODUCTS_DATA || mod.products || mod;
    if (data && typeof data === 'object') {
      productsData = Array.isArray(data) ? data : Object.values(data);
      console.log(`📦 Found products at: ${p}`);
      break;
    }
  } catch (e) {
    continue;
  }
}

if (!productsData || productsData.length === 0) {
  console.error('❌ Could not load PRODUCTS_DATA from products-data.js');
  console.error('   Looked in:', possiblePaths);
  process.exit(1);
}

console.log(`✅ Found ${productsData.length} products`);

function slugify(str) {
  if (!str) return '';
  return String(str)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function migrate() {
  if (!PB_ADMIN_PASSWORD) {
    console.error('❌ Please set PB_ADMIN_PASSWORD environment variable');
    console.error('   Example: PB_ADMIN_PASSWORD=yourpassword node migrate-products.js');
    process.exit(1);
  }

  console.log('\n🔐 Authenticating with PocketBase...');

  const authRes = await fetch(`${PB_URL}/api/admins/auth-with-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identity: PB_ADMIN_EMAIL,
      password: PB_ADMIN_PASSWORD,
    }),
  });

  if (!authRes.ok) {
    console.error('❌ Authentication failed');
    console.error('   Make sure PocketBase is running and credentials are correct');
    process.exit(1);
  }

  const { token } = await authRes.json();
  console.log('✅ Authenticated');

  console.log('\n📤 Uploading products to PocketBase...');

  let success = 0;
  let failed = 0;

  for (const p of productsData) {
    try {
      const pbProduct = {
        name: p.name || '',
        slug: slugify(p.slug || p.sku || p.name) || p.sku?.toLowerCase() || '',
        sku: String(p.sku || ''),
        gtin: String(p.gtin || p.upc || '').trim() || null,
        upc: String(p.upc || p.gtin || '').trim() || null,
        price: parseFloat(p.price) || 0,
        description: p.description || '',
        shortDescription: p.short_description || '',
        category: p.category || 'supplements',
        inStock: p.stock !== undefined ? p.stock > 0 : true,
        stock: typeof p.stock === 'number' ? p.stock : null,
        weight: p.weight || null,
        dimensions: p.dimensions || null,
        suggestedUse: p.suggested_use || null,
        supplementFacts: p.supplement_facts || null,
        ingredients: p.ingredients || null,
        keySearchTerms: p.key_search_terms != null ? (typeof p.key_search_terms === 'string' ? p.key_search_terms : p.key_search_terms) : null,
        seoTargets: p.seo_targets || null,
        imagePaths: p.images && Array.isArray(p.images) ? p.images : null,
        metadata: {
          benefits: p.benefits || [],
          usage: p.usage || '',
          warnings: p.warnings || '',
          faq: p.faq || [],
        },
      };

      const res = await fetch(`${PB_URL}/api/collections/products/records`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
        body: JSON.stringify(pbProduct),
      });

      if (res.ok) {
        success++;
        console.log(`   ✓ ${p.name} (SKU: ${p.sku}, GTIN: ${pbProduct.gtin || '-'}, UPC: ${pbProduct.upc || '-'})`);
      } else {
        const err = await res.json();
        failed++;
        console.error(`   ✗ ${p.name}: ${err.message || 'Unknown error'}`);
      }
    } catch (err) {
      failed++;
      console.error(`   ✗ ${p.name}: ${err.message}`);
    }
  }

  console.log(`\n📊 Migration complete:`);
  console.log(`   ✅ Success: ${success}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`\n🎉 Admin UI: ${PB_URL}/_/`);
}

migrate().catch(console.error);
