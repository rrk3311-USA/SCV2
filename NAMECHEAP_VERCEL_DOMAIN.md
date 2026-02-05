# Namecheap + Vercel domain setup (successchemistry.com)

Use this to point **successchemistry.com** and **www.successchemistry.com** at your Vercel project **scv2-success-chemistry**.

---

## 1. Vercel – add the domain

1. Open: **[Vercel → scv2-success-chemistry → Settings → Domains](https://vercel.com/rrk3311-usas-projects/scv2-success-chemistry/settings/domains)**
2. Click **Add** and add:
   - `www.successchemistry.com`
   - `successchemistry.com`
3. Leave **Redirect** as Vercel suggests (e.g. `successchemistry.com` → `www.successchemistry.com` if you want everything on www).
4. Vercel will show **incomplete** until DNS is set. Copy or note the values it shows for each domain (they’re standard; below are the usual ones).

---

## 2. Namecheap – DNS records

In **Namecheap**: **Domain List** → **Manage** next to **successchemistry.com** → **Advanced DNS**.

Add or edit so you have **exactly** this:

| Type  | Host | Value              | TTL   |
|-------|------|--------------------|-------|
| **A** | `@`  | `76.76.21.21`      | Automatic |
| **CNAME** | `www` | `cname.vercel-dns.com` | Automatic |

- **A record**  
  - Host: `@` (means “apex” = successchemistry.com).  
  - Value: `76.76.21.21` (Vercel’s IP for apex).

- **CNAME record**  
  - Host: `www`.  
  - Value: `cname.vercel-dns.com`.

Remove any **other** A or CNAME for `@` or `www` that point somewhere else (e.g. old hosting), or the domain may not resolve to Vercel.

---

## 3. After saving DNS

- DNS can take **5–60 minutes** (sometimes longer).
- In Vercel **Domains**, status will change from “Incomplete” to a checkmark when it’s correct.
- Then:
  - **https://www.successchemistry.com** → your SCV2 site.
  - **https://successchemistry.com** → redirects to www (if you left Vercel’s default redirect).

---

## 4. HTTPS

Vercel issues SSL for your domain automatically once the domain is verified. No extra step in Namecheap for HTTPS.

---

## Summary

| Where     | What to do |
|----------|------------|
| **Vercel** | Add `successchemistry.com` and `www.successchemistry.com` in Domains; leave redirect as suggested. |
| **Namecheap** | A record `@` → `76.76.21.21`; CNAME `www` → `cname.vercel-dns.com`. |

I can’t log into your Namecheap or Vercel; you need to add these in each dashboard. If Vercel shows different values when you add the domain, use what Vercel shows (they’re usually the same as above).
