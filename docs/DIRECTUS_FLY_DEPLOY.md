# Deploy Directus on Fly.io (free, admin from anywhere)

You already use Fly. Deploy Directus there so the admin is online at a URL like `https://your-directus.fly.dev` — no Directus Cloud cost.

- **Database (required):** Directus needs one of **Postgres** (recommended), MySQL, or SQLite. Use Fly Postgres, Neon, or any hosted Postgres.
- **Redis (recommended):** For cache and **session persistence**. Without it, Fly’s auto-stop/restart wipes in-memory sessions and you’ll have to sign in again constantly. See DIRECTUS_SETUP.md → “Session keeps expiring”.
- **Tigris (optional):** S3-compatible storage for files; Directus can use it for uploads, but the main requirement is the DB.

---

## Option A: Directus with Postgres (recommended)

Use Fly Postgres (or Neon) as the database. No volume needed for the DB; only Directus app runs on Fly.

### 1. Use your existing Fly Postgres (you already have one)

If you already have a Fly Postgres app (e.g. **morning-shape-5938** in region **lax**):

1. **Get the connection details**  
   - In Fly dashboard: open your **Postgres app** → **Secrets** (or **Connect** / **Credentials**). You need: **user**, **password**, **database name**.  
   - Host for other Fly apps in the same org: **`YOUR-POSTGRES-APP-NAME.internal`** (e.g. `morning-shape-5938.internal`).  
   - Port: **5432**.

2. **Connection string** (from another Fly app, use internal hostname):
   ```text
   postgresql://USER:PASSWORD@morning-shape-5938.internal:5432/DATABASE?sslmode=disable
   ```
   Replace `USER`, `PASSWORD`, and `DATABASE` with the values from your Postgres app. If the app has no database yet, create one via **Postgres app → Connect** or `fly postgres connect -a morning-shape-5938` and run `CREATE DATABASE directus;` (and a user if needed).

3. **Directus expects `DB_CONNECTION_STRING`**, not `DATABASE_URL`. So set the connection string as a secret on the Directus app (step 3 below); you don’t need to “attach” the Postgres app.

4. **Deploy Directus** in the same org/region (e.g. **lax**) so it can reach `morning-shape-5938.internal`. Continue from **Option A step 2** (Create the Directus app) and in step 3 set secrets using this connection string.

---

### 1b. Or create a new Postgres on Fly

**Managed Postgres (recommended):**
```bash
fly mpg create
```
Follow prompts: name (e.g. `sc-directus-db`), plan (e.g. free/Starter if available), region. Note the **connection string** or host/port/database/user/password from the output or Fly dashboard.

**Or classic Fly Postgres:**
```bash
fly postgres create --name sc-directus-db --region sea
```
After it’s created, get credentials:
```bash
fly postgres connect -a sc-directus-db
```
Or in Fly dashboard: your Postgres app → **Connection** (or **Credentials**). You’ll need: host, port (usually 5432), database name, user, password.

**Or use Neon (free Postgres):** Create a project at [neon.tech](https://neon.tech), create a database, copy the connection string (e.g. `postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require`).

### 2. Create the Directus app on Fly

Create a new folder and use the **official Directus image** with Postgres:

```bash
mkdir directus-fly-pg && cd directus-fly-pg
```

Create **Dockerfile**:
```dockerfile
FROM directus/directus:11
```

Create **fly.toml** (replace `YOUR-DIRECTUS-APP-NAME` with a unique name):
```toml
app = "YOUR-DIRECTUS-APP-NAME"
kill_signal = "SIGINT"
kill_timeout = 5

[env]
  PORT = "8055"

[http_service]
  internal_port = 8055
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 0
  processes = ["app"]

  [[http_service.checks]]
    grace_period = "10s"
    interval = "30s"
    method = "GET"
    path = "/server/health"
    timeout = "5s"
```

### 3. Set secrets (Postgres + Directus)

Use the DB credentials from step 1. Either set a **connection string**:

```bash
fly secrets set DB_CLIENT=pg
fly secrets set DB_CONNECTION_STRING="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require"
```

Or set each variable (if no connection string):

```bash
fly secrets set DB_CLIENT=pg
fly secrets set DB_HOST=your-db-host.flycast
fly secrets set DB_PORT=5432
fly secrets set DB_DATABASE=directus
fly secrets set DB_USER=your_user
fly secrets set DB_PASSWORD=your_password
fly secrets set DB_SSL__REJECT_UNAUTHORIZED=true
```

Then Directus required secrets:

```bash
fly secrets set KEY=$(openssl rand -hex 32)
fly secrets set SECRET=$(openssl rand -hex 32)
fly secrets set ADMIN_EMAIL=your@email.com
fly secrets set ADMIN_PASSWORD=your-secure-password
fly secrets set PUBLIC_URL=https://YOUR-DIRECTUS-APP-NAME.fly.dev
```

**Recommended – Redis** (stops “keeps making me sign in again” on Fly): create Redis with `fly redis create`, then set secrets:
```bash
fly secrets set CACHE_ENABLED=true -a YOUR-DIRECTUS-APP-NAME
fly secrets set CACHE_STORE=redis -a YOUR-DIRECTUS-APP-NAME
fly secrets set REDIS="redis://default:PASSWORD@your-redis-app.flycast:6379" -a YOUR-DIRECTUS-APP-NAME
```
URL-encode any special characters in the password. Redeploy after setting secrets. See DIRECTUS_SETUP.md for full steps.

### 4. Launch and deploy

```bash
fly launch --no-deploy --copy-config
# ensure fly.toml app name matches
fly deploy
```

Open `https://YOUR-DIRECTUS-APP-NAME.fly.dev`, log in, create `orders` and `order_items` (see DIRECTUS_SETUP.md), then set `DIRECTUS_URL` and `DIRECTUS_STATIC_TOKEN` in SCV2.

---

## Option B: SQLite (community template, no Postgres)

No Postgres needed: SQLite + a Fly volume.

### 1. Clone the template

```bash
cd ~
git clone https://github.com/freekrai/directus-fly.git
cd directus-fly
```

### 2. Create the Fly app (no deploy yet)

Pick a **unique** app name (e.g. `success-chemistry-directus` or `yourname-directus`):

```bash
fly launch --name YOUR-UNIQUE-NAME --copy-config --no-deploy
```

Use the same name in `fly.toml` under `app = "..."` if the wizard didn’t set it.

### 3. Create a volume (persist SQLite)

Replace `YOUR_REGION` with the region you chose (e.g. `sea`, `iad`). Check with `fly regions list`:

```bash
fly volumes create data --region YOUR_REGION --size 1
```

In `fly.toml`, set `FLY_PRIMARY_REGION` to that region (e.g. `FLY_PRIMARY_REGION = "sea"`).

### 4. Set secrets

Replace placeholders with your values:

```bash
fly secrets set KEY=$(openssl rand -hex 32)
fly secrets set SECRET=$(openssl rand -hex 32)
fly secrets set ADMIN_EMAIL=your@email.com
fly secrets set ADMIN_PASSWORD=your-secure-password
fly secrets set PUBLIC_URL=https://YOUR-APP-NAME.fly.dev
```

Use the app name from step 2 in `PUBLIC_URL`.

### 5. Deploy

```bash
fly deploy
```

When it’s up, open **https://YOUR-APP-NAME.fly.dev** — you’ll get the Directus login. Log in with `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

### 6. Point SCV2 at it

In **SCV2** (and Vercel):

- `DIRECTUS_URL=https://YOUR-APP-NAME.fly.dev`
- Create a **static token** in Directus: Admin → Settings → Access Tokens → Create. Give it create/read/update on `orders` and `order_items`, then set:
  - `DIRECTUS_STATIC_TOKEN=<that-token>`

Create the **orders** and **order_items** collections in Directus as in **DIRECTUS_SETUP.md**. Then SCV2 checkout and **/admin** (redirect to Directus) will work from anywhere.

## Connect the Fly app to your repo

So Fly builds from the repo (and can auto-deploy on push):

1. **Fly dashboard** → your Directus app → **Settings**.
2. Under **Source** / **GitHub**, connect the repo that contains **directus-fly** (e.g. success007).
3. Set **Root Directory** to **`directus-fly`** so Fly uses that folder for the Dockerfile and fly.toml. Save.
4. Add **Secrets** in the app (DB_CLIENT, DB_CONNECTION_STRING, KEY, SECRET, ADMIN_EMAIL, ADMIN_PASSWORD, PUBLIC_URL).
5. Deploy from the dashboard or push to the connected branch.

The deployable backend lives in **success007/directus-fly** (Dockerfile + fly.toml + README).

---

## Optional: custom domain

In Fly dashboard: your app → Settings → Domains → Add domain. Then set `PUBLIC_URL` and SCV2’s `DIRECTUS_URL` to that domain.

## Troubleshooting

- **Logs:** `fly logs`
- **SSH:** `fly ssh console`
- If the template’s Directus version is old, open an issue or PR on [freekrai/directus-fly](https://github.com/freekrai/directus-fly) or switch to a newer fork/image.
