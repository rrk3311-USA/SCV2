# Medusa + PayPal Setup Checklist

Status of each step and what’s left to do.

---

## 1. PayPal payment provider (Medusa backend) — **NOT DONE**

**Status:** Medusa v2 does **not** ship an official PayPal payment provider. The backend at `medusa-backend` currently has:

- **No** `@medusajs/medusa-payment-paypal` (that package is for Medusa v1).
- **No** `modules` in `medusa-config.ts`; only `projectConfig` and `admin`. So the Payment module uses defaults (system provider only).
- Regions use `payment_providers: ["pp_system_default"]` (seed and import script).

**Options:**

- **Stripe (official, documented):** Add the payment module and Stripe provider in `medusa-config.ts` (see [Medusa v2 Payment Module Options](https://docs.medusajs.com/resources/commerce-modules/payment/module-options) and [Stripe provider](https://docs.medusajs.com/resources/commerce-modules/payment/payment-provider/stripe)). Then enable Stripe in the region (Admin → Settings → Regions). The SCV2 checkout API would need to use the Stripe provider id instead of PayPal.
- **PayPal:** Use a **v2-compatible** PayPal provider (community or custom that extends `AbstractPaymentProvider`). Register it under the Payment module’s `providers` in `medusa-config.ts` the same way as Stripe, then add the provider id to the region’s `payment_providers` and re-run seed/import or update the region in Admin.

**If you add a PayPal provider** (once you have a v2-compatible one), in `medusa-backend`:

1. Install it, e.g. `npm install <paypal-provider-package>`.
2. In `medusa-config.ts`, add a `modules` array and the Payment module with `providers`, e.g.:
   ```ts
   modules: [
     {
       resolve: "@medusajs/medusa/payment",
       options: {
         providers: [
           { resolve: "<paypal-provider-package>", id: "paypal", options: { clientId: process.env.PAYPAL_CLIENT_ID, clientSecret: process.env.PAYPAL_CLIENT_SECRET, ... } },
         ],
       },
     },
   ],
   ```
3. Add `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET` to `medusa-backend/.env`.
4. Update the region’s `payment_providers` to include the new provider id (e.g. `pp_paypal_paypal`) in seed/import or via Admin, then re-seed or run import as needed.

---

## 2. PayPal credentials (Medusa backend `.env`) — **NOT DONE**

**Status:** `medusa-backend/.env.template` has no PayPal vars.

**To do:** In `medusa-backend/.env` add (when you have a PayPal provider):

```env
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
```

Optional for sandbox: `PAYPAL_SANDBOX=true`. For webhooks: `PAYPAL_AUTH_WEBHOOK_ID=...` and configure PayPal to send webhooks to `{MEDUSA_BACKEND_URL}/paypal/hooks` (or the path your provider documents).

---

## 3. Frontend (SCV2 `.env`) — **READY**

**Status:** SCV2 is set up to use Medusa.

- `.env.example` has:
  - `NEXT_PUBLIC_MEDUSA_URL=https://your-medusa.fly.dev`
- Cart checkout calls `POST /api/medusa-checkout` and redirects to the returned PayPal URL or to `{MEDUSA_URL}/checkout?cart_id=...`.

**To do:** Set in your real `.env` (or Vercel):

```env
NEXT_PUBLIC_MEDUSA_URL=https://medusa-backend-dark-resonance-4960.fly.dev
```

(Replace with your real Medusa backend URL if different.)

---

## 4. Success/return URL (order confirmation) — **DONE**

**Status:** Implemented in SCV2.

- Order confirmation page: `/order-confirmation?orderId=ORDER_ID&value=ORDER_TOTAL`
- `PurchaseTracker` reads `orderId` and `value` from the URL and calls `reportPurchase(orderId, value)` for GA4 and Google Ads.

**To do (backend/PayPal):** Configure your Medusa PayPal provider (or PayPal app) so that after payment it redirects to:

```text
https://<your-scv2-domain>/order-confirmation?orderId=ORDER_ID&value=ORDER_TOTAL
```

Use the real Medusa order id and order total so tracking is correct.

---

## 5. Import products (Medusa backend) — **DONE**

**Status:** Scripts exist and are documented.

- `medusa-backend`: `npm run seed` then `npm run import:products` (see `medusa-backend/IMPORT_PRODUCTS.md`).
- Products come from `medusa-backend/data/success-products.json`; the import script creates the US region and products.

**To do:** Run once per environment (and again when you add/change products):

```bash
cd /Users/r-kammer/Documents/GitHub/medusa-backend
npm run seed
npm run import:products
```

On Fly, run the same via `fly ssh console` (see IMPORT_PRODUCTS.md).

---

## Summary

| Step | Status | Where |
|------|--------|--------|
| 1. PayPal provider in Medusa backend | **Not done** – no v2 PayPal provider installed/configured | `medusa-backend` |
| 2. PayPal env in Medusa backend | **Not done** – add when provider is added | `medusa-backend/.env` |
| 3. SCV2 frontend Medusa URL | **Ready** – set `NEXT_PUBLIC_MEDUSA_URL` in env | SCV2 `.env` / Vercel |
| 4. Success URL / order confirmation | **Done** – page and `reportPurchase` implemented | SCV2 |
| 5. Seed + import products | **Done** – run `seed` then `import:products` | `medusa-backend` |

So: **we do not already have the Medusa + PayPal backend part done.** The frontend (SCV2) and order-confirmation tracking are ready; the missing piece is adding and configuring a **Medusa v2–compatible PayPal payment provider** in the backend and then setting success/return URL to the SCV2 order-confirmation URL above.
