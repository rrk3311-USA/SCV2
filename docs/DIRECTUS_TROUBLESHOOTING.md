# Directus / SCV2 – "None work" checklist

Use this when **/admin**, **checkout**, or the **Directus URL** don’t work.

---

## 1. Fly app is actually running Directus (not Medusa)

The app **medusa-backend-dark-resonance-4960** must be **re-deployed with the Directus image**. If you only changed settings and didn’t deploy, it’s still running the old Medusa code.

**Do this:**
- From your machine: `cd directus-fly && fly deploy -a medusa-backend-dark-resonance-4960`
- Or: Fly dashboard → **medusa-backend-dark-resonance-4960** → make sure **Source** is your repo and **Root Directory** is **directus-fly** → **Deploy** (or push to main so the GitHub Action deploys).

**Check:** Open **https://medusa-backend-dark-resonance-4960.fly.dev** in a browser.
- You should see **Directus login** (email/password).
- If you see Medusa or something else, the app wasn’t redeployed with Directus.

---

## 2. Directus health

**Check:** Open **https://medusa-backend-dark-resonance-4960.fly.dev/server/health**

- Should return JSON (e.g. `{"status":"ok"}` or similar).
- If 404 or 500, the app isn’t running Directus or it’s crashing (check Fly **Logs**).

---

## 3. Directus secrets on Fly

Fly app **medusa-backend-dark-resonance-4960** → **Secrets**. You must have:

- `DB_CLIENT` = `pg`
- `DB_CONNECTION_STRING` = your Postgres URL (e.g. `postgresql://...@bold-wind-1462.internal:5432/...`)
- `KEY`, `SECRET` = random strings
- `ADMIN_EMAIL`, `ADMIN_PASSWORD` = your Directus login
- `PUBLIC_URL` = `https://medusa-backend-dark-resonance-4960.fly.dev`

Wrong or missing `DB_CONNECTION_STRING` → Directus can’t start or will crash. Check **Logs** in Fly.

---

## 4. SCV2 / Vercel env (online)

Vercel → your SCV2 project → **Settings** → **Environment Variables**:

- **DIRECTUS_URL** = `https://medusa-backend-dark-resonance-4960.fly.dev` (no trailing slash)
- **DIRECTUS_STATIC_TOKEN** = token from Directus (Admin → Settings → Access Tokens)

Redeploy the Vercel project after changing env.

---

## 5. Local (localhost:8000)

In **SCV2/.env.local**:

- **DIRECTUS_URL** = `https://medusa-backend-dark-resonance-4960.fly.dev` (so local SCV2 talks to the same Directus)
- **DIRECTUS_STATIC_TOKEN** = same token as on Vercel

Restart `npm run dev` after changing `.env.local`.

---

## 6. Directus collections and token

In Directus (login at the Fly URL above):

- **Data model**: collections **orders** and **order_items** must exist (see DIRECTUS_SETUP.md).
- **Settings** → **Access Tokens**: one token with create/read/update on **orders** and **order_items**; that value is **DIRECTUS_STATIC_TOKEN** in Vercel and .env.local.

If collections or token are wrong, checkout will return 502/503 or “Failed to create order”.

---

## Quick test order

1. **https://medusa-backend-dark-resonance-4960.fly.dev** → Directus login.
2. **https://YOUR-SCV2-SITE/admin** → should redirect to (1).
3. On SCV2: add to cart → Checkout with PayPal → should create an order in Directus and send you to `/checkout?order_id=...`.

If (1) fails, fix Fly app and secrets. If (1) works but (2) or (3) fail, fix Vercel/local env and Directus token/collections.
