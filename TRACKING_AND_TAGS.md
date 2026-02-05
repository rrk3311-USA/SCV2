# Google Tracking & Tags – Site-Wide and Deep Linking

This doc describes **all** Google Analytics 4 (GA4), Google Ads, and deep-linking tracking on the SCV2 site. Tracking is critical for ads and attribution; use this to verify everything works before running campaigns.

---

## 1. What’s loaded on every page (root layout)

These run on **every** route (home, store, product, cart, blog, contact, policy pages, not-found):

| Component        | Purpose |
|-----------------|--------|
| **Analytics**   | Injects gtag.js (GA4 and/or Google Ads) or GTM. Requires `NEXT_PUBLIC_GA_MEASUREMENT_ID` and/or `NEXT_PUBLIC_GOOGLE_ADS_ID` (or `NEXT_PUBLIC_GTM_ID` if you use Tag Manager). |
| **RouteTracker** | Fires `page_view` on every client-side route change. GA4’s config only sends the first load; this covers SPA navigations (deepest linking for page views). |
| **OutboundTracker** | Listens for clicks on external links, `mailto:`, and `tel:`. Fires a `click` event with `event_category: "outbound"` and `link_url` for deep linking. |

So: **every page** gets at least:
- The correct tag(s) in the page source (for Google Ads Diagnostics).
- A `page_view` when the route changes (path + title).
- Outbound link clicks tracked.

---

## 2. Page-by-page event coverage

| Page / area | Events fired | Where it’s implemented |
|-------------|--------------|------------------------|
| **Home** (`/`) | `page_view`, `view_item_list` (listId: `home_top_sellers`, listName: Top Sellers) | `app/page.tsx` → `ViewItemListTracker` |
| **Store** (`/store`) | `page_view`, `view_item_list` (listId: `store_all`) | `app/store/StoreProductsList.tsx` → `ViewItemListTracker` |
| **Product** (`/product/[slug]`) | `page_view`, `view_item` (item_id = SKU, item_name, price, category, brand) | `app/product/[slug]/page.tsx` → `ViewItemTracker` |
| **Cart** (`/cart`) | `page_view`, `begin_checkout` (when cart has items: items + value) | `app/cart/page.tsx` → `BeginCheckoutTracker` |
| **Order confirmation** (`/order-confirmation`) | `page_view`, `purchase` (transaction_id, value) + Google Ads conversion | `app/order-confirmation/page.tsx` → `PurchaseTracker` |
| **Contact** (`/contact`) | `page_view`, `generate_lead` + enhanced conversion (hashed email/name) on submit | `app/contact/ContactForm.tsx` → `reportLeadWithEnhancedConversion` |
| **Blog index** (`/blog`) | `page_view` | RouteTracker only |
| **Blog post** (`/blog/[slug]`) | `page_view` | RouteTracker only |
| **Policy pages** (privacy, terms, shipping, payment) | `page_view`, outbound clicks | RouteTracker + OutboundTracker |
| **Not found** | `page_view` (path like `/404` or actual path) | RouteTracker |

**Add to cart** (any page with the button): `add_to_cart` (item_id, item_name, price, quantity) — from `AddToCartButton.tsx` using `reportAddToCart`.

**PayPal product-page checkout** (if used): `purchase` + Google Ads conversion — from `PayPalProductButtons.tsx` after successful payment.

**Medusa checkout**: `purchase` + Google Ads conversion when user lands on `/order-confirmation?orderId=...&value=...` — from `PurchaseTracker`.

---

## 3. Deep linking (e-commerce and lead events)

We use standard GA4/Google Ads events so reporting and ads work correctly:

- **view_item_list** – Home carousel, Store listing (with `item_list_id`, `item_list_name`, `items[]`).
- **view_item** – Each product detail (with `item_id` = SKU, `item_name`, `price`, `item_category`, `item_brand`).
- **add_to_cart** – When “Add to cart” is clicked (with `items[]`, `value`).
- **begin_checkout** – When the cart page is viewed with at least one item (with `items[]`, `value`).
- **purchase** – When order confirmation is viewed with `orderId` (and optional `value`); also fires Google Ads conversion.
- **generate_lead** – Contact form submit; optionally with enhanced conversion (hashed email/name) via `reportLeadWithEnhancedConversion`.

Outbound: every external / mailto / tel click is sent as a `click` event with `event_category: "outbound"`.

---

## 4. Environment variables (tracking)

Set these so tags load and conversions can be attributed:

| Variable | Purpose |
|----------|--------|
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | GA4 Measurement ID (e.g. `G-XXXXXXXXXX`). Enables GA4 and first-load `page_view`. |
| `NEXT_PUBLIC_GOOGLE_ADS_ID` | Google Ads ID (e.g. `AW-XXXXXXXX`). Required for Ads conversion tracking and tag visibility in Diagnostics. |
| `NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL` | Optional. From Goals → Conversions → Tag setup. Use if your snippet uses `send_to: "AW-XXX/Label".` |
| `NEXT_PUBLIC_GTM_ID` | Optional. If set, GTM is loaded instead of direct gtag; add GA4 and Google Ads tags inside GTM. |

If both GA4 and Ads IDs are set and GTM is not, a single gtag load configures both. Purchase events call `reportGoogleAdsConversion(value, currency)` so Ads gets conversion + value.

---

## 5. How to verify tracking (before running ads)

1. **Tag in page source**  
   - Deploy with `NEXT_PUBLIC_GOOGLE_ADS_ID` (and GA4 if used) set.  
   - View source on any page; you should see `gtag/js?id=...` (or GTM).  
   - In Google Ads: **Tools → Conversions → your conversion → Tag setup → Diagnostics** should show the tag.

2. **GA4**  
   - **Admin → Data display → DebugView**: enable “Debug mode” in the GA4 extension or use `?debug_mode=true`.  
   - Navigate: home → product → add to cart → cart → (checkout) → order confirmation.  
   - In DebugView confirm: `page_view`, `view_item_list`, `view_item`, `add_to_cart`, `begin_checkout`, `purchase` (and `generate_lead` from contact).

3. **Google Ads conversions**  
   - **Goals → Conversions**: ensure the conversion action exists and is set to “Primary” if needed.  
   - Complete a test purchase (or lead) and wait for the conversion to appear (can take hours).  
   - Use **Tools → Conversions → Tag setup** to confirm no tag errors.

4. **Enhanced conversions (contact form)**  
   - Contact form calls `reportLeadWithEnhancedConversion(email, name)` (hashed user data + `generate_lead`).  
   - In Google Ads, enable enhanced conversions for the lead conversion. When asked to “Choose a method,” select **Google Tag** (or **Google Tag Manager** if you use GTM)—**not** “Google Ads API.” Our site sends user data via gtag/GTM only.  
   - Ensure the tag sends user data (we use hashed email/name).

5. **Order confirmation and value**  
   - Medusa (or your backend) should redirect to:  
     `/order-confirmation?orderId=ORDER_ID&value=ORDER_TOTAL`  
   - So `PurchaseTracker` can fire `reportPurchase(orderId, value)` and pass value to Ads.

---

## 6. File reference (where tracking lives)

| File | Role |
|------|------|
| `src/components/Analytics.tsx` | Loads gtag (GA4/Ads) or GTM on every page. |
| `src/lib/gtag.ts` | All helpers: `setPageView`, `reportViewItem`, `reportViewItemList`, `reportAddToCart`, `reportBeginCheckout`, `reportPurchase`, `reportGenerateLead`, `reportLeadWithEnhancedConversion`, `reportOutboundLink`, `reportGoogleAdsConversion`, enhanced conversion hashing. |
| `src/components/RouteTracker.tsx` | Fires `page_view` on pathname change (used in layout). |
| `src/components/OutboundTracker.tsx` | Fires outbound `click` events (used in layout). |
| `src/components/ViewItemTracker.tsx` | Fires `view_item` (used on product page). |
| `src/components/ViewItemListTracker.tsx` | Fires `view_item_list` (used on home and store). |
| `src/components/BeginCheckoutTracker.tsx` | Fires `begin_checkout` on cart page when cart has items. |
| `src/components/PurchaseTracker.tsx` | Fires `purchase` + Ads conversion on order-confirmation when `orderId` in URL. |
| `src/components/AddToCartButton.tsx` | Fires `add_to_cart` on add. |
| `src/app/contact/ContactForm.tsx` | Fires `generate_lead` with enhanced conversion on submit. |
| `src/components/PayPalProductButtons.tsx` | Fires `purchase` after product-page PayPal success. |

---

## 7. Checklist before running ads

- [ ] `NEXT_PUBLIC_GA_MEASUREMENT_ID` and/or `NEXT_PUBLIC_GOOGLE_ADS_ID` set in production env.
- [ ] Tag visible in page source and in Google Ads Tag Diagnostics.
- [ ] GA4 DebugView shows `page_view` on route change, plus `view_item`, `view_item_list`, `add_to_cart`, `begin_checkout`, `purchase`, `generate_lead` where expected.
- [ ] Google Ads conversion action created and linked to the tag (purchase and optionally lead).
- [ ] Test purchase (and test lead) and confirm conversion in Ads.
- [ ] Order confirmation URL includes `orderId` and `value` so `reportPurchase` gets value.
- [ ] Enhanced conversions enabled in Ads for lead (and optionally purchase) if using hashed user data.

This keeps the whole site covered for page views and deep linking, and ensures tracking and tags are ready for ads.
