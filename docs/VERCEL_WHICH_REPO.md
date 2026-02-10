# Which repo does Vercel use for www.successchemistry.com?

## Current setup

**Everything is in the SCV3 folder** (in success007 and, once synced, in your v3 repo).

- **success007 repo:** has **SCV3/** with the full Next.js storefront (admin redirect, Supabase, etc.). Vercel can use repo **success007** with **Root Directory = SCV3**.
- **SCV2 repo:** if you deploy from **rrk3311-USA/SCV2**, that repo must contain an **SCV3** folder. Copy the **SCV3** folder from success007 into the SCV2 repo (or add success007 as a remote and copy SCV3 in), then push. Then Vercel (Root Directory **SCV3**) will find it.

Keep **SUPABASE_URL** / **NEXT_PUBLIC_SUPABASE_URL** in Vercel so /admin redirects.

## Summary

- **Production:** Vercel **Root Directory = SCV3**. Connected repo must contain an **SCV3** folder with the app (e.g. success007 has it; or copy SCV3 into the SCV2 repo).
