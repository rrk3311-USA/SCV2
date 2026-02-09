# SCV2 Frontend ↔️ Directus Backend

SCV2 uses **Directus** for orders (and optionally products). Medusa has been removed.

## Configuration

### Environment variables

In `.env.local` and in **Vercel**:

```bash
DIRECTUS_URL=https://your-directus-instance.com
DIRECTUS_STATIC_TOKEN=your-static-token
```

See **DIRECTUS_SETUP.md** for the required Directus schema (`orders` and `order_items` collections).

### Checkout flow

1. Cart (localStorage) → **Checkout with PayPal** → `POST /api/checkout` creates order in Directus.
2. Redirect to `/checkout?order_id=<id>`.
3. Customer pays with PayPal (via PocketBase); on success the order is marked **paid** in Directus and the customer is sent to `/order-confirmation`.

### PayPal

PayPal is handled by **PocketBase** (`NEXT_PUBLIC_API_BASE`). Set `NEXT_PUBLIC_PAYPAL_CLIENT_ID` and `NEXT_PUBLIC_API_BASE` for product-page and cart checkout PayPal buttons.

## Run locally

```bash
cd SCV2
npm install
npm run dev
```

Open **http://localhost:8000**. Ensure Directus is running and env vars are set so checkout works.

## Next steps

1. Create the `orders` and `order_items` collections in Directus (see DIRECTUS_SETUP.md).
2. Create a static token with create/read/update access to those collections.
3. Set `DIRECTUS_URL` and `DIRECTUS_STATIC_TOKEN` in Vercel and redeploy.
