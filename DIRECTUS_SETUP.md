# Directus setup (v3)

The app uses Directus for **orders**, **order_items**, and **products**. Use your v3 instance (e.g. **https://scv3-directus-admin.fly.dev**). Checkout creates an order in Directus; the customer pays via PayPal on the `/checkout` page.

---

## Stop the setup page from showing every time

**1. Do not use `/admin/setup` to log in.**  
That URL is only for creating the *first* admin user, once. For normal login, use:

- **https://scv3-directus-admin.fly.dev**  
  or  
- **https://scv3-directus-admin.fly.dev/admin**

Bookmark that. Log in with the email and password you already chose. Do not open `/admin/setup` again.

**2. If you still get the setup page when you open the main URL** (no option to log in), Directus thinks there is no admin user. That usually means the **database is not persisting** (e.g. wrong or ephemeral DB). For **scv3-directus-admin** on Fly:

- In [Fly dashboard](https://fly.io/dashboard) open app **scv3-directus-admin** → **Secrets**.
- Ensure **DB_CONNECTION_STRING** points to a **real, persistent Postgres** (e.g. Fly Postgres, Neon, or Supabase Postgres). If it points to SQLite or a temp DB, the admin is lost on every restart.
- Set **ADMIN_EMAIL** and **ADMIN_PASSWORD** so Directus can create the admin on first run. After that, use the **login** URL above, not `/admin/setup`.
- Add **Redis** (see “Session keeps expiring” below) so your login session persists and you are not asked to sign in again every day.

---

## Env vars

In `.env.local` and in **Vercel** (Settings → Environment Variables), set:

- **DIRECTUS_URL** – Your Directus instance URL (e.g. `https://scv3-directus-admin.fly.dev`).
- **DIRECTUS_STATIC_TOKEN** – A static token from Directus (Admin → Settings → Access Tokens) with permission to create/read/update items in `orders`, `order_items`, and `products`.

Optional:

- **NEXT_PUBLIC_DIRECTUS_URL** – If you fetch products or other public data from Directus in the browser.

---

## Run Directus with Supabase only (no Fly)

Supabase gives you **Postgres**; it does not host the Directus app. So you run Directus on **Railway** or **Render** and point it at your **Supabase Postgres** + **Upstash Redis**. Then you never use Fly.

### 1. Supabase (database)

1. [Supabase](https://supabase.com) → your project (or create one).
2. **Settings → Database** → copy the **Connection string** (URI). Use the **Transaction** pooler or **Session** mode; replace the password placeholder if needed. It looks like:
   `postgresql://postgres.[project-ref]:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres`
3. For Directus you need a **direct** connection for migrations. In Supabase, **Settings → Database** also has “Direct connection” (port 5432). Use that for `DB_CONNECTION_STRING` if the pooler gives issues; otherwise the pooler URI is usually fine.

### 2. Railway or Render (run Directus)

**Railway**

1. [railway.app](https://railway.app) → New Project → **Deploy from GitHub** or **Empty project**.
2. Add a service: **Deploy from Docker image** → image: `directus/directus:11`.
3. Add **Variables** (env vars):
   - `DB_CLIENT=pg`
   - `DB_CONNECTION_STRING` = your Supabase Postgres URI from step 1
   - `KEY` = `openssl rand -hex 32`
   - `SECRET` = `openssl rand -hex 32`
   - `ADMIN_EMAIL` = your login email
   - `ADMIN_PASSWORD` = your login password
   - `PUBLIC_URL` = `https://your-app.up.railway.app` (Railway will give you this; set it after first deploy)
   - `CACHE_ENABLED=true`
   - `CACHE_STORE=redis`
   - `REDIS` = your Upstash Redis URL (e.g. `redis://default:xxx@xxx.upstash.io:6379` or `rediss://...:6380` from Upstash dashboard)
4. Deploy. Copy the public URL Railway gives you → set `PUBLIC_URL` to that and redeploy if you had a placeholder.
5. Open that URL once → you may see setup; complete it with the same email/password as `ADMIN_EMAIL`/`ADMIN_PASSWORD`. After that **always use the main URL to log in**, not `/admin/setup`.

**Render**

1. [render.com](https://render.com) → New → **Web Service**.
2. Connect repo or use **Docker**: image `directus/directus:11`.
3. Add the same **Environment** variables as in the Railway list above. Set `PUBLIC_URL` to your Render URL (e.g. `https://your-directus.onrender.com`).
4. Deploy. Open the URL, complete setup once if shown, then use the main URL to log in.

### 3. Point the app at your new Directus

In **Vercel** and **.env.local** set:

- **DIRECTUS_URL** = your new Directus URL (e.g. `https://your-app.up.railway.app` or `https://your-directus.onrender.com`) — **no trailing slash**.
- **DIRECTUS_STATIC_TOKEN** = create a token in Directus (Settings → Access Tokens) and paste it here.

Then run the setup script once so collections exist:

```bash
npx tsx scripts/setup-directus-collections.ts
npx tsx scripts/sync-products-to-directus.ts
```

After that, ignore the Fly URL. Use only your Supabase-backed Directus URL to log in.

---

## Directus on Fly – checklist (use this)

If you're using Fly (e.g. **scv3-directus-admin.fly.dev**), do these once so the setup page and login stop breaking.

**1. Persistent database**  
In Fly → your Directus app → **Secrets**. Set **DB_CONNECTION_STRING** to a **Postgres** URL that does not get wiped (e.g. Fly Postgres, Neon, or Supabase). If you use SQLite or a temp DB, the admin disappears on every restart and you'll see setup again.

**2. Admin and URL secrets**  
In the same app → **Secrets**, set:

- **ADMIN_EMAIL** = the email you want to log in with  
- **ADMIN_PASSWORD** = the password you want  
- **PUBLIC_URL** = your Directus URL with no trailing slash (e.g. `https://scv3-directus-admin.fly.dev`)  
- **DB_CLIENT** = `pg`  
- **KEY** = run `openssl rand -hex 32` and paste the output  
- **SECRET** = run `openssl rand -hex 32` again and paste  

**3. Redis (so you don’t have to sign in every day)**  
In the same app → **Secrets**, add:

- **CACHE_ENABLED** = `true`  
- **CACHE_STORE** = `redis`  
- **REDIS** = your Upstash Redis URL (e.g. `redis://default:YOUR_PASSWORD@xxx.upstash.io:6379` or the `rediss://` URL from Upstash). Use the **Redis URL** from the Upstash dashboard, not the REST URL.

**4. Deploy**  
Redeploy the app (e.g. from the Fly dashboard or `fly deploy -a scv3-directus-admin`) so all secrets are applied.

**5. Log in (never use /admin/setup for login)**  
Open **https://scv3-directus-admin.fly.dev** (or your app’s URL). If you see the setup screen, complete it **once** with the same email/password as **ADMIN_EMAIL** / **ADMIN_PASSWORD**. After that, **bookmark the main URL** and always log in there. Do not use `/admin/setup` again.

**6. App and Vercel**  
In **Vercel** and **.env.local** set **DIRECTUS_URL** to that same URL and **DIRECTUS_STATIC_TOKEN** to a token from Directus (Settings → Access Tokens). Then run:

**If the Fly machine "exhausted its maximum restart attempts"**  
Directus is crashing on start. Common cause with **Supabase** is missing SSL. In Fly → your app → **Secrets**, set **DB_CONNECTION_STRING** so the URL ends with **`?sslmode=require`**, e.g.  
`postgresql://postgres:YOUR_PASSWORD@db.jgkvccfdgpttpaxdiqjg.supabase.co:5432/postgres?sslmode=require`  
Then redeploy. To see why it crashed: Fly dashboard → your app → **Metrics** → **Machine logs**, or run `fly logs -a YOUR_APP_NAME`.

```bash
npx tsx scripts/setup-directus-collections.ts
npx tsx scripts/sync-products-to-directus.ts
```

---

## Required collections in Directus

**If you don’t see Orders, Order Items, or Products in the sidebar**, create them once via API (recommended) or in the admin.

### Option A: Create all collections via script (recommended)

From the project folder, with `DIRECTUS_URL` and `DIRECTUS_STATIC_TOKEN` in `.env.local` (e.g. pointing at **scv3-directus-admin.fly.dev**). The token must have **admin** or **full** access so it can create collections:

```bash
npx tsx scripts/setup-directus-collections.ts
```

This creates **orders**, **order_items**, and **products** (with all fields). After it runs, refresh Directus and you should see Orders, Order Items, and Products under Content. Then run the product sync to fill products:

```bash
npx tsx scripts/sync-products-to-directus.ts
```

### Option B: Create collections in the admin

1. Log in at your v3 Directus URL (e.g. **https://scv3-directus-admin.fly.dev**).
2. Open **Settings** (gear icon in the sidebar).
3. Go to **Data Model**.
4. Click **Create Collection**.

### Create the `orders` collection

- **Collection Name:** `orders` (this becomes the API key and the sidebar label).
- **Primary Key:** leave default (Auto-increment Integer, field name `id`).
- Click **Save**.
- Then add these **fields** to `orders` (Edit collection → **Fields** → **Create Field**):

| Field Name   | Type     | Interface / Notes                    |
|--------------|----------|-------------------------------------|
| status       | String   | Dropdown or Select; options: `pending`, `paid`, `cancelled` |
| total        | Decimal  | Default decimal                      |
| currency     | String   | Optional; default `USD`             |
| date_created | Timestamp| Optional; “Date & Time”             |
| paypal_order_id | String | Optional; for reference             |

Save the collection when done.

### Create the `order_items` collection

- **Data Model** → **Create Collection**.
- **Collection Name:** `order_items`.
- **Primary Key:** default (e.g. `id`).
- Click **Save**.
- Add these **fields**:

| Field Name | Type      | Interface / Notes                          |
|------------|-----------|--------------------------------------------|
| order_id   | Integer   | **Relation** → Many-to-One → **orders**   |
| sku        | String    |                                            |
| name       | String    |                                            |
| quantity   | Integer   |                                            |
| price      | Decimal   |                                            |

When you create the **order_id** relation, set:
- **Related Collection:** `orders`
- **Relation type:** Many to One (many order_items → one order)
- **Reverse name on orders:** `order_items` (so the app can load `order_items` on each order)

Save. After that you should see **Orders** and **Order Items** (or **orders** / **order_items**) in the sidebar under **Content**. New checkouts (when the app uses Directus) will create rows there.

### Reference (same info in table form)

**1. `orders`**

| Field        | Type     | Notes                          |
|-------------|----------|--------------------------------|
| id          | Primary Key (auto) | Default                         |
| status      | Dropdown | Options: `pending`, `paid`, `cancelled` |
| total       | Decimal  | Order total (e.g. 49.99)       |
| currency    | String   | Optional, default `USD`        |
| date_created| DateTime | Optional, auto on create       |
| paypal_order_id | String | Optional, for reference        |

**2. `order_items`**

| Field     | Type    | Notes                          |
|----------|---------|--------------------------------|
| id       | Primary Key (auto) | Default                  |
| order_id | Many-to-One → **orders** | Relation to order |
| sku      | String  | Product SKU                    |
| name     | String  | Product name                   |
| quantity | Integer | Quantity                       |
| price    | Decimal | Unit price                     |

The app expects the reverse relation on `orders` to be named `order_items`. If you use a different name, update `getOrder()` in `src/lib/directus.ts` to use that name (e.g. `items`).

### 3. `products`

Used for viewing/editing the catalog in Directus. The setup script creates this; if you created it manually instead:

| Field             | Type    | Notes                                      |
|-------------------|---------|--------------------------------------------|
| id                | Primary Key (auto) | Default                              |
| slug              | String  | Unique; used for URLs                      |
| sku               | String  | Product SKU                               |
| name              | String  | Display name                               |
| price             | Decimal | Unit price                                 |
| category          | String  | e.g. Best Seller, Bundle Deals             |
| short_description | Text    | Optional                                   |
| description       | Text    | Optional                                   |
| image             | String  | Main image URL/path                        |
| images            | JSON    | Array of image URLs (e.g. `["/img/1.png"]`) |
| sort_order        | Integer | Order in list (optional)                   |

After the collections exist, from the project folder run (with `DIRECTUS_URL` and `DIRECTUS_STATIC_TOKEN` in `.env.local`):

```bash
npx tsx scripts/sync-products-to-directus.ts
```

This pushes all products from the built-in catalog into Directus so they show under **Content → products**.

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

2. **Point the app at it** in `.env.local`:
   ```bash
   DIRECTUS_URL=http://localhost:8055
   DIRECTUS_STATIC_TOKEN=your-token-from-directus-admin
   ```

3. Run `npm run dev`, then open **http://localhost:8000/admin** — you’ll be redirected to the Directus admin. Or open **http://localhost:8055** directly.

Create the `orders` and `order_items` collections in Directus (see above) and create a static token under Directus Admin → Settings → Access Tokens.

---

## Why are there no orders or customers?

**Orders**  
Checkout sends orders to **Supabase if it’s configured, otherwise to Directus.**  
If you have `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` set (e.g. in Vercel), **all orders go to Supabase**, so Directus stays empty.  
To get orders in Directus: remove or leave unset those Supabase env vars in Vercel (and locally) so the app uses Directus only. New checkouts will then create orders in Directus.

**Customers**  
There is **no “customers” collection** in this setup. The app only has `orders` and `order_items` in Directus; it doesn’t store customer name, email, or address there. If you want customers in Directus, you need to add a `customers` collection and update checkout to save (or link) customer data.

---

## Session keeps expiring / “keeps making me sign in again”

If Directus runs on a host that restarts or scales (e.g. serverless, Supabase, or sleep/wake), **in-memory** session/cache is lost and you get asked to sign in again.

**Fix: use Redis** so cache (and session state) persist. Set these env vars where Directus runs: `CACHE_ENABLED=true`, `CACHE_STORE=redis`, `REDIS=<your-redis-url>`.

**Using Supabase (or Vercel / Railway / Render, not Fly):**

1. **Get Redis** – e.g. [Upstash Redis](https://upstash.com/) (free tier). Create a database and copy the **Redis URL** (often `rediss://default:...@...upstash.io:6379`).
2. **Where Directus is hosted**: add env vars `CACHE_ENABLED=true`, `CACHE_STORE=redis`, `REDIS=<paste-url>`. URL-encode special characters in the password (`#` → `%23`, `$` → `%24`, `*` → `%2A`).
3. **Redeploy** Directus so the new env is used.

**Using Fly.io for Directus:**

1. Create Redis: `fly redis create`; note the connection URL.
2. Set secrets: `fly secrets set CACHE_ENABLED=true -a YOUR-APP`, then `CACHE_STORE=redis`, then `REDIS="..."`.
3. Redeploy: `fly deploy -a YOUR-APP`.

After this, sessions survive restarts and you shouldn’t be forced to sign in again every time.

## Permissions

Ensure the token used in `DIRECTUS_STATIC_TOKEN` can:

- **Create** and **Read** items in `orders` and `order_items`.
- **Update** items in `orders` (for setting `status` to `paid` after payment).
