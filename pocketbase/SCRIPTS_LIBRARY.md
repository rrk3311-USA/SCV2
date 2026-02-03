# 🚀 Scripts Library

Ready-to-use JavaScript snippets for integrations, agents, and automations.

---

## 📑 Table of Contents

- [Google Merchant Center](#google-merchant-center)
- [Google Ads API](#google-ads-api)
- [OpenAI SDK](#openai-sdk)
- [AI Merchant Agent](#ai-merchant-agent)
- [PayPal Integration](#paypal-integration)
- [PocketBase Helpers](#pocketbase-helpers)
- [Utility Functions](#utility-functions)

---

## Google Merchant Center

### Setup Product Feed

```javascript
// google-merchant-feed.js
// Syncs products from PocketBase to Google Merchant Center

import PocketBase from 'pocketbase';

const pb = new PocketBase(process.env.PB_URL);

async function generateMerchantFeed() {
  // Auth as admin
  await pb.admins.authWithPassword(
    process.env.PB_ADMIN_EMAIL,
    process.env.PB_ADMIN_PASSWORD
  );

  // Get all products
  const products = await pb.collection('products').getFullList();

  // Format for Google Merchant Center
  const feed = products.map(product => ({
    id: product.sku,
    title: product.name,
    description: product.shortDescription || product.description?.substring(0, 5000),
    link: `https://successchemistry.com/product/${product.slug}`,
    image_link: product.images?.[0] 
      ? `${process.env.PB_URL}/api/files/products/${product.id}/${product.images[0]}`
      : product.imagePaths?.[0],
    availability: product.inStock ? 'in_stock' : 'out_of_stock',
    price: `${product.price} USD`,
    brand: 'Success Chemistry',
    gtin: product.gtin || product.upc,
    condition: 'new',
    google_product_category: 'Health > Nutrition > Vitamins & Supplements',
    shipping_weight: product.weight || '3 oz'
  }));

  return feed;
}

// Generate XML feed for Google
function feedToXML(feed) {
  const items = feed.map(p => `
    <item>
      <g:id>${p.id}</g:id>
      <g:title><![CDATA[${p.title}]]></g:title>
      <g:description><![CDATA[${p.description}]]></g:description>
      <g:link>${p.link}</g:link>
      <g:image_link>${p.image_link}</g:image_link>
      <g:availability>${p.availability}</g:availability>
      <g:price>${p.price}</g:price>
      <g:brand>${p.brand}</g:brand>
      <g:gtin>${p.gtin}</g:gtin>
      <g:condition>${p.condition}</g:condition>
      <g:google_product_category>${p.google_product_category}</g:google_product_category>
      <g:shipping_weight>${p.shipping_weight}</g:shipping_weight>
    </item>
  `).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Success Chemistry Products</title>
    <link>https://successchemistry.com</link>
    <description>Health supplements and vitamins</description>
    ${items}
  </channel>
</rss>`;
}

export { generateMerchantFeed, feedToXML };
```

### Environment Variables

```bash
# Google Merchant Center
GOOGLE_MERCHANT_ID=your_merchant_id
GOOGLE_SERVICE_ACCOUNT_KEY=path/to/service-account.json
```

---

## Google Ads API

### Create Smart Shopping Campaign

```javascript
// google-ads-campaign.js
// Create and manage Google Ads campaigns

import { GoogleAdsApi } from 'google-ads-api';

const client = new GoogleAdsApi({
  client_id: process.env.GOOGLE_ADS_CLIENT_ID,
  client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
  developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN
});

const customer = client.Customer({
  customer_id: process.env.GOOGLE_ADS_CUSTOMER_ID,
  refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN
});

// Create Performance Max Campaign
async function createPerformanceMaxCampaign(config) {
  const { name, dailyBudget, targetRoas } = config;

  // Create budget
  const budget = await customer.campaignBudgets.create({
    name: `${name} Budget`,
    amount_micros: dailyBudget * 1000000, // Convert to micros
    delivery_method: 'STANDARD'
  });

  // Create campaign
  const campaign = await customer.campaigns.create({
    name,
    advertising_channel_type: 'PERFORMANCE_MAX',
    status: 'PAUSED', // Start paused for review
    campaign_budget: budget.resource_name,
    bidding_strategy_type: 'MAXIMIZE_CONVERSION_VALUE',
    maximize_conversion_value: {
      target_roas: targetRoas
    },
    url_expansion_opt_out: false
  });

  return campaign;
}

// Create Product Group for Shopping
async function createProductGroup(campaignId, products) {
  const assetGroup = await customer.assetGroups.create({
    campaign: `customers/${process.env.GOOGLE_ADS_CUSTOMER_ID}/campaigns/${campaignId}`,
    name: 'All Products',
    status: 'ENABLED'
  });

  // Add listing group filter
  await customer.assetGroupListingGroupFilters.create({
    asset_group: assetGroup.resource_name,
    type: 'UNIT_INCLUDED',
    listing_source: 'SHOPPING'
  });

  return assetGroup;
}

// Get Campaign Performance
async function getCampaignStats(campaignId, dateRange = 'LAST_30_DAYS') {
  const query = `
    SELECT
      campaign.id,
      campaign.name,
      metrics.impressions,
      metrics.clicks,
      metrics.cost_micros,
      metrics.conversions,
      metrics.conversions_value
    FROM campaign
    WHERE campaign.id = ${campaignId}
    AND segments.date DURING ${dateRange}
  `;

  const results = await customer.query(query);
  return results.map(row => ({
    id: row.campaign.id,
    name: row.campaign.name,
    impressions: row.metrics.impressions,
    clicks: row.metrics.clicks,
    cost: row.metrics.cost_micros / 1000000,
    conversions: row.metrics.conversions,
    revenue: row.metrics.conversions_value,
    roas: row.metrics.conversions_value / (row.metrics.cost_micros / 1000000)
  }));
}

export { createPerformanceMaxCampaign, createProductGroup, getCampaignStats };
```

### Environment Variables

```bash
# Google Ads API
GOOGLE_ADS_CLIENT_ID=your_client_id
GOOGLE_ADS_CLIENT_SECRET=your_client_secret
GOOGLE_ADS_DEVELOPER_TOKEN=your_developer_token
GOOGLE_ADS_CUSTOMER_ID=123-456-7890
GOOGLE_ADS_REFRESH_TOKEN=your_refresh_token
```

---

## OpenAI SDK

### Product Description Generator

```javascript
// openai-product-gen.js
// Generate product descriptions, SEO content, and marketing copy

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Generate SEO-optimized product description
async function generateProductDescription(product) {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are a health supplement copywriter. Write compelling, 
        accurate product descriptions that are SEO-optimized. Include benefits, 
        ingredients highlights, and suggested use. Keep it under 300 words.
        Never make medical claims. Use phrases like "may support" or "helps maintain".`
      },
      {
        role: 'user',
        content: `Write a product description for:
        Name: ${product.name}
        SKU: ${product.sku}
        Category: ${product.category}
        Ingredients: ${product.ingredients}
        Current description: ${product.description || 'None'}`
      }
    ],
    max_tokens: 500,
    temperature: 0.7
  });

  return completion.choices[0].message.content;
}

// Generate Google Ads headlines and descriptions
async function generateAdCopy(product) {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `Generate Google Ads copy for health supplements.
        Return JSON with:
        - headlines: array of 15 headlines (max 30 chars each)
        - descriptions: array of 4 descriptions (max 90 chars each)
        - callouts: array of 4 callouts (max 25 chars each)
        Focus on benefits, not medical claims.`
      },
      {
        role: 'user',
        content: `Product: ${product.name}
        Price: $${product.price}
        Key benefits: ${product.shortDescription}`
      }
    ],
    response_format: { type: 'json_object' },
    max_tokens: 800
  });

  return JSON.parse(completion.choices[0].message.content);
}

// Chat with products (RAG-style)
async function productChat(query, products) {
  const productContext = products
    .slice(0, 10)
    .map(p => `- ${p.name} ($${p.price}): ${p.shortDescription}`)
    .join('\n');

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are a helpful supplement advisor for Success Chemistry.
        Answer questions about our products. Be helpful but never make medical claims.
        Always recommend consulting a healthcare provider for medical advice.
        
        Our products:
        ${productContext}`
      },
      {
        role: 'user',
        content: query
      }
    ],
    max_tokens: 500
  });

  return completion.choices[0].message.content;
}

// Generate blog content
async function generateBlogPost(topic, products) {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `Write informative health blog posts. Include:
        - Engaging title
        - Introduction
        - 3-5 main sections with headers
        - Natural product mentions (not salesy)
        - Conclusion
        Format in Markdown. 800-1200 words.`
      },
      {
        role: 'user',
        content: `Topic: ${topic}
        Related products to mention: ${products.map(p => p.name).join(', ')}`
      }
    ],
    max_tokens: 2000
  });

  return completion.choices[0].message.content;
}

export { 
  generateProductDescription, 
  generateAdCopy, 
  productChat, 
  generateBlogPost 
};
```

### Embeddings for Product Search

```javascript
// openai-embeddings.js
// Semantic search for products using embeddings

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Generate embedding for text
async function getEmbedding(text) {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text
  });
  return response.data[0].embedding;
}

// Generate embeddings for all products
async function embedProducts(products) {
  const embeddings = [];
  
  for (const product of products) {
    const text = `${product.name} ${product.shortDescription} ${product.category}`;
    const embedding = await getEmbedding(text);
    embeddings.push({
      id: product.id,
      sku: product.sku,
      name: product.name,
      embedding
    });
  }
  
  return embeddings;
}

// Cosine similarity
function cosineSimilarity(a, b) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Semantic search
async function searchProducts(query, productEmbeddings, topK = 5) {
  const queryEmbedding = await getEmbedding(query);
  
  const scored = productEmbeddings.map(p => ({
    ...p,
    score: cosineSimilarity(queryEmbedding, p.embedding)
  }));
  
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

export { getEmbedding, embedProducts, searchProducts };
```

### Environment Variables

```bash
# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_ORG_ID=org-... # Optional
```

---

## AI Merchant Agent

### Autonomous Product Manager

```javascript
// ai-merchant-agent.js
// AI agent that manages products, pricing, and inventory

import OpenAI from 'openai';
import PocketBase from 'pocketbase';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const pb = new PocketBase(process.env.PB_URL);

// Agent tools/functions
const tools = [
  {
    type: 'function',
    function: {
      name: 'get_products',
      description: 'Get products from the database',
      parameters: {
        type: 'object',
        properties: {
          filter: { type: 'string', description: 'Filter query e.g. category = "bundles"' },
          limit: { type: 'number', description: 'Max products to return' }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'update_product',
      description: 'Update a product in the database',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Product ID' },
          updates: { type: 'object', description: 'Fields to update' }
        },
        required: ['id', 'updates']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_orders',
      description: 'Get recent orders',
      parameters: {
        type: 'object',
        properties: {
          status: { type: 'string', description: 'Filter by status' },
          days: { type: 'number', description: 'Orders from last N days' }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'analyze_sales',
      description: 'Analyze sales data and return insights',
      parameters: {
        type: 'object',
        properties: {
          metric: { type: 'string', enum: ['top_sellers', 'revenue', 'trends'] }
        },
        required: ['metric']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'generate_content',
      description: 'Generate marketing content for a product',
      parameters: {
        type: 'object',
        properties: {
          productId: { type: 'string' },
          contentType: { type: 'string', enum: ['description', 'ad_copy', 'social_post'] }
        },
        required: ['productId', 'contentType']
      }
    }
  }
];

// Tool implementations
async function executeTool(name, args) {
  await pb.admins.authWithPassword(
    process.env.PB_ADMIN_EMAIL,
    process.env.PB_ADMIN_PASSWORD
  );

  switch (name) {
    case 'get_products': {
      const options = { sort: '-created' };
      if (args.filter) options.filter = args.filter;
      if (args.limit) options.perPage = args.limit;
      return await pb.collection('products').getList(1, args.limit || 50, options);
    }
    
    case 'update_product': {
      return await pb.collection('products').update(args.id, args.updates);
    }
    
    case 'get_orders': {
      const filter = [];
      if (args.status) filter.push(`status = "${args.status}"`);
      if (args.days) {
        const date = new Date();
        date.setDate(date.getDate() - args.days);
        filter.push(`created >= "${date.toISOString()}"`);
      }
      return await pb.collection('orders').getList(1, 100, {
        filter: filter.join(' && '),
        sort: '-created'
      });
    }
    
    case 'analyze_sales': {
      const orders = await pb.collection('orders').getFullList({
        filter: 'status = "shipped" || status = "delivered"'
      });
      
      if (args.metric === 'top_sellers') {
        const skuCounts = {};
        orders.forEach(order => {
          (order.items || []).forEach(item => {
            skuCounts[item.sku] = (skuCounts[item.sku] || 0) + item.quantity;
          });
        });
        return Object.entries(skuCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10);
      }
      
      if (args.metric === 'revenue') {
        return orders.reduce((sum, o) => sum + (o.total || 0), 0);
      }
      
      return orders;
    }
    
    case 'generate_content': {
      const product = await pb.collection('products').getOne(args.productId);
      // Use OpenAI to generate content (simplified)
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: `Generate ${args.contentType} for health supplement.` },
          { role: 'user', content: `Product: ${product.name}\nDescription: ${product.shortDescription}` }
        ],
        max_tokens: 500
      });
      return completion.choices[0].message.content;
    }
  }
}

// Run agent with a task
async function runMerchantAgent(task) {
  const messages = [
    {
      role: 'system',
      content: `You are an AI merchant agent for Success Chemistry, a health supplements store.
      You can analyze sales, manage products, and generate marketing content.
      Always be data-driven and provide actionable insights.
      When updating products, explain what you're changing and why.`
    },
    { role: 'user', content: task }
  ];

  let response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages,
    tools,
    tool_choice: 'auto'
  });

  // Process tool calls in a loop
  while (response.choices[0].message.tool_calls) {
    const toolCalls = response.choices[0].message.tool_calls;
    messages.push(response.choices[0].message);

    for (const toolCall of toolCalls) {
      const args = JSON.parse(toolCall.function.arguments);
      const result = await executeTool(toolCall.function.name, args);
      
      messages.push({
        role: 'tool',
        tool_call_id: toolCall.id,
        content: JSON.stringify(result)
      });
    }

    response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      tools,
      tool_choice: 'auto'
    });
  }

  return response.choices[0].message.content;
}

export { runMerchantAgent, tools };

// Example usage:
// await runMerchantAgent("What are our top 5 selling products this month?")
// await runMerchantAgent("Generate new ad copy for our Liver Cleanse product")
// await runMerchantAgent("Which products are low in stock?")
```

---

## PayPal Integration

### Create Order and Capture Payment

```javascript
// paypal-integration.js
// PayPal checkout integration

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_API = process.env.NODE_ENV === 'production'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

// Get access token
async function getPayPalToken() {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
  
  const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  });
  
  const data = await response.json();
  return data.access_token;
}

// Create PayPal order
async function createPayPalOrder(cart) {
  const token = await getPayPalToken();
  
  const response = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'USD',
          value: cart.total.toFixed(2),
          breakdown: {
            item_total: { currency_code: 'USD', value: cart.subtotal.toFixed(2) },
            shipping: { currency_code: 'USD', value: cart.shipping.toFixed(2) },
            tax_total: { currency_code: 'USD', value: cart.tax.toFixed(2) }
          }
        },
        items: cart.items.map(item => ({
          name: item.name,
          sku: item.sku,
          quantity: item.quantity.toString(),
          unit_amount: { currency_code: 'USD', value: item.price.toFixed(2) }
        }))
      }]
    })
  });
  
  return await response.json();
}

// Capture payment
async function capturePayPalOrder(orderId) {
  const token = await getPayPalToken();
  
  const response = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  return await response.json();
}

// Frontend: PayPal Buttons
const paypalButtonsScript = `
<script src="https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD"></script>
<script>
paypal.Buttons({
  createOrder: async () => {
    const response = await fetch('/api/paypal/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cart: window.cart })
    });
    const data = await response.json();
    return data.id;
  },
  onApprove: async (data) => {
    const response = await fetch('/api/paypal/capture-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: data.orderID })
    });
    const result = await response.json();
    if (result.status === 'COMPLETED') {
      window.location.href = '/thank-you?order=' + result.id;
    }
  }
}).render('#paypal-button-container');
</script>
`;

export { createPayPalOrder, capturePayPalOrder, paypalButtonsScript };
```

---

## PocketBase Helpers

### Common Operations

```javascript
// pocketbase-helpers.js
// Reusable PocketBase utility functions

import PocketBase from 'pocketbase';

const pb = new PocketBase(process.env.PB_URL);

// Admin auth helper
async function authAsAdmin() {
  return await pb.admins.authWithPassword(
    process.env.PB_ADMIN_EMAIL,
    process.env.PB_ADMIN_PASSWORD
  );
}

// Get product by SKU
async function getProductBySku(sku) {
  await authAsAdmin();
  const records = await pb.collection('products').getList(1, 1, {
    filter: `sku = "${sku}"`
  });
  return records.items[0] || null;
}

// Get order by order number
async function getOrderByNumber(orderNumber) {
  await authAsAdmin();
  const records = await pb.collection('orders').getList(1, 1, {
    filter: `orderNumber = "${orderNumber}"`
  });
  return records.items[0] || null;
}

// Create order with auto-generated order number
async function createOrder(orderData) {
  await authAsAdmin();
  
  const orderNumber = orderData.orderNumber || `SC-${Date.now()}`;
  
  return await pb.collection('orders').create({
    orderNumber,
    status: 'pending',
    ...orderData
  });
}

// Update order status
async function updateOrderStatus(orderId, status, additionalData = {}) {
  await authAsAdmin();
  return await pb.collection('orders').update(orderId, {
    status,
    ...additionalData
  });
}

// Get orders by status
async function getOrdersByStatus(status, limit = 50) {
  await authAsAdmin();
  return await pb.collection('orders').getList(1, limit, {
    filter: `status = "${status}"`,
    sort: '-created'
  });
}

// Batch update products
async function batchUpdateProducts(updates) {
  await authAsAdmin();
  const results = [];
  
  for (const { id, data } of updates) {
    const result = await pb.collection('products').update(id, data);
    results.push(result);
  }
  
  return results;
}

// Search products
async function searchProducts(query, limit = 20) {
  await authAsAdmin();
  return await pb.collection('products').getList(1, limit, {
    filter: `name ~ "${query}" || sku ~ "${query}" || description ~ "${query}"`,
    sort: '-created'
  });
}

// Get customer by email
async function getCustomerByEmail(email) {
  await authAsAdmin();
  const records = await pb.collection('customers').getList(1, 1, {
    filter: `email = "${email}"`
  });
  return records.items[0] || null;
}

// Upsert customer (create or update)
async function upsertCustomer(email, data) {
  await authAsAdmin();
  
  const existing = await getCustomerByEmail(email);
  
  if (existing) {
    return await pb.collection('customers').update(existing.id, {
      ...data,
      ordersCount: (existing.ordersCount || 0) + 1,
      totalSpent: (existing.totalSpent || 0) + (data.orderTotal || 0)
    });
  } else {
    return await pb.collection('customers').create({
      email,
      ordersCount: 1,
      totalSpent: data.orderTotal || 0,
      ...data
    });
  }
}

export {
  pb,
  authAsAdmin,
  getProductBySku,
  getOrderByNumber,
  createOrder,
  updateOrderStatus,
  getOrdersByStatus,
  batchUpdateProducts,
  searchProducts,
  getCustomerByEmail,
  upsertCustomer
};
```

---

## Utility Functions

### Common Helpers

```javascript
// utils.js
// General utility functions

// Format currency
function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount);
}

// Generate order number
function generateOrderNumber(prefix = 'SC') {
  return `${prefix}-${Date.now()}`;
}

// Parse address from PayPal format
function parsePayPalAddress(paypalAddress) {
  return {
    street1: paypalAddress.address_line_1 || '',
    street2: paypalAddress.address_line_2 || '',
    city: paypalAddress.admin_area_2 || '',
    state: paypalAddress.admin_area_1 || '',
    zip: paypalAddress.postal_code || '',
    country: paypalAddress.country_code || 'US'
  };
}

// Calculate cart totals
function calculateCartTotals(items, taxRate = 0.0725, shippingCost = 5.99) {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * taxRate;
  const shipping = subtotal >= 50 ? 0 : shippingCost; // Free shipping over $50
  const total = subtotal + tax + shipping;
  
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    shipping: Math.round(shipping * 100) / 100,
    total: Math.round(total * 100) / 100
  };
}

// Validate email
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Sanitize string for XML
function xmlEscape(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Sleep/delay helper
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Retry with exponential backoff
async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      const delay = baseDelay * Math.pow(2, i);
      await sleep(delay);
    }
  }
}

export {
  formatCurrency,
  generateOrderNumber,
  parsePayPalAddress,
  calculateCartTotals,
  isValidEmail,
  xmlEscape,
  sleep,
  retryWithBackoff
};
```

---

## Environment Variables Reference

```bash
# .env.example - All integration variables

# PocketBase
PB_URL=https://success-chemistry-pb.fly.dev
PB_ADMIN_EMAIL=admin@successchemistry.com
PB_ADMIN_PASSWORD=your-secure-password

# ShipStation Custom Store
SHIPSTATION_STORE_USER=your_store_username
SHIPSTATION_STORE_PASSWORD=your_store_password

# PayPal
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret

# OpenAI
OPENAI_API_KEY=sk-...

# Google Ads
GOOGLE_ADS_CLIENT_ID=your_client_id
GOOGLE_ADS_CLIENT_SECRET=your_client_secret
GOOGLE_ADS_DEVELOPER_TOKEN=your_developer_token
GOOGLE_ADS_CUSTOMER_ID=123-456-7890
GOOGLE_ADS_REFRESH_TOKEN=your_refresh_token

# Google Merchant Center
GOOGLE_MERCHANT_ID=your_merchant_id
```

---

## Quick Copy Templates

### API Endpoint Template

```javascript
// api/[endpoint].js
export default async function handler(req, res) {
  if (req.method === 'GET') {
    // Handle GET
    return res.status(200).json({ success: true });
  }
  
  if (req.method === 'POST') {
    // Handle POST
    const data = req.body;
    return res.status(200).json({ success: true, data });
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}
```

### PocketBase Hook Template

```javascript
// pb_hooks/my-hook.pb.js
onRecordAfterCreateRequest((e) => {
  const record = e.record;
  console.log('New record created:', record.id);
}, 'orders');
```

---

## Related Documentation

- [ShipStation Integration](./SHIPSTATION_INTEGRATION.md)
- [User Management](./USER_MANAGEMENT.md)
- [Collections Setup](./COLLECTIONS_SETUP.md)
- [PocketBase README](./README.md)
