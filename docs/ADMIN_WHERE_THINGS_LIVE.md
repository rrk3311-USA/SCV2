# Where things live – Admin, AI Agent, Documents & Ads

So you can find everything in one place.

## Public admin dashboard

- **URL**: `https://successchemistry.com/admin/` (or your Vercel domain)
- **Repo**: `deploy-site/admin/index.html`
- **Tabs**: Overview, Products, Orders, Sales Channels, Woo Orders, Links, **AI Agent**, **Documents & Ads**, **Scrum / Project**, Future Upgrades
- **AI Agent tab**: Explains where the Anthropic (Claude) agent lives and links to Commerce Manager + Admin API.
- **Documents & Ads tab**: Links to PocketBase admin, Commerce Manager (ad copy), and blog/docs in repo.

## Anthropic / Claude AI agent

- **Lives in**: **commerce-manager/** (separate Node app)
- **Files**: `commerce-manager/agent.js` (Claude 3.5 Sonnet), `server.js` (`/api/agent/chat`, `/api/agent/task`), `memory.js`, `pb-collections-setup.md`
- **Run locally**: `cd commerce-manager && npm run dev` (e.g. port 3002)
- **Deploy**: Use `commerce-manager/fly.toml` (separate Fly app) if you deploy it.
- **Not** inside the public admin HTML; it’s a separate backend. The public admin has an **AI Agent** tab that explains this and links to it.

## Admin API (orders, PayPal, ShipStation)

- **URL**: https://success-chemistry-pb.fly.dev (same machine as PocketBase)
- **Repo**: `pocketbase/pb_hooks/api-routes.pb.js` (hooks on the PB app)
- **Endpoints**: `/api/health`, `GET/POST /api/orders`, `GET/POST /api/shipstation`, `POST /api/paypal/orders`, `POST /api/paypal/orders/:id/pay`. Credentials from PB **api_config** collection.

## PocketBase (PB) admin

- **URL**: https://success-chemistry-pb.fly.dev/_/
- **Repo**: `pocketbase/`
- **Collections**: products, orders, customers; plus (if migrations run) automation_tasks, activity_log, agent_config for Commerce Manager.

## Documents & ads

- **Product/docs**: PocketBase (products), blog in `blog-md/`, repo docs (e.g. `CDP_AGENTIC_MANAGED.md`, `FLEET_MANAGER_README.md`, `DISTRIBUTION_SUBMISSION_GUIDE.md`).
- **Ad copy / AI content**: Commerce Manager agent (`commerce-manager/`) – generate via `/api/agent/chat` or `/api/agent/task` when that app is running.

## Summary

| What            | Where (repo)        | Live URL / how to run        |
|-----------------|---------------------|------------------------------|
| Public admin    | deploy-site/admin/  | successchemistry.com/admin/  |
| AI Agent (Claude)| commerce-manager/  | Run locally or deploy        |
| Admin API       | pocketbase/pb_hooks/api-routes.pb.js | success-chemistry-pb.fly.dev |
| PB admin        | pocketbase/         | success-chemistry-pb.fly.dev/_/ |
| Documents/ads   | PB + commerce-manager + blog-md/ + repo docs | See AI Agent & Documents & Ads tabs in admin |
| Scrum / Project | Public admin + PB admin-extras               | Backlog, sprints, links to GitHub/Linear/Jira |
