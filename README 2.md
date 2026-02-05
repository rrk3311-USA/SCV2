# SCV2 – Success Chemistry V2

Medusa storefront from the start. Header and footer styled like the current Success Chemistry site. Uses **Phosphor icons** and **shadcn-style** utilities (Tailwind + `cn`).

## Where things run (non‑local)

| What | Where | URL |
|------|--------|-----|
| **Storefront (this app)** | Vercel | [scv2-success-chemistry.vercel.app](https://scv2-success-chemistry.vercel.app) |
| **Backend + Admin** | **Not on Vercel** — deploy separately | Railway or Render (see [docs/MEDUSA_HOSTED_SETUP.md](docs/MEDUSA_HOSTED_SETUP.md)) |

Vercel only runs the Next.js storefront. The Medusa backend (API + Admin) is in this repo at `deploy-site/medusa-backend/` but must be deployed to a **separate host** (e.g. Railway or Render) with Postgres (Supabase) and Redis (Upstash). Once that’s live, you’ll have:

- **Admin (non‑local):** `https://your-medusa-backend.up.railway.app/app` (or your Render URL)
- **Storefront:** already at scv2-success-chemistry.vercel.app; set `NEXT_PUBLIC_MEDUSA_BACKEND_URL` to your backend URL so the store talks to it.

## Stack

- **Next.js 14** (App Router)
- **Medusa** – storefront talks to Medusa backend (`@medusajs/js-sdk`)
- **Phosphor Icons** – `@phosphor-icons/react`
- **Tailwind CSS** – styling; header/footer match current site
- **Vercel** – deploy this folder as a separate project (e.g. project name **SCV2**)

## Setup

1. **Install and run (local)**

   ```bash
   cd SCV2
   npm install
   npm run dev
   ```

   Open [http://localhost:8000](http://localhost:8000).

2. **Medusa backend**

   Run a Medusa backend (e.g. `create-medusa-app` or Medusa Cloud). Set in `.env`:

   - `NEXT_PUBLIC_MEDUSA_BACKEND_URL` – backend URL (e.g. `http://localhost:9000`)
   - `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` – publishable key from Medusa Admin

3. **Admin**

   - **This app:** [http://localhost:8000/admin](http://localhost:8000/admin) – links to Medusa Admin.
   - **Medusa Admin:** runs with your backend (e.g. `http://localhost:7001`).

## Deployment (Vercel)

- **Project:** SCV2 (root directory `SCV2`)
- **Domains:**
  - **Primary:** [scv2-success-chemistry.vercel.app](https://scv2-success-chemistry.vercel.app)
  - **Deployment URL:** `scv2-success-chemistry-9xysa236m-rrk3311-usas-projects.vercel.app`

Use the primary domain for `NEXT_PUBLIC_BASE_URL`, PayPal return/cancel URLs, and Medusa store CORS.

**Deploy to Vercel (new project):**

1. Create a new project; set **Root Directory** to `SCV2`.
2. Build: `npm run build`. Output: default Next.js.
3. Env vars: `NEXT_PUBLIC_MEDUSA_BACKEND_URL`, `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`, `NEXT_PUBLIC_BASE_URL` = `https://scv2-success-chemistry.vercel.app`.

## Pages

- **/** – Home (hero + Shop / Admin CTAs).
- **/admin** – Link to Medusa Admin.
- **/store** – Shop (add later; will use Medusa products).
- **/cart** – Cart (add later; will use Medusa cart).
