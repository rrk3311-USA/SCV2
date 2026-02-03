# Live Product Editing Guide

Edit product descriptions in PocketBase and see changes on your live site immediately.

## How It Works

```
PocketBase Admin → Edit Product → Save → Live Site Updates
```

## Setup

### 1. Add API Endpoint

The `/api/products` endpoint fetches live data from PocketBase:

```javascript
// Your site calls this
const product = await fetch('/api/products?slug=liver-cleanse')
```

### 2. Use Product Loader

Import the product loader in your pages:

```javascript
import { getProductBySlug } from './product-loader.js';

const product = await getProductBySlug('liver-cleanse');
```

### 3. Add Edit Button (Optional)

Show an "Edit in PocketBase" button for admins:

```jsx
import EditButton from './components/EditButton.jsx';

<EditButton productId={product.id} productSlug={product.slug} />
```

## Workflow

### For Admins

1. **Browse your site** → Find product you want to edit
2. **Click "Edit in PocketBase"** button (bottom right)
3. **Opens PocketBase admin** → Edit description, price, etc.
4. **Click Save** in PocketBase
5. **Click "Refresh"** button on your site (or reload page)
6. **See changes live!**

### For Developers

Your product pages should fetch from PocketBase:

```javascript
// ❌ Old way: Static data
import products from './products-data.js';

// ✅ New way: Live data from PocketBase
import { getProductBySlug } from './product-loader.js';
const product = await getProductBySlug(slug);
```

## Editable Fields

All these fields can be edited in PocketBase and appear live:

| Field | Type | Shows On Site |
|-------|------|---------------|
| `name` | Text | Product title |
| `description` | Rich Text | Full description (HTML) |
| `shortDescription` | Text | Summary/excerpt |
| `price` | Number | Price display |
| `inStock` | Boolean | Availability |
| `stock` | Number | Quantity available |
| `images` | Files | Product photos |
| `category` | Text | Category badge |
| `suggestedUse` | Text | Usage instructions |
| `ingredients` | Text | Ingredients list |
| `supplementFacts` | Text | Nutrition facts |

## Caching Strategy

### Option 1: Server-Side Rendering (SSR)
Always fresh data, fetched on every request:

```javascript
export async function getServerSideProps({ params }) {
  const product = await getProductBySlug(params.slug);
  return { props: { product } };
}
```

### Option 2: Static with Revalidation (ISR)
Cached for performance, updates every N seconds:

```javascript
export async function getStaticProps({ params }) {
  const product = await getProductBySlug(params.slug);
  return {
    props: { product },
    revalidate: 60 // Update every 60 seconds
  };
}
```

### Option 3: Client-Side
Fetch on page load (good for SPAs):

```javascript
useEffect(() => {
  fetch('/api/products?slug=liver-cleanse')
    .then(res => res.json())
    .then(setProduct);
}, []);
```

## Quick Links in PocketBase

### Add "View Live" Button

Edit `pb_hooks/product-links.pb.js`:

```javascript
onRecordViewRequest((e) => {
  const record = e.record;
  if (record.collection().name === 'products') {
    const liveUrl = `https://successchemistry.com/product/${record.getString('slug')}`;
    record.set('_liveUrl', liveUrl);
  }
}, 'products');
```

This adds a custom field showing the live URL in PocketBase admin.

## Admin Authentication

To show the edit button only to admins:

```javascript
// Check if user is logged into PocketBase
const pb = new PocketBase('http://localhost:8090');
const isAdmin = pb.authStore.isValid && pb.authStore.model?.collectionName === 'admins';
```

Or use a simple token:

```javascript
// After admin logs in
localStorage.setItem('pb_admin_token', 'your-secret-token');

// In EditButton component
const isAdmin = localStorage.getItem('pb_admin_token') === 'your-secret-token';
```

## Webhooks (Advanced)

Trigger actions when products are updated:

```javascript
// pb_hooks/product-webhooks.pb.js
onRecordAfterUpdateRequest((e) => {
  const product = e.record;
  
  // Clear cache
  fetch('https://your-site.com/api/revalidate?secret=token&path=/product/' + product.getString('slug'));
  
  // Notify team
  console.log(`Product updated: ${product.getString('name')}`);
  
  // Update search index, etc.
}, 'products');
```

## Example: Complete Product Page

```jsx
import { getProductBySlug, formatProduct } from './product-loader.js';
import EditButton from './components/EditButton.jsx';

export default function ProductPage({ product }) {
  const p = formatProduct(product);

  return (
    <div>
      <h1>{p.name}</h1>
      <img src={p.imageUrl} alt={p.name} />
      
      {/* Live description from PocketBase */}
      <div dangerouslySetInnerHTML={{ __html: p.description }} />
      
      <div>${p.price}</div>
      <button>Add to Cart</button>

      {/* Admin edit button */}
      <EditButton productId={p.id} productSlug={p.slug} />
    </div>
  );
}

export async function getServerSideProps({ params }) {
  const product = await getProductBySlug(params.slug);
  return { props: { product } };
}
```

## Testing

1. **Edit a product** in PocketBase admin:
   - Change description to "TEST EDIT"
   - Save

2. **Refresh your product page**:
   - Should show "TEST EDIT" immediately

3. **Check API**:
   ```bash
   curl http://localhost:3001/api/products?slug=liver-cleanse
   ```

## Troubleshooting

### Changes not appearing

1. **Check cache**: Clear browser cache or use incognito
2. **Check revalidation**: Lower `revalidate` time or use SSR
3. **Check API**: Test `/api/products` endpoint directly
4. **Check PocketBase**: Verify product saved correctly

### Edit button not showing

1. **Check admin auth**: Verify `localStorage.getItem('pb_admin_token')`
2. **Check component**: Make sure `EditButton` is imported
3. **Check CSS**: Button might be hidden behind other elements

### Images not loading

```javascript
// Make sure you're using the correct URL format:
const imageUrl = `${PB_URL}/api/files/products/${product.id}/${product.images[0]}`;
```

## Related Files

- `api/products.js` - API endpoint
- `deploy-site/product-loader.js` - Data fetching utilities
- `deploy-site/components/EditButton.jsx` - Admin edit button
- `pocketbase/pb_hooks/product-links.pb.js` - PocketBase hooks
