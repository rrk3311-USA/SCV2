# Google Pay – Setup and integration

Google Pay is integrated on the cart and product pages. When enabled, a Google Pay button appears next to PayPal. The same order-confirmation flow and tracking (GA4 + Google Ads conversion) apply.

## Quick start (test mode)

1. In `.env.local` set:
   - `NEXT_PUBLIC_GOOGLE_PAY_ENABLED=true`
   - `NEXT_PUBLIC_GOOGLE_PAY_ENVIRONMENT=TEST`
2. Run the app and open the cart (with items) or a product page. The Google Pay button appears if the browser supports it.
3. In TEST mode, the payment sheet uses dummy payment methods (non-chargeable). The app still redirects to `/order-confirmation?orderId=...&value=...` and tracking fires. The API route returns a stub order (no real charge).

## Production

1. **Google Pay Business Console** – [pay.google.com/business/console](https://pay.google.com/business/console): register your domain and get your **Merchant ID**.
2. **Payment processor** – Google Pay returns a token that your backend must process:
   - **Stripe:** Set `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (and use Stripe server-side to create PaymentIntent / confirm with the Google Pay token). The button will use Stripe tokenization when in PRODUCTION and this key is set.
   - **Other gateways:** See [Google Pay gateway list](https://developers.google.com/pay/api/web/reference/request-objects#gateway). You can add another tokenization branch in `GooglePayButton.tsx` (e.g. Braintree) and process the token in `/api/google-pay/route.ts`.
3. **Env for production:**
   - `NEXT_PUBLIC_GOOGLE_PAY_ENABLED=true`
   - `NEXT_PUBLIC_GOOGLE_PAY_ENVIRONMENT=PRODUCTION`
   - `NEXT_PUBLIC_GOOGLE_PAY_MERCHANT_ID=<your merchant id>`
   - If using Stripe: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...`
4. **API route** – Edit `src/app/api/google-pay/route.ts` to:
   - Use `paymentMethodData.tokenizationData` (token + type) to charge via your gateway.
   - Create the order in your backend (PocketBase, Directus, etc.).
   - Return the real `orderId` and `value`.

## Get Google Pay on your live site (for screenshots)

So the **real** site (e.g. successchemistry.com or your Vercel URL) shows the Google Pay button and you can capture the buyflow screenshots:

1. **Vercel** (or your host) → your SCV2 project → **Settings** → **Environment Variables**.
2. Add (for **Production**, and optionally Preview):
   - `NEXT_PUBLIC_GOOGLE_PAY_ENABLED` = `true`
   - `NEXT_PUBLIC_GOOGLE_PAY_ENVIRONMENT` = `TEST`
   - `NEXT_PUBLIC_GOOGLE_PAY_MERCHANT_ID` = `BCR2DN5T5367NUIC` (or your merchant ID)
3. **Redeploy**: **Deployments** → … on latest → **Redeploy** (or push a commit).  
   Next.js bakes `NEXT_PUBLIC_*` at **build** time, so a new deployment is required after adding/changing these.
4. **Verify on the live URL:**
   - Open your **live** site (not localhost).
   - Add a product to the cart and go to the cart page: you should see **“Pay with Google Pay”** next to “Checkout with PayPal”.
   - Open a product page: you should see the Google Pay button below the PayPal block.
   - If you don’t, check the env vars are set for **Production** and that you redeployed **after** saving them.

Then use the live site to take the five buyflow screenshots (item selection, pre-purchase, payment method, Google Pay sheet, post-purchase).

## Where the button appears

- **Cart** (`/cart`): Next to “Checkout with PayPal”. On success, cart is cleared and user is redirected to order-confirmation.
- **Product page**: Below PayPal buttons; one-click buy for that product (single line item).

## Tracking

No extra work. `PurchaseTracker` on `/order-confirmation` fires `reportPurchase(orderId, value)` and `reportGoogleAdsConversion(value)` for every successful payment, including Google Pay.

## Files

| File | Role |
|------|------|
| `src/components/GooglePayButton.tsx` | Loads Google Pay script, readiness check, payment sheet, POST to API, redirect. |
| `src/app/api/google-pay/route.ts` | Accepts payment data + items; returns orderId + value (stub by default). |
| `src/components/CartContents.tsx` | Renders Google Pay with cart items and clearCart on success. |
| `src/components/ProductPurchaseBlock.tsx` | Renders Google Pay for single product. |
| `src/lib/cart.ts` | `clearCart()` used after successful Google Pay from cart. |

## References

- [Google Pay Web](https://developers.google.com/pay/api/web/overview)
- [Google Pay tutorial](https://developers.google.com/pay/api/web/guides/tutorial)
- [Stripe Google Pay](https://stripe.com/docs/google-pay)
