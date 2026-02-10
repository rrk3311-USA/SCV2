# Backend Clarification: You're Using PocketBase (NOT Directus)

## ⚠️ Important: Stop Following Directus Docs!

You have **PocketBase** deployed on Fly.io, not Directus. The DIRECTUS_SETUP.md and DIRECTUS_TROUBLESHOOTING.md files are **outdated** and will confuse you.

---

## Your Current Backend: PocketBase

**URL**: https://success-chemistry-pb.fly.dev
**Admin UI**: https://success-chemistry-pb.fly.dev/_/
**Deployed on**: Fly.io

### What PocketBase Does

- **Database**: Built-in SQLite (stores everything in `/pb_data/` on the Fly volume)
- **Admin UI**: At `/_/` (not `/admin` like Directus)
- **Auth**: Superuser accounts (created in Admin UI)
- **API**: Auto-generated REST API + custom hooks in `pb_hooks/`
- **Collections**: orders, products, api_config, etc.

---

## Login URLs (PocketBase)

### ✅ Correct URLs

- **Admin Dashboard**: https://success-chemistry-pb.fly.dev/_/
- **First time**: Create your first admin account
- **After that**: Login with your email/password
- **Bookmark this**: `/_/` is your admin URL

### ❌ Wrong URLs (These Don't Exist)

- ~~https://success-chemistry-pb.fly.dev/admin~~ (404)
- ~~https://success-chemistry-pb.fly.dev~~ (404)
- ~~https://scv3-directus-admin.fly.dev~~ (Old Directus URL - not used anymore)

---

## Environment Variables (SCV2)

### ✅ Correct (PocketBase)

In your `.env.local` and Vercel:

```bash
NEXT_PUBLIC_API_BASE=https://success-chemistry-pb.fly.dev
```

### ❌ Wrong (Directus - Remove These)

```bash
# Delete or comment these out:
# DIRECTUS_URL=https://scv3-directus-admin.fly.dev
# DIRECTUS_STATIC_TOKEN=...
# NEXT_PUBLIC_DIRECTUS_URL=...
```

---

## How to Deploy Changes

```bash
cd /Users/r-kammer/Documents/GitHub/success007/pocketbase

# Quick deploy
./deploy.sh

# Or manual deploy
fly deploy -a success-chemistry-pb
```

---

## How Sessions Work (PocketBase)

**Session expiration is normal** on Fly.io:
- Fly machines sleep when inactive
- Sessions are stored in memory
- When machine wakes up, you're logged out
- **Solution**: Just login again at `/_/`

This is NOT a bug. It's how Fly.io's free tier works with auto-sleep.

---

## API Endpoints (PocketBase)

### Health Check
```bash
GET https://success-chemistry-pb.fly.dev/api/custom/health
```

### Orders
```bash
# List orders
GET https://success-chemistry-pb.fly.dev/api/custom/orders

# Create order
POST https://success-chemistry-pb.fly.dev/api/custom/orders

# Get single order
GET https://success-chemistry-pb.fly.dev/api/custom/orders/:id

# Update order
PATCH https://success-chemistry-pb.fly.dev/api/custom/orders/:id
```

### PayPal
```bash
POST https://success-chemistry-pb.fly.dev/api/custom/paypal/orders
POST https://success-chemistry-pb.fly.dev/api/custom/paypal/orders/:id/pay
```

### ShipStation
```bash
GET https://success-chemistry-pb.fly.dev/api/custom/shipstation?action=export&start_date=...&end_date=...
POST https://success-chemistry-pb.fly.dev/api/custom/shipstation (ShipNotice XML)
```

---

## Differences: PocketBase vs Directus

| Feature | PocketBase | Directus |
|---------|-----------|----------|
| Admin URL | `/_/` | `/admin` |
| Database | SQLite (built-in) | PostgreSQL (external) |
| Auth | Superusers (in Admin UI) | Admin email/password (env vars) |
| Static Tokens | No (use api_config collection) | Yes (DIRECTUS_STATIC_TOKEN) |
| Session Storage | In-memory (ephemeral) | Redis (persistent if configured) |
| Custom API | Hooks in `pb_hooks/` | Extensions or custom routes |
| File Storage | `pb_data/storage/` | Local or S3 |

---

## Common Issues and Fixes

### "I can't login" / "Admin UI doesn't work"

1. **Use the correct URL**: https://success-chemistry-pb.fly.dev/_/
2. **Create admin account** if it's your first time
3. **Check if PocketBase is running**: `fly status -a success-chemistry-pb`
4. **Check logs**: `fly logs -a success-chemistry-pb`

### "Hooks aren't loading" / "API returns 404"

This is now fixed! The hooks (`pb_hooks/`) are copied to `/pb_data/pb_hooks/` on startup.

**Deploy the fix**:
```bash
cd pocketbase
./deploy.sh
```

**Verify hooks work**:
```bash
curl https://success-chemistry-pb.fly.dev/_admin_auth_ping
# Should return: {"ok":true,"msg":"00_admin_auth_proxy loaded"}
```

### "Session expires immediately"

**This is normal** on Fly.io free tier. Machines sleep after inactivity. Just login again.

**Want persistent sessions?** Upgrade Fly.io plan or add Redis (not trivial with PocketBase).

---

## Files to Ignore (Directus-related)

These files are **outdated** and refer to Directus (not your current setup):

- `SCV2/DIRECTUS_SETUP.md` ❌
- `SCV2/docs/DIRECTUS_TROUBLESHOOTING.md` ❌
- `SCV2/docs/DIRECTUS_FLY_DEPLOY.md` ❌

**Use these instead**:
- `pocketbase/README.md` ✅
- `pocketbase/POCKETBASE_ADMIN_LOGIN.md` ✅
- `pocketbase/DEPLOY_FIX.md` ✅
- `pocketbase/RESET_PB.md` ✅

---

## Quick Start (After Deploy)

1. **Deploy PocketBase** (if not done yet):
   ```bash
   cd pocketbase && ./deploy.sh
   ```

2. **Login to Admin UI**:
   https://success-chemistry-pb.fly.dev/_/

3. **Create api_config** (for PayPal, ShipStation):
   - Admin UI → Collections → api_config → Add Record
   - Fields: `paypal_client_id`, `paypal_client_secret`, `paypal_mode`, `shipstation_user`, `shipstation_password`

4. **Test API**:
   ```bash
   curl https://success-chemistry-pb.fly.dev/api/custom/health
   ```

5. **Update SCV2 env**:
   ```bash
   # .env.local
   NEXT_PUBLIC_API_BASE=https://success-chemistry-pb.fly.dev
   ```

6. **Deploy SCV2**:
   ```bash
   cd SCV2 && vercel --prod
   ```

---

## Summary

- **Backend**: PocketBase (NOT Directus)
- **Admin URL**: `/_/` (NOT `/admin`)
- **Deployed on**: Fly.io (`success-chemistry-pb`)
- **Sessions**: Expire on machine sleep (normal behavior)
- **Hooks**: Now auto-copy to `/pb_data/pb_hooks/` on startup
- **Docs**: Use `pocketbase/*.md`, ignore `DIRECTUS_*.md`

**You're all set!** 🚀
