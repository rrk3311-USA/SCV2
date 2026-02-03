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

## Cart / frontend config

Point your frontend to this API:

- Production: `https://success-chemistry-api.fly.dev`
- Or add `API_BASE: "https://success-chemistry-api.fly.dev"` in `config.js` for production.
