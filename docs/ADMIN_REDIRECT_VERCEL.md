# Get /admin to redirect to Supabase on production

**Symptom:** https://www.successchemistry.com/admin shows "Admin is the Directus dashboard" and does not redirect.

**Cause:** The deployment currently serving Production was built from an **old commit** (e.g. 636bcbe). Or the Vercel project has **no Root Directory** set, so it builds the repo root (life-jet) instead of **SCV2**, which fails with `clientModules`. The redirect code and env are in **latest main** but that build isn’t live.

## Steps (in Vercel)

1. **Project**  
   Use the project that has **www.successchemistry.com** (e.g. scv2-success-chemistry).

2. **Root Directory (critical)**  
   Settings → General → **Root Directory**: set to **`SCV2`** and Save.  
   If this is blank, Vercel builds the root repo (life-jet) and the build fails. With **SCV2**, it builds the Next.js storefront.

3. **Environment variables**  
   Settings → Environment Variables. For **Production** (and Preview if you want):
   - `SUPABASE_URL` = `https://jgkvccfdgpttpaxdiqjg.supabase.co`  
   - and/or `NEXT_PUBLIC_SUPABASE_URL` = same value.

4. **Git / branch**  
   Settings → Git: confirm **Production Branch** is `main` (or the branch you push to).

5. **Deploy latest main**  
   - Deployments tab.  
   - If the **latest** deployment is from an old commit, trigger a new one: either push a commit to `main` or use **“Redeploy”** on the **latest** deployment (the one from the newest commit, e.g. “admin: prefer SUPABASE_URL”), and choose **Production**.  
   - Do **not** “Redeploy” an old deployment (e.g. “Merge Directus + Next 16”) or “Redeploy with existing build.”

6. **Use the new deployment for Production**  
   When the new deployment is **Ready**, make sure it’s the one assigned to **Production** and to **www.successchemistry.com**. If Production still points at an old deployment, use **“Promote to Production”** (or equivalent) on the new one.

7. **Check**  
   Open https://www.successchemistry.com/admin. If you see **(SCV2 admin – Supabase redirect)** and "Why no redirect", the new build is live (add SUPABASE_URL and redeploy to get the redirect). If you still see **Directus**, Production is still an old deployment — go to Deployments and **Promote to Production** on the latest Ready deployment.

## Code (already in repo)

- Admin page: `src/app/admin/page.tsx` redirects when `SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_URL` is set.  
- We prefer `SUPABASE_URL` so the redirect works at runtime on Vercel once the **new** code is deployed.
