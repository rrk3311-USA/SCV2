# Create a New Repo for SCV2

Use this when you want a **new** GitHub repository that contains only the SCV2 storefront (no success007 parent, no subtree).

## One-time: create the new repo

From the **success007** repo root:

```bash
cd /Users/r-kammer/Documents/GitHub/success007
chmod +x scripts/create-new-scv2-repo.sh
./scripts/create-new-scv2-repo.sh ../SCV2-store
```

Replace `../SCV2-store` with any path you want (e.g. `~/Documents/GitHub/SCV2-store`). The script:

- Copies all of `SCV2/` into that directory (excluding `.git`, `node_modules`, `.next`, `.vercel`, `.env*`)
- Runs `git init`, `git add -A`, `git commit` so you have one initial commit

## Push to a new GitHub repo

**Option A – Create repo in the browser, then push**

1. On GitHub: **New repository** (e.g. `rrk3311-USA/SCV2-store`). Do **not** add a README or .gitignore.
2. In the terminal:

```bash
cd ../SCV2-store   # or whatever path you used
git remote add origin https://github.com/YOUR_ORG/YOUR_REPO.git
git push -u origin main
```

**Option B – GitHub CLI**

```bash
cd ../SCV2-store
gh repo create YOUR_ORG/YOUR_REPO --private --source=. --push
```

## After the first push

- In **Vercel**: Import the new repo as a project (or disconnect the old SCV2 repo and connect this one). Set env vars (`NEXT_PUBLIC_API_BASE`, `NEXT_PUBLIC_PAYPAL_CLIENT_ID`, etc.) as in **VERCEL_DEPLOY.md**.
- `/admin` will redirect to PocketBase Admin when `NEXT_PUBLIC_API_BASE` is set.

## Large files

If GitHub warns about files over 50 MB, they are likely under `public/`. You can remove or replace them with smaller assets, or use [Git LFS](https://git-lfs.github.com/) for large binaries.
