# Deploy SCV2 to the live site (Vercel)

**Live site:** https://www.successchemistry.com  
**Deploys from:** Vercel → GitHub repo **rrk3311-USA/SCV2** (not success007).

To get your latest SCV2 changes live, push the SCV2 folder into that repo (see below). Render is not used for the storefront.

---

## Why the new site design isn’t showing on Vercel

**What’s going on**

- You edit the storefront in **success007/SCV2** and push to the **success007** repo.
- The live site **https://scv2-success-chemistry.vercel.app** is deployed by Vercel from the **SCV2** repo: **https://github.com/rrk3311-USA/SCV2**.
- So redeploying “success007” doesn’t update the live site. The **SCV2** repo that Vercel uses has to be updated.

**Fix: push SCV2 from success007 into the SCV2 repo**

From the **success007** repo root (one level above `SCV2/`), run:

```bash
cd /Users/r-kammer/Documents/GitHub/success007
./sync-scv2-to-vercel.sh
```

If you see **rejected (non-fast-forward)** because the remote has different commits, overwrite the remote with your current SCV2:

```bash
./sync-scv2-to-vercel.sh --force
```

- Normal push: sends current **SCV2** folder to `scv2-repo` (rrk3311-USA/SCV2) on `main`.
- `--force`: replaces remote `main` with your current SCV2 (use when you want the live site to match this repo and don’t need what’s on the remote).
- You must be logged in to GitHub (SSH or HTTPS with credential helper) on this machine.
- After a successful push, Vercel will pick up the new commit and redeploy; the new design should appear at **scv2-success-chemistry.vercel.app**.

**Optional: confirm in Vercel**

- In Vercel: Project **scv2-success-chemistry** → Settings → Git.
- Confirm “Connected Git Repository” is **rrk3311-USA/SCV2** (not success007).
- If it were success007, the build would use the **root** `vercel.json` (deploy-site/life-jet), not the SCV2 Next app.

**One-time check: SCV2 remote**

```bash
git remote -v
# Should show: scv2-repo  https://github.com/rrk3311-USA/SCV2.git (fetch and push)
```

If `scv2-repo` is missing, add it:

```bash
git remote add scv2-repo https://github.com/rrk3311-USA/SCV2.git
```

Then run the `git subtree push` command above.
