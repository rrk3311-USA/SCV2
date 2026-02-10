# Strapi backend for SCV2 orders

Strapi is the **preferred** orders backend. The app uses one backend with priority **Strapi → Supabase → Directus**. Set `STRAPI_URL` and `STRAPI_API_TOKEN` to use Strapi.

## Env vars

In `.env.local` and in Vercel (or your host):

- `STRAPI_URL` – Strapi base URL, e.g. `https://your-strapi.fly.dev` or `https://your-project.strapiapp.com` (no trailing slash).
- `STRAPI_API_TOKEN` – API token with create/read/update on the `order` content type (server-side only; do not expose as `NEXT_PUBLIC_*`).

Optional: `NEXT_PUBLIC_STRAPI_URL` is only used as a fallback for `STRAPI_URL` in the server client; you can rely on `STRAPI_URL` alone.

## Strapi content type: Order

Create a collection type in Strapi named **order** (API will be `/api/orders`).

| Field   | Type   | Notes |
|--------|--------|--------|
| `total` | Decimal (or Number) | Order total, e.g. 29.99 |
| `status` | Enumeration | Values: `pending`, `paid`, `cancelled` |
| `items` | JSON | Array of `{ sku, name, quantity, price }` |

- **Permissions:** In Strapi Admin → Settings → Users & Permissions → Roles → (e.g. “Full access” or a custom role used by the token), allow **Order**: create, find, findOne, update.
- **API token:** Create an API token (Settings → API Tokens) with access to the Order collection and use that value as `STRAPI_API_TOKEN`.

## Flow

1. User checks out → `POST /api/checkout` creates an order in Strapi and returns `orderId`.
2. User is sent to `/checkout?order_id=<id>`.
3. Checkout page loads order via `GET /api/orders/[id]` (Strapi).
4. After PayPal payment, `POST /api/orders/[id]/confirm` updates the order status to `paid` in Strapi.

## Hosting

- **Strapi Cloud:** Create a project, get the URL and create an API token; set `STRAPI_URL` and `STRAPI_API_TOKEN`.
- **Self‑hosted (e.g. Fly, Railway):** Deploy Strapi, expose the app URL, create an API token, set the same env vars in the Next.js app.

## Supabase / Directus

Strapi is checked first. If both Strapi and Supabase (or Directus) are set, Strapi is used. To use Supabase or Directus instead, leave `STRAPI_URL` unset.
