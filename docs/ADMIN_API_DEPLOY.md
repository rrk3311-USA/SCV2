# Admin API – Deploy to Fly.io

The admin-api-server runs PayPal, ShipStation Custom Store, and PocketBase order creation. To make it live on the internet:

## First-time setup

1. **Install Fly CLI** (if needed): https://fly.io/docs/hands-on/install-flyctl/

2. **Login**: `fly auth login`

3. **Create app** (from project root):
   ```bash
   fly apps create success-chemistry-api
   ```
   (Skip if the app already exists from a prior deploy.)

## Deploy

```bash
cd /path/to/success007
fly deploy -c fly.admin-api.toml
```

## Set secrets (required for live use)

```bash
fly secrets set -a success-chemistry-api \
  PB_URL="https://success-chemistry-pb.fly.dev" \
  PB_ADMIN_EMAIL="your_admin@email.com" \
  PB_ADMIN_PASSWORD="your_pb_password" \
  SHIPSTATION_STORE_USER="your_supplier_username" \
  SHIPSTATION_STORE_PASSWORD="your_supplier_password"
```

For PayPal (sandbox or live):

```bash
fly secrets set -a success-chemistry-api \
  PAYPAL_MODE="sandbox" \
  PAYPAL_SANDBOX_CLIENT_ID="AfUHsoJ2uDH7vJ-XDc8b2H0MGTtlGqVeEUkORnzKqePIvKFt5G-eKtlOg4Bl7dexwKE5vz7glt1vXqfC" \
  PAYPAL_SANDBOX_CLIENT_SECRET="your_sandbox_secret"
```

## Live URL

After deploy:

**https://success-chemistry-api.fly.dev**

- Health: `https://success-chemistry-api.fly.dev/api/health`
- ShipStation: `https://success-chemistry-api.fly.dev/api/shipstation`
- Orders: `POST https://success-chemistry-api.fly.dev/api/orders`
- PayPal: `POST https://success-chemistry-api.fly.dev/api/paypal/orders`

## Update after changes

```bash
fly deploy -c fly.admin-api.toml
```

## Public admin dashboard

The **public admin** is the dashboard at **`/admin/`** (e.g. `https://successchemistry.com/admin/`). It lives in `deploy-site/admin/` and:

- Loads **orders** from the Admin API: `GET /api/orders` (no login; reads from PocketBase when configured).
- Uses **`/config.js`** for the API base: `getApiBase()` or `CONFIG.API_BASE` → `https://success-chemistry-api.fly.dev`.

**Why changes don’t show:**

1. **Frontend not redeployed** – The site (Vercel) serves cached files. Redeploy the site so the latest `deploy-site/admin/index.html` and `config.js` are live.
2. **API not redeployed** – Orders are listed from PocketBase via the Admin API. Redeploy the API so `GET /api/orders` uses the new PocketBase-backed logic: `fly deploy -c fly.admin-api.toml`.
3. **Secrets** – The API needs `PB_ADMIN_EMAIL` and `PB_ADMIN_PASSWORD` so it can read orders from PocketBase.

After redeploying both the site and the API, the admin dashboard will show real orders from PocketBase.

## Cart / frontend config

The **frontend is SCV2** (Next.js storefront). Point it to this API:

- Production: `https://success-chemistry-api.fly.dev`
- SCV2: set `NEXT_PUBLIC_ADMIN_API_URL=https://success-chemistry-api.fly.dev` and use it for `/api/orders` and `/api/paypal/orders`. See [SCV2_ADMIN_API.md](./SCV2_ADMIN_API.md).
- Static deploy-site: `config.js` uses `API_BASE: "https://success-chemistry-api.fly.dev"` and `getApiBase()` for cart/PayPal.
