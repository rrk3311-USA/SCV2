# Directus setup for SCV2

SCV2 uses Directus for **orders** (and optionally products later). Checkout creates an order in Directus, then the customer pays via PayPal on the `/checkout` page.

## Env vars

In `.env.local` and in **Vercel** (Settings → Environment Variables), set:

- **DIRECTUS_URL** – Your Directus instance URL (e.g. `https://your-project.directus.app`).
- **DIRECTUS_STATIC_TOKEN** – A static token from Directus (Admin → Settings → Access Tokens) with permission to create/read/update items in the `orders` and `order_items` collections.

Optional:

- **NEXT_PUBLIC_DIRECTUS_URL** – If you later fetch products or other public data from Directus in the browser.

## Required collections in Directus

Create two collections in your Directus project.

### 1. `orders`

| Field        | Type     | Notes                          |
|-------------|----------|--------------------------------|
| id          | Primary Key (auto) | Default                         |
| status      | Dropdown | Options: `pending`, `paid`, `cancelled` |
| total       | Decimal  | Order total (e.g. 49.99)       |
| currency    | String   | Optional, default `USD`        |
| date_created| DateTime | Optional, auto on create       |
| paypal_order_id | String | Optional, for reference        |

### 2. `order_items`

| Field     | Type    | Notes                          |
|----------|---------|--------------------------------|
| id       | Primary Key (auto) | Default                  |
| order_id | Many-to-One → **orders** | Relation to order |
| sku      | String  | Product SKU                    |
| name     | String  | Product name                   |
| quantity | Integer | Quantity                       |
| price    | Decimal | Unit price                     |

Create the **Many-to-One** relation from `order_items.order_id` to `orders.id` in Directus (Relations). If you name the reverse relation on `orders` something other than `order_items`, the app fetches with `fields=*,order_items.*` — either name your relation `order_items` or update `getOrder()` in `src/lib/directus.ts` to use your relation name (e.g. `items`).

## Flow

1. Customer adds items to cart (localStorage), goes to **Cart** and clicks **Checkout with PayPal**.
2. `POST /api/checkout` receives the cart, creates one **order** and several **order_items** in Directus, returns `{ orderId, checkoutUrl }`.
3. Customer is redirected to `/checkout?order_id=<id>`.
4. Checkout page loads the order from Directus via `GET /api/orders/<id>`, shows total and a PayPal button.
5. PayPal flow uses PocketBase (`NEXT_PUBLIC_API_BASE` + `/api/paypal/orders` and `/api/paypal/orders/:id/pay`).
6. On payment success, `POST /api/orders/<id>/confirm` sets the order **status** to `paid`, then the client redirects to `/order-confirmation?orderId=...&value=...`.

## Local admin preview

To use the admin (Directus dashboard) locally:

1. **Run Directus** in a separate folder (or use Docker):
   ```bash
   npx create-directus-project my-directus
   cd my-directus
   npx directus start
   ```
   Or with an existing Directus project: `npx directus start`. Default URL: **http://localhost:8055**.

2. **Point SCV2 at it** in `SCV2/.env.local`:
   ```bash
   DIRECTUS_URL=http://localhost:8055
   DIRECTUS_STATIC_TOKEN=your-token-from-directus-admin
   ```

3. In SCV2 run `npm run dev`, then open **http://localhost:8000/admin** — you’ll be redirected to the Directus admin. Or open **http://localhost:8055** directly.

Create the `orders` and `order_items` collections in Directus (see above) and create a static token under Directus Admin → Settings → Access Tokens.

---

## Permissions

Ensure the token used in `DIRECTUS_STATIC_TOKEN` can:

- **Create** and **Read** items in `orders` and `order_items`.
- **Update** items in `orders` (for setting `status` to `paid` after payment).
