# PocketBase Quick Start Guide

Get your Success Chemistry backend running in 5 minutes!

## Step 1: Start PocketBase (1 minute)

```bash
cd pocketbase
./start.sh
```

This will:
- Download PocketBase automatically (if needed)
- Start the server on http://localhost:8090

## Step 2: Create Admin Account (1 minute)

1. Open http://localhost:8090/_/
2. Create your admin account:
   - Email: `admin@successchemistry.com`
   - Password: (choose a strong password)

## Step 3: Create Collections (2 minutes)

In the Admin UI, create these collections:

### Products Collection

1. Click **Collections** → **New collection**
2. Name: `products`
3. Type: **Base**
4. Add fields:

| Field | Type | Options |
|-------|------|---------|
| `name` | Text | Required |
| `slug` | Text | Required, Unique |
| `sku` | Text | Required, Unique |
| `price` | Number | Required |
| `description` | Editor | - |
| `category` | Text | - |
| `inStock` | Bool | Default: true |
| `images` | File | Multiple, Max 10 |
| `metadata` | JSON | - |

5. **API Rules** → Set to "Anyone can view"

### Orders Collection

1. Click **Collections** → **New collection**
2. Name: `orders`
3. Type: **Base**
4. Add fields:

| Field | Type | Options |
|-------|------|---------|
| `orderNumber` | Text | Required, Unique |
| `customerEmail` | Email | Required |
| `customerName` | Text | Required |
| `items` | JSON | Required |
| `total` | Number | Required |
| `status` | Select | Options: pending, paid, shipped, delivered |
| `shippingAddress` | JSON | - |
| `trackingNumber` | Text | - |

5. **API Rules** → "Only admins can view/edit"

## Step 4: Import Products (1 minute)

```bash
# Set your admin password
export PB_ADMIN_PASSWORD=your-password-here

# Run migration
node migrate-products.js
```

## Done! 🎉

Your backend is ready:

- **Admin UI**: http://localhost:8090/_/
- **API**: http://localhost:8090/api/
- **Products API**: http://localhost:8090/api/collections/products/records

## Next: Update Your Frontend

Install PocketBase SDK:

```bash
cd ../deploy-site
npm install pocketbase
```

Use in your code:

```javascript
import PocketBase from 'pocketbase';

const pb = new PocketBase('http://localhost:8090');

// Get all products
const products = await pb.collection('products').getFullList({
  sort: '-created',
});

// Get single product by SKU
const product = await pb.collection('products').getFirstListItem(`sku="${sku}"`);

// Create order
const order = await pb.collection('orders').create({
  orderNumber: `SC-${Date.now()}`,
  customerEmail: 'customer@example.com',
  customerName: 'John Doe',
  items: cartItems,
  total: 99.99,
  status: 'pending',
  shippingAddress: {...}
});
```

## Deploy to Production

See [README.md](./README.md) for deployment options:
- **Fly.io** (recommended, free tier)
- **Railway** (free tier)
- **VPS** (DigitalOcean, Linode, etc.)

All deployment configs are ready in this folder!
