# SCV2 integrations (PayPal, Google Ads, GA4, enhanced conversions, deep tracking)

## Already connected

- **PayPal** – Product pages use `PayPalProductButtons`; orders go through PocketBase (`NEXT_PUBLIC_API_BASE`). Set **Vercel** env: `NEXT_PUBLIC_PAYPAL_CLIENT_ID` and `NEXT_PUBLIC_API_BASE`.
- **Yotpo** – Reviews and star ratings on product pages; conversion tracking on order confirmation. Set **Vercel** env: `NEXT_PUBLIC_YOTPO_APP_KEY` (from Yotpo → Settings → General → App Key). Optional: `NEXT_PUBLIC_SITE_URL` for absolute product/image URLs (defaults to `https://www.successchemistry.com`). Components: `YotpoScript` (layout), `YotpoReviews` (product page), `YotpoConversionTracker` (order confirmation).

## Google Analytics & Google Ads

The root layout loads an **Analytics** component that injects:

- **Google Analytics 4** when `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set (e.g. `G-XXXXXXXXXX`).
- **Google Tag Manager** when `NEXT_PUBLIC_GTM_ID` is set (e.g. `GTM-XXXXXXX`). Use GTM to add GA4, Google Ads conversion, or other tags without code changes.
- **Google Ads** when `NEXT_PUBLIC_GOOGLE_ADS_ID` is set (e.g. `AW-XXXXXXXX`), only if GTM is not set. Purchase conversions fire after PayPal success; add_to_cart on Add to Cart. **Enhanced conversions**: contact form submits send hashed email/name (SHA-256) via `user_data`; turn on “Enhanced conversions” in Google Ads (Goals → Settings) and accept customer data terms. When Google Ads asks “Choose a method,” select **Google Tag** (or **Google Tag Manager** if you use GTM)—**not** “Google Ads API.” We send conversion and user data via the website gtag/GTM, not via the API.
- **Deep tracking (all pages)**: page_view on every route change, view_item on product pages, view_item_list on home (Top Sellers) and store, begin_checkout on cart when not empty, generate_lead with hashed user_data on contact success, outbound clicks (external links, mailto, tel) tracked.

### Set in Vercel

1. **Vercel** → **scv2-success-chemistry** → **Settings** → **Environment Variables**.
2. Add:
   - `NEXT_PUBLIC_GA_MEASUREMENT_ID` = your GA4 Measurement ID
   - `NEXT_PUBLIC_GTM_ID` = your GTM container ID (optional)
   - `NEXT_PUBLIC_GOOGLE_ADS_ID` = your conversion tag ID, e.g. `AW-123456789` (from Google Ads → Goals → Conversions → your action → Tag setup)
   - `NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL` = conversion label from the same tag snippet (optional)
   - **To finish setup:** In Google Ads, open your conversion action → Tag setup → copy the ID (AW-...) and optional label into `.env.local` and Vercel env vars. **After adding or changing env vars in Vercel, trigger a new deployment** (Deployments → Redeploy, or push a commit) so the build sees them and the gtag script appears in the page source.
3. Redeploy so the scripts load on the live site.

### Where to get IDs

- **GA4:** [analytics.google.com](https://analytics.google.com) → Admin → Data Streams → your web stream → **Measurement ID**.
- **GTM:** [tagmanager.google.com](https://tagmanager.google.com) → your container → **Container ID**.
- **Google Ads:** [ads.google.com](https://ads.google.com) → Tools → Conversions → use the tag snippet’s ID or set up conversion in GTM.

---

## Google Search Console & when to connect

**When to connect:** You can add the same GA4/Ads env vars **now** so the Vercel deployment (e.g. `scv2-success-chemistry.vercel.app`) already sends data. When you point your **domain** (e.g. successchemistry.com or a subdomain) to this site:

1. **Search Console** – Add the **property** for that domain (or URL prefix) in [search.google.com/search-console](https://search.google.com/search-console). Verify ownership (HTML meta tag or DNS record as instructed). Then submit the sitemap: `https://your-domain.com/sitemap.xml`. SCV2 exposes `/sitemap.xml` (generated from `app/sitemap.ts`) and `/robots.txt` (from `app/robots.ts`).
2. **Analytics** – No change: GA4/Ads keep working. If you use a different property per domain, set the new `NEXT_PUBLIC_GA_MEASUREMENT_ID` (and optionally Ads ID) for the production domain and redeploy.

**What the other Success project (deploy-site / success.com) has:** GA4 `G-WNZH4JKEL5`, static `sitemap.xml` and `robots.txt`, meta `robots` on pages, and an admin reminder to check Search Console and sitemap submission. SCV2 now has a **dynamic sitemap** (home, store, cart, contact, policy pages, all product URLs) and **robots.txt** that points to it. Optional: set `NEXT_PUBLIC_SITE_URL` in Vercel to your final domain so sitemap URLs use that base (e.g. `https://successchemistry.com/...`) once you switch.

---

---

## Medusa backend

- **Product catalog:** When `NEXT_PUBLIC_MEDUSA_URL` is set, the **store** page fetches products from Medusa (`sdk.store.product.list`). If Medusa is down or unset, the store uses local `TOP_PRODUCTS`.
- **Orders:** Checkout is **PayPal via PocketBase** (product-page PayPal buttons → `NEXT_PUBLIC_API_BASE`). Orders are **not** created in Medusa, so **Medusa does not get a sale/order count** when customers buy. Customers do get an **order number** on the order-confirmation page (`/order-confirmation?orderId=...`).
- **To have Medusa track orders:** Either (1) implement Medusa checkout in SCV2 (create cart, add items, complete cart with `sdk.store.cart.complete`), or (2) have your payment backend (e.g. PocketBase) send order data to Medusa via API/webhook after each purchase.

Backend integrations (Medusa PayPal, email, etc.) are in the **medusa-backend** repo: see `INTEGRATIONS.md` there.
