# Admin + Vercel in one go

Do these in order. When step 4 passes, admin is ready on Vercel.

---

## 1. Get Directus online (Fly)

Fly doesn’t have a Vercel-style “paste .env” screen. You send config by (1) **fly.toml** in the repo (port, health check) when you deploy, and (2) **Secrets** — set each variable in the Fly dashboard (App → Secrets → Add secret) or via CLI below.

- **If you haven’t deployed Directus yet:**
  - `cd directus-fly` (from repo root: `success007/directus-fly`)
  - `fly launch --no-deploy --copy-config` (app name e.g. **success-chemistry-directus**)
  - Set **secrets** (CLI or Dashboard → Secrets, one by one): `DB_CLIENT`, `DB_CONNECTION_STRING`, `KEY`, `SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `PUBLIC_URL=https://success-chemistry-directus.fly.dev`
  - `fly deploy`
- **Note your Directus URL**, e.g. `https://success-chemistry-directus.fly.dev`.

---

## 2. Set env on Vercel (SCV2 project)

1. Vercel → your **SCV2** project → **Settings** → **Environment Variables**.
2. Add (or update):

   | Name | Value |
   |------|--------|
   | **DIRECTUS_URL** | `https://success-chemistry-directus.fly.dev` (your Directus URL, no trailing slash) |
   | **DIRECTUS_STATIC_TOKEN** | Token from Directus: Admin → Settings → Access Tokens (create one with access to `orders` + `order_items`) |

3. **Save**. Apply to Production (and Preview if you want).

---

## 3. Redeploy SCV2 on Vercel

- **Deployments** → **…** on latest → **Redeploy** (so the new env vars are used).

---

## 4. Verify (no dev server needed)

From your machine (no need to run `npm run dev`):

```bash
cd /Users/r-kammer/Documents/GitHub/success007/SCV2
DIRECTUS_URL=https://success-chemistry-directus.fly.dev node scripts/verify-admin-urls.mjs --online-only
```

(Replace the URL with your real Directus URL if different.)

- If you see **✓ Directus health OK** and **✓ Directus root returns 200** and the script exits **0** → admin is ready.
- If it fails: Directus isn’t reachable (Fly app down or wrong URL). Fix Fly, then run the same command again.

---

## 5. Use it

- **Live admin:** Open **https://YOUR-SCV2-SITE.vercel.app/admin** → you get redirected to Directus. Log in there.
- **Direct:** Or open your Directus URL (e.g. `https://success-chemistry-directus.fly.dev`) and log in.

---

**Summary:** Deploy Directus on Fly → set **DIRECTUS_URL** + **DIRECTUS_STATIC_TOKEN** on Vercel → redeploy SCV2 → run verify with `--online-only` → when it passes, admin is ready on Vercel.
