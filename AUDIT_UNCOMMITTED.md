# Audit: Work done but not committed

Audit date: 2026-02-07. Repo root: `success007` (SCV2 is `success007/SCV2`).

---

## 1. Modified files (uncommitted) – source code / docs

These are real changes that are **not** in git history. If you pull elsewhere or reset, you lose them until you commit.

| File | What changed |
|------|----------------|
| **SCV2/GOOGLE_PAY_SETUP.md** | New section: *"Get Google Pay on your live site (for screenshots)"* – steps to set env vars on Vercel (Production), redeploy, and verify the button on the live URL for buyflow screenshots. |
| **SCV2/src/data/products.ts** | Product image logic: prefer full gallery from `product-images.json` when available (no longer require `scannedImages.length >= baseImages.length`). Ensures product pages show all images for swipe. |
| **deploy-site/extract-products2.cjs** | Export now includes `name` in each entry: `if (p.name) entry.name = p.name;` (for feed/overlay titles). |
| **package.json** (repo root) | New dependency: `"googleapis": "^171.4.0"` (used by merchant/Content API scripts). |

**Recommendation:** Commit these if you want this behavior and docs in version control. They are small, focused changes.

---

## 2. Untracked files (never added to git)

All at repo root (`success007/`), not inside SCV2.

| File | Purpose |
|------|--------|
| **analyze-compliance.js** | Reads CSV export, checks against known problem offer IDs, compliance-style checks. |
| **audit-merchant-prices.js** | Uses Google Content API + `googleapis`, compares Merchant Center prices to local CSV; needs `service-account-temp.json`. |
| **create-compliant-feed.js** | Builds `product_export_compliant.json` from CSV with text sanitization (e.g. cure→support, prevent→help maintain) for compliant feeds. |
| **create-supplemental-datasource.js** | Creates supplemental data source (referenced by update-merchant-prices.js). |
| **debug-datasources.js** | Debug Content API / datasources. |
| **debug-merchant-api.js** | Debug Merchant/Content API. |
| **list-merchant-accounts.js** | Lists merchant accounts via API. |
| **list-merchant-products.js** | Lists merchant products. |
| **update-merchant-attributes.js** | Updates merchant product attributes. |
| **update-merchant-prices.js** | Uses Content API + supplemental datasource to update merchant prices from local CSV. |
| **product_export_compliant.json** | Output of create-compliant-feed.js (generated data). |
| **service-account-temp.json** | **Do not commit.** Google service account key (secret). Should be in `.gitignore`. |

**Recommendation:**

- **Do not add** `service-account-temp.json`. It is now in the repo root `.gitignore` so it won’t be committed by mistake.
- **Option A:** Add the scripts to a folder (e.g. `scripts/merchant/` or `scripts/content-api/`) and commit them so they’re not lost when you change locations; keep `product_export_compliant.json` untracked or in `.gitignore` if it’s generated.
- **Option B:** Leave scripts untracked if they’re one-off or local-only; then only your current machine has them.

---

## 3. Build output (.next) – ignore for commit

All changes under `SCV2/.next/` are build artifacts (webpack cache, server chunks, etc.). They are normally in `.gitignore`. No need to commit them; they regenerate on `npm run build` / `next build`.

---

## 4. What *is* committed (recent)

- Design rules + deployment blur fix (tailwind, Header, Container, DESIGN_RULES.md, globals.css).
- Deploy docs (Vercel-only; Render not used for SCV2).
- Product page + Google Pay (flask icon, images, dynamic button).
- Product images (check script, dedupe sync, product-images.json).
- Google Pay integration (button, API route, cart/product, docs, form script).
- Feed and Merchant API–related work (channel=online, Merchant API scripts, etc.).

---

## 5. Quick commands to commit the “other things we did”

From repo root (`success007`):

```bash
# Commit the 4 modified source/docs files
git add SCV2/GOOGLE_PAY_SETUP.md SCV2/src/data/products.ts deploy-site/extract-products2.cjs package.json
git commit -m "Docs: Google Pay live site steps; products prefer full image gallery; extract name; add googleapis"

# Optional: add merchant scripts (excluding secrets and generated data)
# Ensure service-account-temp.json and product_export_compliant.json are in .gitignore first
# git add analyze-compliance.js audit-merchant-prices.js create-compliant-feed.js ...
```

After that, `git push` will make these changes show up on the remote and on other clones.
