# PocketBase Collections Setup

Collections (products, orders, customers) are created automatically by migration when PocketBase starts.

## Product Fields (WooCommerce-like)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| **sku** | Text | Yes | Unique product SKU |
| **gtin** | Text | No | Global Trade Item Number |
| **upc** | Text | No | Universal Product Code |
| **name** | Text | Yes | Product name |
| **slug** | Text | Yes | URL slug (unique) |
| **price** | Number | Yes | Price |
| **description** | Editor | No | Rich text description |
| **shortDescription** | Text | No | Brief summary |
| **category** | Text | No | e.g. supplements, bundles |
| **inStock** | Bool | No | Default: true |
| **stock** | Number | No | Quantity in stock |
| **images** | File | No | Uploaded images (max 20) |
| **imagePaths** | JSON | No | Paths from products-data.js |
| **weight** | Text | No | e.g. "3oz" |
| **dimensions** | Text | No | e.g. "2 x 3.5 inches" |
| **suggestedUse** | Text | No | Usage instructions |
| **supplementFacts** | Text | No | Supplement facts panel |
| **ingredients** | Text | No | Ingredients list |
| **keySearchTerms** | JSON | No | Search keywords |
| **seoTargets** | JSON | No | SEO metadata |
| **metadata** | JSON | No | Extra data |

## Order Fields

| Field | Type | Notes |
|-------|------|-------|
| orderNumber | Text | Unique, e.g. SC-001 |
| customerEmail | Email | Required |
| customerName | Text | Required |
| customerPhone | Text | Optional |
| items | JSON | Cart items |
| total | Number | Order total |
| subtotal | Number | Before tax/shipping |
| tax | Number | Tax amount |
| shipping | Number | Shipping amount |
| status | Select | pending, paid, processing, shipped, delivered, cancelled |
| paymentMethod | Select | paypal, stripe, cod, other |
| paymentId | Text | PayPal/Stripe transaction ID |
| shippingAddress | JSON | Address object |
| trackingNumber | Text | Shipment tracking |
| trackingUrl | Text | Tracking link |
| notes | Text | Order notes |

## Customer Fields

| Field | Type | Notes |
|-------|------|-------|
| email | Email | Unique |
| name | Text | Customer name |
| phone | Text | Phone number |
| ordersCount | Number | Total orders |
| totalSpent | Number | Lifetime spend |
| addresses | JSON | Saved addresses |
| metadata | JSON | Extra data |

## Run Migration (First Time)

Migrations run automatically when PocketBase starts. If you already have PocketBase running:

1. Restart PocketBase (or deploy to Fly)
2. The migration will create products, orders, customers collections on first start

## Import Products

After collections exist:

```bash
cd pocketbase
PB_ADMIN_PASSWORD=yourpassword node migrate-products.js
```

This imports from `deploy-site/products-data.js` with SKU, GTIN, UPC and all WooCommerce fields.
