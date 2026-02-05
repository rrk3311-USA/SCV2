# Medusa Backend: Staying Logged In (Session / Logout Troubleshooting)

If you get logged out when using **https://medusa-backend-dark-resonance-4960.fly.dev** (especially the Admin at `/app`) — on the same device or when switching phone/other browser — use this guide.

## Why you get logged out

1. **Different device or browser**  
   Logins are per browser/device. Logging in on your phone does not log you in on your laptop, and vice versa. That’s expected.

2. **Same device but session keeps disappearing**  
   Usually one of:
   - **In-memory sessions** – Backend stores sessions in memory. When Fly restarts or runs more than one instance, the session is lost.
   - **No sticky sessions** – Multiple Fly machines; each request can hit a different machine that doesn’t have your session.
   - **Cookie settings** – Cookies not being sent or not persisting (SameSite, Secure, domain).

---

## Fixes (in your Medusa backend repo)

Your Medusa backend is in a **separate repo** (e.g. `medusa-backend`). Apply these there.

### 1. Use a persistent session store (recommended)

Stop using in-memory sessions. Use **Redis** (or another shared store) so sessions survive restarts and work across instances.

- **Redis on Fly.io**  
  Create a Redis app and connect your Medusa app to it (e.g. `REDIS_URL`).
- In your Medusa backend, configure the session store to use that Redis (see Medusa v2 docs for session store configuration).
- Set env (or secrets) on the Medusa app, e.g.  
  `fly secrets set REDIS_URL="redis://..." -a medusa-backend-dark-resonance-4960`

### 2. Sticky sessions (if you keep in-memory sessions)

If you still use in-memory sessions, force each user to always hit the same Fly machine:

- In `fly.toml` (or equivalent) for `medusa-backend-dark-resonance-4960`, enable **sticky sessions** so the same session cookie always routes to the same instance.
- See: [Fly.io – Sticky sessions](https://fly.io/docs/blueprints/sticky-sessions/).

### 3. Cookie settings (Admin on same host as API)

Admin is on the same host as the API (`medusa-backend-dark-resonance-4960.fly.dev`), so cookies should be same-origin. If you still lose the session:

- Ensure the backend is behind HTTPS and sets cookies with **Secure**.
- If you use a reverse proxy, set **trust proxy** so the app sees `req.protocol === "https"` and sets Secure cookies correctly.
- Avoid `SameSite=Strict` if you have redirects from other domains; `Lax` is usually enough for Admin on the same domain.

### 4. CORS (only for storefront on a different domain)

If your **storefront** (e.g. SCV2 on Vercel) calls the Medusa API and you add customer login later:

- Backend must allow the storefront origin in CORS (you already have `STORE_CORS` / `AUTH_CORS` in CONNECTED_TO_BACKEND.md).
- For **customer** login from another domain, prefer **JWT in localStorage** in the frontend (Medusa JS SDK default) so you don’t rely on cross-origin cookies, which many browsers block.

---

## Summary

| Symptom | Likely cause | What to do |
|--------|----------------|------------|
| Logged out on **another** phone/browser | Different device | Normal; log in again on each device. |
| Logged out on the **same** device after a while or after refresh | Sessions not shared or lost | Use **Redis** (or another persistent session store) in the Medusa backend. |
| Logged out on same device randomly | Multiple instances, in-memory sessions | Use **sticky sessions** or, better, a **persistent session store** (Redis). |

Most “keeps logging me out” issues on Fly are fixed by **persistent sessions (Redis)** and correct **cookie/trust proxy** settings in the **medusa-backend** repo.
