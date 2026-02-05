# Google Merchant Center reviews and product linking

## Your setup

- **Merchant Center (Skinny Bean):** [Product reviews](https://merchants.google.com/mc/productreviews/items?a=118364265)  
- **Merchant Center ID:** `118364265`

## Can we import or link those reviews?

### Import into the site

**Google does not provide an API to export Merchant Center product reviews** into your own site. Those reviews live on Google’s side and are used for:

- Seller ratings in Shopping ads  
- Free product listings  
- Sometimes Knowledge Panels  

So you **cannot** bulk-import Merchant Center reviews into SCV2 (or into Yotpo) via an official Google API.

### Linking so Google matches our products (~20k Merchant Center reviews)

We **can** (and did) link your product pages to the same products in Merchant Center so Google can associate its reviews with your URLs:

1. **Product feed** (URL or SFTP)  
   Feed uses **id** = SKU, **gtin** (UPC when present), **brand** = "Success Chemistry", **link** = your product URL, **merchant_item_id** = SKU. Same identifiers as your existing Merchant Center products so Google matches feed items (and thus your URLs) to the products that have reviews.

2. **Product page schema (JSON-LD)**  
   Every product page outputs **schema.org Product** with:
   - `sku` (same as feed)
   - `gtin12` (12-digit UPC) or `gtin13` (13-digit EAN), matching feed `gtin`
   - `brand`: "Success Chemistry"
   - `url`, `image`, `offers`  
   So Google can match the page to the same product (and thus to Merchant Center reviews) by identifier.

3. **Constants**  
   `GOOGLE_MERCHANT_CENTER_ID = "118364265"` is in `src/lib/constants.ts` for reference (e.g. support, docs).

## What shows where

| Where | What |
|-------|------|
| **On your site** | **Yotpo** – reviews collected and displayed by Yotpo (widget on product pages). |
| **On Google (Shopping, search)** | **Merchant Center** – reviews/ratings Google has for your products; Google may show them in Shopping and free listings. |
| **Linking** | Same SKU/GTIN/brand in feed + JSON-LD so Google ties Merchant Center data to your product URLs. |

## If you want “Merchant Center” reviews on the site

- **Option A:** Use **Yotpo** (or similar) as the single place for on-site reviews and encourage buyers to leave reviews there (and on Google when prompted).  
- **Option B:** Use a **review aggregation** tool that can pull from Google (e.g. some rep management or review platforms); that’s outside the SCV2 codebase.  
- **Option C:** Manually copy a few standout Merchant Center reviews into your copy or a “Testimonials” section (no API needed).

Summary: Merchant Center reviews are **not** importable via API; we **did** link products (feed + JSON-LD + Merchant Center ID doc) so Google can match and use those reviews for your product URLs in Shopping/search.
