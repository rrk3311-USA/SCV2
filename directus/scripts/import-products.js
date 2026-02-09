#!/usr/bin/env node

/**
 * Import products from SCV2 data files to Directus
 * 
 * Usage:
 *   DIRECTUS_URL=http://localhost:8055 \
 *   DIRECTUS_TOKEN=your_token \
 *   node import-products.js
 */

const fs = require('fs');
const path = require('path');

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN;

if (!DIRECTUS_TOKEN) {
  console.error('Error: DIRECTUS_TOKEN environment variable is required');
  console.error('');
  console.error('Get your token by:');
  console.error('1. Login to Directus admin panel');
  console.error('2. Go to User Menu → Account Settings → API Tokens');
  console.error('3. Create a new token with admin permissions');
  console.error('');
  console.error('Then run:');
  console.error('  DIRECTUS_TOKEN=your_token node import-products.js');
  process.exit(1);
}

// Import products data from TypeScript file
// Note: This is a simplified import - you may need to parse the TS file
// or convert it to JSON first for production use
const PRODUCTS_DATA_PATH = path.join(__dirname, '../../src/data/products.ts');
const CATEGORIES_DATA_PATH = path.join(__dirname, '../../src/data/categories.ts');

async function makeRequest(endpoint, method = 'GET', data = null) {
  const url = `${DIRECTUS_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Authorization': `Bearer ${DIRECTUS_TOKEN}`,
      'Content-Type': 'application/json',
    },
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(url, options);
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error: ${response.status} - ${error}`);
  }

  return await response.json();
}

async function importCategories() {
  console.log('Importing categories...');
  
  const categories = [
    {
      category_id: 'bestsellers',
      name: 'Best Sellers',
      count: 15,
      status: 'published',
      sort: 1,
    },
    {
      category_id: 'mens',
      name: "Men's Health",
      count: 8,
      status: 'published',
      sort: 2,
    },
    {
      category_id: 'womens',
      name: "Women's Health",
      count: 11,
      status: 'published',
      sort: 3,
    },
    {
      category_id: 'eye',
      name: 'Eye Health',
      count: 3,
      status: 'published',
      sort: 4,
    },
    {
      category_id: 'weight',
      name: 'Weight Loss',
      count: 7,
      status: 'published',
      sort: 5,
    },
    {
      category_id: 'bundles',
      name: 'Bundle Deals',
      count: 20,
      status: 'published',
      sort: 6,
    },
    {
      category_id: 'lung',
      name: 'Lung Health',
      count: 2,
      status: 'published',
      sort: 7,
    },
    {
      category_id: 'legacy',
      name: 'Legacy',
      count: 5,
      status: 'published',
      sort: 8,
    },
    {
      category_id: 'unisex',
      name: 'Unisex',
      count: 3,
      status: 'published',
      sort: 9,
    },
  ];

  let imported = 0;
  for (const category of categories) {
    try {
      await makeRequest('/items/categories', 'POST', category);
      console.log(`  ✓ Imported category: ${category.name}`);
      imported++;
    } catch (error) {
      console.error(`  ✗ Failed to import ${category.name}:`, error.message);
    }
  }

  console.log(`\nImported ${imported} of ${categories.length} categories\n`);
  return imported;
}

async function importSampleProducts() {
  console.log('Importing sample products...');
  console.log('Note: For full product import, you need to parse the TypeScript data file');
  console.log('or export it to JSON format first.\n');

  // Sample product data (from the TS file)
  const sampleProducts = [
    {
      slug: '52274-401',
      sku: '52274-401',
      name: "Success Chemistry Women's Balance – Female Libido & Arousal Support Supplement",
      price: 28.00,
      category: "Women's Health",
      status: 'published',
      short_description: 'Premium female libido enhancement supplement with clinically-studied ingredients including L-Arginine, Maca Root, Ashwagandha, and Korean Ginseng.',
      description: 'Rediscover Balance, Confidence & Connection. Women\'s Balance by Success Chemistry is thoughtfully crafted to support feminine wellness from the inside out.',
      suggested_use: 'As a dietary supplement take two (2) veggie capsules once a day after a meal with an 8oz. glass of water or as directed by your healthcare professional.',
      upc: '783325397399',
      gtin: '783325397399',
      weight: '3oz',
      dimensions: '2 inches wide x 3.5 inches tall',
      subscribe_save_percent: 15,
      sort: 1,
    },
    {
      slug: '10786-807',
      sku: '10786-807',
      name: 'Sclera White - Eye Beauty Dietary Supplement With Eyebright & Lutein',
      price: 27.36,
      category: 'Best Seller',
      status: 'published',
      short_description: 'Transform your eye health with Sclera White – the ultimate dietary supplement designed to enhance your natural beauty.',
      description: 'Sclera White is an eye whitening dietary supplement with Eyebright and Lutein designed to support ocular health and promote brighter, clearer-looking eyes.',
      suggested_use: 'As a dietary supplement take two (2) veggie capsules once a day after a meal with an 8oz. glass of water or as directed by your healthcare professional.',
      gtin: '651074168402',
      weight: '3oz',
      dimensions: '2 inches wide x 3.5 inches tall',
      subscribe_save_percent: 15,
      sort: 2,
    },
  ];

  let imported = 0;
  for (const product of sampleProducts) {
    try {
      const result = await makeRequest('/items/products', 'POST', product);
      console.log(`  ✓ Imported product: ${product.name} (${product.sku})`);
      
      // Import bundle options for Sclera White
      if (product.sku === '10786-807') {
        const bundleOptions = [
          { label: '2-Pack', quantity: 2, price: 49.25, save_percent: 10 },
          { label: '3-Pack (Best Value)', quantity: 3, price: 69.67, save_percent: 15 },
          { label: '5-Pack', quantity: 5, price: 109.44, save_percent: 20 },
        ];

        for (const bundle of bundleOptions) {
          try {
            await makeRequest('/items/bundle_options', 'POST', {
              product_id: result.data.id,
              ...bundle,
            });
            console.log(`    ✓ Added bundle option: ${bundle.label}`);
          } catch (error) {
            console.error(`    ✗ Failed to add bundle: ${bundle.label}`);
          }
        }
      }

      imported++;
    } catch (error) {
      console.error(`  ✗ Failed to import ${product.name}:`, error.message);
    }
  }

  console.log(`\nImported ${imported} of ${sampleProducts.length} sample products\n`);
  return imported;
}

async function main() {
  console.log('='.repeat(60));
  console.log('SCV2 Product Import Tool');
  console.log('='.repeat(60));
  console.log(`Directus URL: ${DIRECTUS_URL}\n`);

  try {
    // Test connection
    await makeRequest('/server/health');
    console.log('✓ Connected to Directus\n');

    // Import categories
    await importCategories();

    // Import sample products
    await importSampleProducts();

    console.log('='.repeat(60));
    console.log('Import completed!');
    console.log('='.repeat(60));
    console.log('\nNext steps:');
    console.log('1. Visit the Directus admin panel to review imported data');
    console.log('2. Add product images via the admin UI');
    console.log('3. Add FAQs and additional product details');
    console.log('4. Configure product visibility (status)');
    console.log('\nFor full product import, parse the TypeScript data file');
    console.log('or export it to JSON format first.');

  } catch (error) {
    console.error('\n✗ Import failed:', error.message);
    process.exit(1);
  }
}

main();
