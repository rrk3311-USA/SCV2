# Admin API – Single backend (PocketBase on Fly.io)

All admin API functionality (orders, PayPal, ShipStation) runs on **one machine**: the PocketBase app **success-chemistry-pb**. There is no separate Node.js Admin API app in production.

## Live URL

**https://success-chemistry-pb.fly.dev**

- Health: `https://success-chemistry-pb.fly.dev/api/health`
- API info: `https://success-chemistry-pb.fly.dev/api`
- Orders: `GET /api/orders`, `POST /api/orders`
- PayPal: `POST /api/paypal/orders`, `POST /api/paypal/orders/:id/pay`
- ShipStation Custom Store: `GET /api/shipstation`, `POST /api/shipstation`

## Deploy PocketBase (single backend)

```bash
cd pocketbase
fly deploy
```

Secrets are not required for the API routes: PayPal and ShipStation credentials are stored in the PocketBase **api_config** collection (created by migration). After deploy, add one record in the PocketBase admin (`https://success-chemistry-pb.fly.dev/_/`) under **api_config** with your PayPal client ID/secret and ShipStation store user/password.

## Frontend config

- **deploy-site**: `config.js` uses `API_BASE: "https://success-chemistry-pb.fly.dev"` and `getApiBase()` for cart, PayPal, and admin dashboard.
- **SCV2**: set `NEXT_PUBLIC_ADMIN_API_URL=https://success-chemistry-pb.fly.dev`. See [SCV2_ADMIN_API.md](./SCV2_ADMIN_API.md).

After changing config, redeploy the static site (e.g. Vercel) so the latest `config.js` and admin/cart pages are live.

## Public admin dashboard

The dashboard at **`/admin/`** (e.g. `https://successchemistry.com/admin/`) loads orders via `GET https://success-chemistry-pb.fly.dev/api/orders`. No login; it reads from the PocketBase **orders** collection.

If changes don’t show: redeploy the site so the updated `deploy-site/admin/index.html` and `config.js` are served.

## Retiring the Node.js Admin API (success-chemistry-api)

The previous setup used two Fly apps:

- **success-chemistry-pb**: PocketBase (DB, files, admin UI)
- **success-chemistry-api**: Node.js `admin-api-server.js` (PayPal, ShipStation, orders)

All that logic now lives in PocketBase hooks (`pocketbase/pb_hooks/api-routes.pb.js`). To retire the Node API:

1. Point all frontends to `https://success-chemistry-pb.fly.dev` (done in `config.js`, admin, cart, SCV2 docs).
2. Redeploy PocketBase and add **api_config** in the PB admin.
3. Verify health, orders, PayPal, and ShipStation against the PB URL.
4. Stop or destroy the old app:  
   `fly apps destroy success-chemistry-api`  
   (Optional: keep the app but scale to 0 if you want a quick rollback.)

The Node API app and its config have been removed from the repo; the single backend is PocketBase only.
