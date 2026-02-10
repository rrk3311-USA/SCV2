# SCV2: PocketBase = main admin, Supabase = backup copy

**PocketBase (PB)** is the main admin: you create and manage everything there. **Supabase** is a backup that holds a copy of every order so you have a second copy of everything.

## How it works

| Role | Service | What it does |
|------|---------|--------------|
| **Main admin** | **PocketBase** | Orders: create, get, update. You use PB Admin for day-to-day management. PayPal create/capture. |
| **Backup** | **Supabase** | Copy of every order (same data). Stored with `pocketbase_order_id` so the backup row matches the PB order. |

Flow: Checkout creates the order in **PocketBase** (main) and pushes a **copy** to **Supabase** (backup). User pays with PayPal via PocketBase. On success the order is marked paid in **PocketBase**, then the **Supabase backup** row is updated to paid so both stay in sync.

## Configuration

### 1. PocketBase (main admin – required)

In `.env.local` and in **Vercel**:

```bash
NEXT_PUBLIC_API_BASE=https://your-pocketbase.fly.dev
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_paypal_client_id
```

- Create orders in PB; use PB Admin to view and manage everything.
- In PocketBase Admin → `api_config`, set `paypal_client_id`, `paypal_client_secret`, and optionally `paypal_mode` (`sandbox` or `live`).
- `/admin` on the site redirects to PocketBase Admin.

### 2. Supabase (backup – optional but recommended)

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

- When set, every order is also written to Supabase (same items, total, status) with `pocketbase_order_id` set to the PB record id.
- Run the schema in **SUPABASE_SETUP.md** and migration `002_add_pocketbase_order_id.sql` so the backup table has the link column.

### Checkout flow

1. User clicks checkout → order is created in **PocketBase** (main), then a **copy** is created in **Supabase** (backup) with `pocketbase_order_id` set.
2. User is sent to `/checkout?order_id=<pb_id>` (PB record id).
3. Checkout page loads the order from **PocketBase**.
4. User pays with PayPal (create/capture via PocketBase).
5. On success the order is set to **paid** in **PocketBase**, then the **Supabase backup** row with that `pocketbase_order_id` is updated to paid.

## Run locally

```bash
cd SCV2
npm install
npm run dev
```

Set PocketBase (required). Set Supabase as well to keep a backup copy of everything.
