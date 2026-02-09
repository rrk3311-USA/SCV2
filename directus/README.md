# Directus Backend for SCV2 (Success Chemistry)

This directory contains the Directus headless CMS backend for the Success Chemistry V2 e-commerce platform.

## Overview

Directus provides a powerful admin UI and REST/GraphQL APIs for managing:
- **Products** - Full product catalog with images, descriptions, FAQs, bundle options
- **Categories** - Product categorization (Best Sellers, Men's Health, Women's Health, etc.)
- **Orders** - Order management and tracking
- **Customers** - Customer accounts and addresses
- **Reviews** - Product reviews and ratings
- **Media** - Image and file management

## Quick Start

### Prerequisites

- Docker and Docker Compose
- 4GB RAM minimum
- Port 8055 available

### Installation

1. **Start Directus:**

```bash
cd directus
docker-compose up -d
```

2. **Access Admin Panel:**

Open http://localhost:8055 in your browser

**Default credentials:**
- Email: `admin@example.com`
- Password: `admin`

⚠️ **IMPORTANT:** Change these credentials immediately in production!

3. **Check Status:**

```bash
docker-compose ps
docker-compose logs -f directus
```

### First Time Setup

After starting Directus for the first time:

1. Log in to the admin panel at http://localhost:8055
2. Change the admin password (User Menu → Account Settings)
3. Import the schema:
   - Go to Settings → Data Model
   - Or use the Directus CLI to apply the schema (see Schema Management below)

## Configuration

### Environment Variables

Copy `.env.example` to `.env` and customize:

```bash
cp .env.example .env
```

**Critical settings for production:**

- `KEY` and `SECRET` - Generate new random UUIDs
- `ADMIN_EMAIL` and `ADMIN_PASSWORD` - Set secure admin credentials
- `PUBLIC_URL` - Your production domain (e.g., https://api.successchemistry.com)
- `CORS_ORIGIN` - Add your production frontend URLs
- Email settings (SMTP) for transactional emails
- Storage settings (S3/Cloudinary) for production file storage

### Generate Secure Keys

```bash
# Generate new KEY
node -e "console.log(require('crypto').randomUUID())"

# Generate new SECRET
node -e "console.log(require('crypto').randomUUID())"
```

## Data Model

### Collections

#### **products**
- `id` - Primary key
- `status` - published/draft/archived
- `slug` - URL-friendly identifier (unique)
- `sku` - Product SKU (unique)
- `name` - Product name
- `price` - Base price
- `category` - Product category
- `short_description` - Brief description (HTML)
- `description` - Full description (HTML)
- `suggested_use` - Usage instructions
- `supplement_facts` - Supplement facts label
- `ingredients` - Ingredients list
- `upc`, `gtin` - Product identifiers
- `weight`, `dimensions` - Physical properties
- `key_search_terms` - SEO keywords
- `image` - Primary product image (File)
- `images` - Additional images (JSON array)
- `subscribe_save_percent` - Subscribe & Save discount (default: 15)
- `bundle_options` - Related bundle options (O2M)
- `faqs` - Product FAQs (O2M)

#### **categories**
- `id` - Primary key
- `status` - published/draft/archived
- `category_id` - URL slug (e.g., 'bestsellers', 'mens')
- `name` - Display name
- `description` - Category description (HTML)
- `image` - Category thumbnail
- `count` - Number of products

#### **bundle_options**
- `id` - Primary key
- `product_id` - Related product (M2O)
- `label` - Bundle label (e.g., "3-Pack (Best Value)")
- `quantity` - Number of units
- `price` - Bundle price
- `save_percent` - Discount percentage

#### **product_faqs**
- `id` - Primary key
- `product_id` - Related product (M2O)
- `question` - FAQ question
- `answer` - FAQ answer (HTML)
- `sort` - Display order

#### **customers**
- `id` - Primary key
- `email` - Email address (unique)
- `first_name`, `last_name` - Customer name
- `phone` - Phone number
- `billing_address` - Billing address (JSON)
- `shipping_address` - Shipping address (JSON)

#### **orders**
- `id` - Primary key
- `order_number` - Order reference (unique)
- `customer_id` - Related customer (M2O)
- `status` - pending/processing/shipped/delivered/cancelled/refunded
- `payment_status` - pending/paid/failed/refunded
- `payment_method` - paypal/google_pay/credit_card
- `subtotal`, `tax`, `shipping`, `total` - Order amounts
- `customer_email` - Customer email
- `shipping_address`, `billing_address` - Addresses (JSON)
- `items` - Order items (O2M)

#### **order_items**
- `id` - Primary key
- `order_id` - Related order (M2O)
- `product_id` - Related product (M2O)
- `product_name`, `product_sku` - Product snapshot
- `quantity` - Item quantity
- `unit_price`, `total` - Item pricing

#### **reviews**
- `id` - Primary key
- `status` - published/pending/rejected
- `product_id` - Related product (M2O)
- `customer_id` - Related customer (M2O)
- `rating` - Star rating (1-5)
- `title` - Review title
- `comment` - Review text (HTML)
- `customer_name`, `customer_email` - Customer info

## API Usage

### REST API

Base URL: `http://localhost:8055`

**Get all published products:**
```bash
GET /items/products?filter[status][_eq]=published
```

**Get product by slug:**
```bash
GET /items/products?filter[slug][_eq]=10786-807&fields=*,bundle_options.*,faqs.*
```

**Get products by category:**
```bash
GET /items/products?filter[category][_eq]=Best Sellers&filter[status][_eq]=published
```

**Get categories:**
```bash
GET /items/categories?filter[status][_eq]=published
```

### GraphQL API

Endpoint: `http://localhost:8055/graphql`

**Query products:**
```graphql
query {
  products(filter: { status: { _eq: "published" } }) {
    id
    slug
    sku
    name
    price
    category
    short_description
    image {
      id
      filename_download
    }
    bundle_options {
      label
      quantity
      price
      save_percent
    }
    faqs {
      question
      answer
    }
  }
}
```

### Authentication

For public endpoints, no authentication is required. For admin operations:

1. **Get Access Token:**
```bash
POST /auth/login
{
  "email": "admin@example.com",
  "password": "admin"
}
```

2. **Use Token:**
```bash
Authorization: Bearer YOUR_ACCESS_TOKEN
```

## Schema Management

### Import Schema

Using Directus CLI:

```bash
# Install Directus CLI
npm install -g @directus/cli

# Apply schema
directus schema apply ./schema/init-schema.json --yes
```

Or manually in the admin panel:
1. Settings → Data Model
2. Create collections and fields as defined in `schema/init-schema.json`

### Export Schema

```bash
directus schema snapshot ./schema/current-schema.json
```

## Frontend Integration

### Environment Variables (Next.js)

Add to your `.env.local`:

```bash
NEXT_PUBLIC_DIRECTUS_URL=http://localhost:8055
DIRECTUS_API_TOKEN=your_api_token_here
```

### Example: Fetch Products

```typescript
// lib/directus.ts
import { createDirectus, rest } from '@directus/sdk';

const directus = createDirectus(process.env.NEXT_PUBLIC_DIRECTUS_URL!)
  .with(rest());

export async function getProducts() {
  return await directus.request(
    readItems('products', {
      filter: { status: { _eq: 'published' } },
      fields: ['*', 'bundle_options.*', 'faqs.*'],
      sort: ['sort'],
    })
  );
}

export async function getProductBySlug(slug: string) {
  const products = await directus.request(
    readItems('products', {
      filter: { slug: { _eq: slug }, status: { _eq: 'published' } },
      fields: ['*', 'bundle_options.*', 'faqs.*'],
      limit: 1,
    })
  );
  return products[0];
}
```

## Production Deployment

### Recommended Hosting

- **Directus**: Railway, Fly.io, DigitalOcean, AWS ECS
- **Database**: Managed PostgreSQL (RDS, Railway, Supabase)
- **Storage**: S3, Cloudinary, or Directus Cloud Storage

### Railway Deployment

1. **Create Railway project:**
```bash
railway init
```

2. **Add PostgreSQL database:**
```bash
railway add postgres
```

3. **Deploy Directus:**
```bash
railway up
```

4. **Set environment variables:**
- Copy from `.env.example`
- Update `PUBLIC_URL` to your Railway domain
- Add production `CORS_ORIGIN` URLs

### Docker Production

```bash
# Build and run with production settings
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Storage Configuration (S3)

For production, use S3 for file storage:

```env
STORAGE_LOCATIONS=s3
STORAGE_S3_DRIVER=s3
STORAGE_S3_KEY=your_aws_access_key
STORAGE_S3_SECRET=your_aws_secret_key
STORAGE_S3_BUCKET=successchemistry-media
STORAGE_S3_REGION=us-east-1
```

## Migrations & Data Import

### Import Existing Products

Create a migration script to import products from `src/data/products.ts`:

```bash
node directus/scripts/import-products.js
```

(Script to be created - will parse products.ts and create products via API)

## Monitoring & Maintenance

### Health Check

```bash
curl http://localhost:8055/server/health
```

### Logs

```bash
# View logs
docker-compose logs -f directus

# Database logs
docker-compose logs -f database
```

### Backup Database

```bash
# Backup
docker-compose exec database pg_dump -U directus directus > backup-$(date +%Y%m%d).sql

# Restore
cat backup-20260209.sql | docker-compose exec -T database psql -U directus directus
```

### Update Directus

```bash
# Pull latest image
docker-compose pull directus

# Restart with new version
docker-compose up -d directus
```

## Security Checklist

- [ ] Change default admin credentials
- [ ] Generate new KEY and SECRET
- [ ] Configure CORS properly
- [ ] Enable rate limiting
- [ ] Set up HTTPS/SSL for production
- [ ] Configure firewall rules
- [ ] Regular database backups
- [ ] Use environment variables for secrets
- [ ] Enable 2FA for admin accounts
- [ ] Review and configure access permissions

## Troubleshooting

### Container won't start

```bash
# Check logs
docker-compose logs directus

# Check database connection
docker-compose exec database psql -U directus -c "SELECT 1"
```

### Permission errors

```bash
# Fix file permissions
sudo chown -R $USER:$USER ./data ./uploads ./extensions
```

### Port conflicts

If port 8055 is in use, change it in `docker-compose.yml`:

```yaml
ports:
  - "8056:8055"  # Use 8056 instead
```

## Resources

- [Directus Documentation](https://docs.directus.io/)
- [Directus API Reference](https://docs.directus.io/reference/introduction.html)
- [Directus SDK](https://docs.directus.io/packages/@directus/sdk/)
- [Community Discord](https://discord.com/invite/directus)

## Support

For SCV2-specific questions, refer to the main project documentation or contact the development team.
