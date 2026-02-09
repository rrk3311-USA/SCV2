# Next.js Commerce Implementation

SCV2 uses a Next.js Commerce-style architecture (MIT licensed) with Directus as the headless CMS backend.

## Architecture

```
┌─────────────────────┐
│   Next.js Frontend  │
│  (React/TypeScript) │
└──────────┬──────────┘
           │
           ├─── Commerce Library (/src/lib/commerce)
           │    ├── Hooks (useCart, useCheckout)
           │    ├── Types (Product, Cart, Order)
           │    └── Utils (formatPrice, etc.)
           │
           ├─── Directus CMS (/directus)
           │    ├── Product catalog
           │    ├── Categories
           │    ├── Orders
           │    └── Customers
           │
           └─── Payment (PayPal/Google Pay)
                └── Direct integration
```

## Commerce Library

### Location
`/src/lib/commerce/`

### Components

#### Types (`types.ts`)
Standard e-commerce types:
- `Product` - Product with variants, options, pricing
- `Cart` - Shopping cart with lines and totals
- `Order` - Order with fulfillment status
- `Money` - Currency amount type
- `Collection` - Product collections/categories
- `Customer` - Customer account data

#### Hooks (`hooks.ts`)
React hooks for client-side commerce:
- `useCart()` - Cart management
- `useCheckout()` - Checkout flow
- `useLocalStorage()` - Persistent storage

#### Utils (`utils.ts`)
Helper functions:
- `formatPrice()` - Format money values
- `createMoney()` - Create money objects
- `isDiscounted()` - Check if product is on sale
- `getDiscountPercentage()` - Calculate discount

## Data Flow

### Product Data

```
Directus CMS
    ↓
/src/lib/directus.ts (Directus SDK)
    ↓
/src/data/products.ts (legacy fallback)
    ↓
Product Pages & Store
```

### Cart Flow

```
User adds to cart
    ↓
/src/lib/cart.ts (localStorage)
    ↓
useCart() hook updates state
    ↓
CartContents component
    ↓
Checkout API (/api/checkout)
    ↓
PayPal/Google Pay
```

### Order Flow

```
Checkout initiated
    ↓
POST /api/checkout
    ↓
Calculate totals (subtotal, tax, shipping)
    ↓
Create order in Directus (optional)
    ↓
Redirect to payment provider
    ↓
Payment confirmation
    ↓
Order confirmation page
```

## API Routes

### `/api/checkout`
Main checkout endpoint.

**Request:**
```json
{
  "items": [
    {
      "sku": "10786-807",
      "quantity": 1,
      "optionLabel": "3-Pack (Best Value)",
      "isSubscription": true
    }
  ],
  "email": "customer@example.com",
  "shippingAddress": {
    "firstName": "John",
    "lastName": "Doe",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zip": "10001",
    "country": "US"
  }
}
```

**Response:**
```json
{
  "success": true,
  "orderId": "SC1707451234ABCD",
  "orderNumber": "SC1707451234ABCD",
  "subtotal": "82.08",
  "shipping": "0.00",
  "tax": "6.57",
  "total": "88.65",
  "items": [...],
  "paymentMethod": "paypal",
  "redirectUrl": null
}
```

### `/api/google-pay`
Google Pay payment processing.

### `/api/feeds/google-shopping`
Google Shopping feed generation.

## Frontend Integration

### Using the Cart

```tsx
import { useCart } from '@/lib/commerce';

export function ProductPage() {
  const { addToCart, itemCount } = useCart();

  const handleAddToCart = () => {
    addToCart({
      sku: '10786-807',
      name: 'Sclera White',
      price: 27.36,
      quantity: 1,
      image: '/images/products/10786-807/01.png',
    });
  };

  return (
    <button onClick={handleAddToCart}>
      Add to Cart ({itemCount})
    </button>
  );
}
```

### Using Checkout

```tsx
import { useCheckout } from '@/lib/commerce';

export function CheckoutButton() {
  const { checkout, loading, error } = useCheckout();
  const { cart } = useCart();

  const handleCheckout = async () => {
    try {
      const result = await checkout(cart);
      // Redirect to payment
      window.location.href = result.checkoutUrl;
    } catch (err) {
      console.error('Checkout failed:', err);
    }
  };

  return (
    <button onClick={handleCheckout} disabled={loading}>
      {loading ? 'Processing...' : 'Checkout'}
    </button>
  );
}
```

### Fetching Products from Directus

```tsx
import { getProducts, getProductBySlug } from '@/lib/directus';

// Server Component
export default async function ProductPage({ params }) {
  const product = await getProductBySlug(params.slug);
  
  return (
    <div>
      <h1>{product.name}</h1>
      <p>${product.price}</p>
    </div>
  );
}
```

## Payment Integration

### PayPal
Direct PayPal SDK integration in the frontend.

**Setup:**
1. Set `NEXT_PUBLIC_PAYPAL_CLIENT_ID` in environment
2. Use PayPal buttons component
3. Handle payment confirmation

### Google Pay
Google Pay API integration.

**Setup:**
1. Set `NEXT_PUBLIC_GOOGLE_PAY_ENABLED=true`
2. Configure merchant ID (production)
3. Use GooglePayButton component

See [GOOGLE_PAY_SETUP.md](./GOOGLE_PAY_SETUP.md) for details.

## Migration from Medusa

Previous versions used Medusa.js. The new architecture:

**Before (Medusa):**
- Medusa backend for products and cart
- Medusa SDK in frontend
- Medusa checkout flow

**After (Next.js Commerce):**
- Directus for content management
- Direct data access (no SDK overhead)
- Simplified checkout flow
- Better performance

**Migration steps:**
1. ✅ Removed `@medusajs/js-sdk`
2. ✅ Created commerce library
3. ✅ Added Directus backend
4. ✅ Simplified checkout API
5. ✅ Updated cart to use new API

## Environment Variables

```bash
# Commerce Backend
NEXT_PUBLIC_API_BASE=https://success-chemistry-pb.fly.dev

# Directus CMS
NEXT_PUBLIC_DIRECTUS_URL=http://localhost:8055
DIRECTUS_API_TOKEN=your_admin_token

# Site
NEXT_PUBLIC_SITE_URL=https://www.successchemistry.com
NEXT_PUBLIC_SITE_NAME=Success Chemistry

# Payment
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_paypal_client_id
NEXT_PUBLIC_GOOGLE_PAY_ENABLED=true
NEXT_PUBLIC_GOOGLE_PAY_MERCHANT_ID=your_merchant_id

# Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_GOOGLE_ADS_ID=AW-XXXXXXXXXX
```

## Testing

### Local Development

```bash
# Start Directus backend
cd directus
make start

# Start Next.js frontend
npm run dev
```

Access:
- Frontend: http://localhost:8000
- Directus Admin: http://localhost:8055

### Testing Checkout

1. Add products to cart
2. Click "Checkout"
3. Verify order calculation
4. Test payment flow

### Testing with Directus

```bash
# Import sample products
cd directus
make import TOKEN=your_token

# View products in admin
open http://localhost:8055
```

## Production Deployment

### Recommended Stack

- **Frontend**: Vercel
- **Backend (Directus)**: Railway/Fly.io
- **Database**: Managed PostgreSQL
- **Storage**: S3/Cloudinary
- **Payments**: PayPal/Stripe

### Deployment Checklist

- [ ] Set all environment variables
- [ ] Configure Directus with production URL
- [ ] Set up SSL/HTTPS
- [ ] Configure payment providers
- [ ] Test checkout flow
- [ ] Enable analytics
- [ ] Set up monitoring

See [directus/SETUP.md](./directus/SETUP.md) for backend deployment.

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Directus Documentation](https://docs.directus.io)
- [Commerce Types Reference](./src/lib/commerce/types.ts)
- [Cart Implementation](./src/lib/cart.ts)
- [Checkout API](./src/app/api/checkout/route.ts)
