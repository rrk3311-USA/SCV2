# 🎨 Live Product Editing - Setup Complete!

Your product pages now load live data from PocketBase with automatic fallback to static data.

## ✅ What's Integrated

| File | Purpose |
|------|---------|
| `product-pb-loader.js` | Smart loader that tries PocketBase first, falls back to static |
| `product/index.html` | Updated to use the new loader |
| `api/products.js` | API endpoint for fetching from PocketBase |

## 🚀 How It Works

```
User visits product page
    ↓
Try PocketBase API (5 sec timeout)
    ↓
Success? → Show live data + Edit button
    ↓
Fail? → Fall back to products-data.js
    ↓
Render product page
```

## 📝 Editing Workflow

### For You (Admin):

1. **Visit any product page** on your site
2. **See indicators**:
   - Green badge: "Live from PocketBase" (top right)
   - Purple button: "Admin Mode" with edit/refresh (bottom right)
3. **Click "Edit in PocketBase"** → Opens PB admin
4. **Edit description, price, etc.** in rich text editor
5. **Click Save** in PocketBase
6. **Click "Refresh"** button → See changes instantly!

### What You Can Edit:

- ✅ Product name
- ✅ Description (rich text with HTML)
- ✅ Short description
- ✅ Price
- ✅ Stock status
- ✅ Images
- ✅ Category
- ✅ Ingredients
- ✅ Supplement facts
- ✅ Any custom field

## 🔧 Configuration

### Environment Variables

```bash
# .env (for API endpoint)
PB_URL=http://localhost:8090  # or https://success-chemistry-pb.fly.dev
PB_ADMIN_EMAIL=admin@successchemistry.com
PB_ADMIN_PASSWORD=your-password
```

### Toggle Live Data

In `product-pb-loader.js`:

```javascript
class ProductLoader {
    constructor() {
        this.useLiveData = true; // Set to false to disable PocketBase
    }
}
```

## 🎯 Admin Authentication

To see the edit button, you need to be logged in as admin:

### Method 1: Simple Token (Quick)

```javascript
// In browser console after logging into PocketBase:
localStorage.setItem('pb_admin_token', 'your-secret-token');
```

### Method 2: PocketBase Auth (Secure)

```javascript
// Login via PocketBase SDK
const pb = new PocketBase('http://localhost:8090');
await pb.admins.authWithPassword('admin@example.com', 'password');
// Auth token is automatically stored
```

## 📊 Data Flow

### Live Data (PocketBase):
```
product/10777-810
    ↓
product-pb-loader.js
    ↓
/api/products?sku=10777-810
    ↓
PocketBase API
    ↓
Returns: { name, description, price, images, ... }
    ↓
Renders with edit button
```

### Fallback (Static):
```
product/10777-810
    ↓
product-pb-loader.js
    ↓
PocketBase fails/timeout
    ↓
products-data.js
    ↓
Returns: PRODUCTS_DATA['10777-810']
    ↓
Renders without edit button
```

## 🧪 Testing

### Test Live Data:

1. **Start PocketBase**:
   ```bash
   cd pocketbase
   ./pocketbase serve
   ```

2. **Start your API** (if separate):
   ```bash
   node local-server.js
   # Admin API (orders, PayPal, ShipStation) is on PocketBase: npm run pocketbase
   ```

3. **Visit a product page**:
   ```
   http://localhost:8080/product/10777-810
   ```

4. **Check console**:
   ```
   ✅ Loaded from PocketBase: 10777-810
   📊 Data source: PocketBase (Live)
   ```

5. **Edit in PocketBase**:
   - Change description to "TEST EDIT"
   - Save
   - Click "Refresh" button
   - Should show "TEST EDIT"

### Test Fallback:

1. **Stop PocketBase**
2. **Visit product page**
3. **Check console**:
   ```
   ⚠️ PocketBase fetch failed, falling back to static data
   📄 Using static data: 10777-810
   📊 Data source: Static
   ```

## 🎨 UI Indicators

### Live Data Badge (Top Right):
```
┌──────────────────────────┐
│ ● Live from PocketBase   │
└──────────────────────────┘
```

### Admin Edit Button (Bottom Right):
```
┌─────────────────────────────────┐
│ Admin Mode                      │
│ [✏️ Edit in PocketBase] [🔄 Refresh] │
└─────────────────────────────────┘
```

### Static Data Badge:
```
┌──────────────────┐
│ ○ Static Data    │
└──────────────────┘
```

## 🔄 Cache Management

The loader caches products for 5 minutes to improve performance.

### Clear cache manually:

```javascript
// Clear specific product
window.productLoader.clearCache('10777-810');

// Clear all products
window.productLoader.clearCache();

// Reload page
window.location.reload();
```

### Or use the Refresh button (does both automatically)

## 🚨 Troubleshooting

### Edit button not showing

1. **Check admin auth**:
   ```javascript
   console.log(localStorage.getItem('pb_admin_token'));
   console.log(localStorage.getItem('pocketbase_auth'));
   ```

2. **Check if using live data**:
   ```javascript
   console.log(window.productLoader.useLiveData);
   ```

3. **Login to PocketBase**:
   - Visit http://localhost:8090/_/
   - Login as admin
   - Refresh product page

### Changes not appearing

1. **Clear cache**: Click "Refresh" button
2. **Check PocketBase**: Verify product saved correctly
3. **Check API**: Test `/api/products?sku=10777-810`
4. **Check console**: Look for errors

### PocketBase not loading

1. **Check PocketBase is running**:
   ```bash
   curl http://localhost:8090/api/health
   ```

2. **Check API endpoint**:
   ```bash
   curl http://localhost:3001/api/products?sku=10777-810
   ```

3. **Check environment variables**:
   ```bash
   echo $PB_URL
   echo $PB_ADMIN_EMAIL
   ```

4. **Check browser console** for CORS errors

## 📦 Deployment

### Production Setup:

1. **Update config** in `product-pb-loader.js`:
   ```javascript
   const PB_CONFIG = {
       url: 'https://success-chemistry-pb.fly.dev',
       apiUrl: 'https://successchemistry.com'
   };
   ```

2. **Set environment variables** on your host (Vercel/Netlify/etc.):
   ```
   PB_URL=https://success-chemistry-pb.fly.dev
   PB_ADMIN_EMAIL=admin@successchemistry.com
   PB_ADMIN_PASSWORD=your-password
   ```

3. **Deploy**:
   ```bash
   git add .
   git commit -m "Add live PocketBase editing"
   git push
   ```

## 🎉 You're Done!

Your product pages now:
- ✅ Load live data from PocketBase
- ✅ Fall back to static data automatically
- ✅ Show edit button for admins
- ✅ Cache for performance
- ✅ Work offline with static data

**Edit products in PocketBase and see changes instantly on your site!**

---

## 📚 Related Documentation

- [PocketBase Live Editing Guide](../pocketbase/LIVE_EDITING_GUIDE.md)
- [PocketBase README](../pocketbase/README.md)
- [API Products Endpoint](../api/products.js)
- [Product Loader Source](./product-pb-loader.js)
