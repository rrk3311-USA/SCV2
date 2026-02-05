# SCV2 product data sources

## Main description file: `products-from-site.json`

**What it is:** An optional JSON overlay (in `src/data/products-from-site.json`) that supplies product **copy** for the storefront: long description, short description, suggested use, supplement facts, ingredients, and FAQs, keyed by **SKU**.

**Why use it:** So SCV2 product pages show the same wording as the main site (deploy-site) and any Medusa/feed exports, without duplicating long text in `products.ts`.

**Source of truth:** `deploy-site/products-data.js` (the main site’s product data).

**How to generate it:** From the **repo root**, either:

```bash
node SCV2/scripts/sync-products-from-site.js
```

or (if that yields 0 SKUs because of how the main site file is loaded):

```bash
node deploy-site/scripts/write-products-overlay.cjs
```

Both read `deploy-site/products-data.js` and write `SCV2/src/data/products-from-site.json`. If the file is missing or empty, product pages still work: they use the copy already embedded in `TOP_PRODUCTS` in `src/data/products.ts`.

## Product list: `TOP_PRODUCTS` in `src/data/products.ts`

- **Base list** (slug, sku, name, price, category, images, etc.) lives in `TOP_PRODUCTS`.
- **Order:** The first 12 entries are **best sellers** for the shop (they appear first on the shop page). The homepage carousel uses the first 7. The shop uses `getStoreProductsSortedByBestSellers()` so best sellers (top 12) appear first.
- **Pull in remaining products:** To add more products, add entries to `TOP_PRODUCTS`. Copy structure from `deploy-site/products-data.js`: use `slug` = SKU (or URL-safe handle), `image` = first image path (e.g. `/images/products/{sku}/01.png`), `images` = array of image paths. After adding, run the sync script so new SKUs get description overlay from the main site.

## Images & transparent hero batch

- **Hero image:** Every product uses `01.png` as the main/hero image so transparent PNGs show correctly in the transparent hero layout. If `01.png` is missing, the UI falls back to `01.jpg` automatically.
- **Sync transparent heroes from the other project:** If you add a batch of transparent hero images (01.png) to `deploy-site/public/images/products/<sku>/`, copy them into SCV2 with:

  ```bash
  node SCV2/scripts/sync-transparent-heroes.js
  ```

  Run from the **repo root**. This copies every `deploy-site/.../products/<sku>/01.png` into `SCV2/public/images/products/<sku>/01.png`, so product pages use the new transparent assets.

## Blog content

- **Product guides (11):** Markdown source lives in `content/blog/*.md` (e.g. `sclera-white-complete-guide.md`). Slugs and titles are in `src/data/blog-posts.ts`. The **source of truth** for the markdown is the parent repo’s `blog-content/*.md` (same 11 files).
- **Sync product-guide markdown:** From the **repo root** (success007):

  ```bash
  node SCV2/scripts/sync-blog-content.js
  ```

  This copies the 11 English `.md` files from `blog-content/` into `SCV2/content/blog/`, so the blog stays in sync with the main site’s blog-content.

- **More articles:** Additional blog posts from the main site (eye health, Sclera White long-form, etc.) are listed in `src/data/legacy-blog-articles.ts` and served as static HTML from `public/blog-articles/*.html` (copied from `deploy-site/blog/`). The blog index page shows both “Product guides” and “More articles.”
