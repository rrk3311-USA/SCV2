# Where media is hosted for SCV2 (Vercel)

The live app at **https://scv2-success-chemistry.vercel.app** expects images and videos at **same-origin** paths:

- `/images/` – categories, banner, logo, product images, real-factory images, footer badges, etc.
- `/videos/` – hero video (e.g. `0124.mov` / `0124.mp4`)

Those are served by **Next.js** from the `public/` folder. So for media to show on Vercel, the files must live under **SCV2/public/** and be committed to the SCV2 repo (and deployed with the app). **Hosting = Vercel** (same as the app).

Previously, SCV2 had no `public/` assets: the code lived in success007 and pointed at paths that only worked when the old deploy-site was serving them. After you run the sync below, media will be inside SCV2 and deployed with the app.

## Media still broken online?

The live site is built by Vercel from the **SCV2 GitHub repo**. Your media lives in **success007/SCV2/public/** locally. To fix broken images/videos:

1. **Sync media into SCV2** (if you haven’t): `./sync-scv2-media.sh`
2. **Commit and push SCV2 to GitHub** so Vercel gets the `public/` folder:

```bash
cd /Users/r-kammer/Documents/GitHub/success007
git add SCV2/public/
git status   # you should see new/updated files under SCV2/public
git commit -m "Add SCV2 public media for Vercel"
./sync-scv2-to-vercel.sh --force
```

After the push, Vercel will redeploy and images/videos should load at https://scv2-success-chemistry.vercel.app.

---

## One-time sync: copy media into SCV2

From the **success007** repo root, run:

```bash
./sync-scv2-media.sh
```

That script copies into **SCV2/public/**:

- **deploy-site/public/images/** → `SCV2/public/images/` (logo, banner, real-factory, product images, footer, CTA, etc.)
- **deploy-site/images/Catagory Thumbnail Images/** → `SCV2/public/images/Catagory Thumbnail Images/`
- **REAL FACTORY images /0124.mov** → `SCV2/public/videos/0124.mov`

Then commit and push SCV2 so Vercel gets the assets:

```bash
cd SCV2
git add public/
git commit -m "Add public media for Vercel"
cd ..
./sync-scv2-to-vercel.sh --force
```

(Or commit inside success007 and push normally, then run the subtree push so the SCV2 repo on GitHub has the new `public/`.)

## Optional: external hosting (CDN / blob)

If you prefer not to put large assets in the repo, you can host media elsewhere (e.g. Vercel Blob, Cloudinary, S3) and set `NEXT_PUBLIC_IMAGE_BASE` (and use it for `/images/` and `/videos/` in the app). The app’s `products.ts` already supports an `IMAGE_BASE`; you’d extend that pattern to other components. For most cases, using **SCV2/public/** on Vercel is the simplest.
