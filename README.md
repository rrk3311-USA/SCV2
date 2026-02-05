# SCV2 – Success Chemistry V2

**Project folder:** `success007/SCV2` (this folder).  
**This is the only SCV2 project.** Do not use `deploy-site/life-jet/app/v2/` – that was a duplicate and is removed.

## Entry / “index”

- **Root layout:** `src/app/layout.tsx` (wraps all pages)
- **Home page (index):** `src/app/page.tsx` – clone of main site (localhost:8080): same sections and media only, clean code (hero, Top 12, Why Trust Us, video+LLE, factory collage, features, Women's Balance, Chat CTA).
- **Store:** `src/app/store/page.tsx` – categories + **transparent floating bottles** (no product cards; bottles only with drop-shadow, link to product).

Next.js App Router has no `index.html`; the app entry is `layout.tsx` + `page.tsx`.

## Vercel (scv2-success-chemistry)

The project [scv2-success-chemistry](https://vercel.com/rrk3311-usas-projects/scv2-success-chemistry) should deploy **this SCV2 app**. In Vercel:

- Set **Root Directory** to `SCV2` (so the build runs from this folder).
- Build command: `npm run build` (Next.js).
- Push to `main` to trigger a deploy; the new home page and floating-bottles shop will be live there.

## Run locally

```bash
cd SCV2
npm install
npm run dev
```

Then open **http://localhost:8000**

## Media (images / video)

Media is wired so it works **locally without copying**. `SCV2/public/images` and `SCV2/public/videos` are symlinks to `deploy-site/public/images` and `deploy-site/public/videos`. Category thumbnails are linked from `deploy-site/images/Catagory Thumbnail Images` into `deploy-site/public/images/` so the store page gets them too.

- **Local preview:** Just run `npm run dev` in SCV2; images and video load from deploy-site via the symlinks. No commit or deploy needed.
- **Deploy (e.g. Vercel):** Symlinks may not be followed by the build. For production you can either copy `deploy-site/public/images` and `deploy-site/public/videos` into `SCV2/public/` before building, or use a build step that copies/syncs media, or host media on a CDN and point `next.config.js` / env at that base URL.

## Main files

| What            | Path |
|-----------------|------|
| Layout          | `src/app/layout.tsx` |
| Home            | `src/app/page.tsx` |
| Store           | `src/app/store/page.tsx` |
| Store product list | `src/app/store/StoreProductsList.tsx` (floating bottles, no cards) |
| Container       | `src/components/Container.tsx` |
| Header / Footer | `src/components/Header.tsx`, `Footer.tsx` |
| Product card    | `src/components/ProductCard.tsx` (used on home Top 12 only; store uses floating bottles) |
| Category card   | `src/components/CategoryCard.tsx` |
| Products data   | `src/data/products.ts` (TOP_12, TOP_PRODUCTS) |
| Categories      | `src/data/categories.ts` |
| Routes          | `src/lib/constants.ts` (ROUTES) |
