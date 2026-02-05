# SCV2 integrations (PayPal, Google Ads, GA4, enhanced conversions, deep tracking)

## Already connected

- **PayPal** – Product pages use `PayPalProductButtons`; orders go through PocketBase (`NEXT_PUBLIC_API_BASE`). Set **Vercel** env: `NEXT_PUBLIC_PAYPAL_CLIENT_ID` and `NEXT_PUBLIC_API_BASE`.

## Google Analytics & Google Ads

The root layout loads an **Analytics** component that injects:

- **Google Analytics 4** when `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set (e.g. `G-XXXXXXXXXX`).
- **Google Tag Manager** when `NEXT_PUBLIC_GTM_ID` is set (e.g. `GTM-XXXXXXX`). Use GTM to add GA4, Google Ads conversion, or other tags without code changes.
- **Google Ads** when `NEXT_PUBLIC_GOOGLE_ADS_ID` is set (e.g. `AW-XXXXXXXX`), only if GTM is not set. Purchase conversions fire after PayPal success; add_to_cart on Add to Cart. **Enhanced conversions**: contact form submits send hashed email/name (SHA-256) via `user_data`; turn on “Enhanced conversions” in Google Ads (Goals → Settings) and accept customer data terms.
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

Backend integrations (Medusa PayPal, email, etc.) are in the **medusa-backend** repo: see `INTEGRATIONS.md` there.
