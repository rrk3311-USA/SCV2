# Sync SCV2 to Standalone Repo (for Vercel)

Vercel is connected to the **standalone** repo `github.com/rrk3311-USA/SCV2`. The Directus + Next 16 work lives in **success007** under `success007/SCV2`. To get the new app deployed on Vercel, copy the code into the standalone repo and push.

## One-time setup

1. **Clone the standalone SCV2 repo** (if you don’t have it yet):

   ```bash
   cd ~/Documents/GitHub   # or wherever you keep repos
   git clone https://github.com/rrk3311-USA/SCV2.git SCV2-standalone
   ```

2. **From the success007 repo root**, run the sync script:

   ```bash
   cd /path/to/success007
   chmod +x scripts/sync-scv2-to-standalone.sh
   ./scripts/sync-scv2-to-standalone.sh /path/to/SCV2-standalone
   ```

   Example if both repos are under `~/Documents/GitHub`:

   ```bash
   cd ~/Documents/GitHub/success007
   ./scripts/sync-scv2-to-standalone.sh ~/Documents/GitHub/SCV2-standalone
   ```

3. **In the standalone repo**, commit and push:

   ```bash
   cd /path/to/SCV2-standalone
   git add -A
   git status   # review changes
   git commit -m "Merge Directus + Next 16 from success007/SCV2"
   git push origin main
   ```

4. **Vercel** will pick up the push and deploy. In the project dashboard, the latest deployment will be the new app (Next 16, Directus backend).

## What gets copied

- All source: `src/`, `public/`, config files, `content/`, docs, scripts.
- Excluded: `.git`, `node_modules`, `.next`, `.vercel` (so the standalone repo keeps its own git and Vercel doesn’t see build output).

## After sync

- Set **DIRECTUS_URL** and **DIRECTUS_STATIC_TOKEN** in the Vercel project (Settings → Environment Variables) if not already set.
- Deploy Directus on Fly (app `medusa-backend-dark-resonance-4960`) and create `orders` / `order_items` + static token; use that token as **DIRECTUS_STATIC_TOKEN** in Vercel.
