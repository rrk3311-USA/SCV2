import { redirect } from "next/navigation";
import { Container } from "@/components/Container";
import { AdminRedirectClient } from "./AdminRedirectClient";

// Always run at request time so redirect uses current env (e.g. Vercel Production)
export const dynamic = "force-dynamic";

const PB_URL = (process.env.POCKETBASE_URL || process.env.NEXT_PUBLIC_API_BASE || "").trim().replace(/\/$/, "");
const SUPABASE_URL = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim().replace(/\/$/, "");
const DIRECTUS_URL = (process.env.DIRECTUS_URL || process.env.NEXT_PUBLIC_DIRECTUS_URL || "").trim().replace(/\/$/, "");

export default function AdminPage() {
  // Prefer PocketBase Admin (orders + PayPal backend)
  if (PB_URL) redirect(`${PB_URL}/_/`);
  const match = SUPABASE_URL ? SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/) : null;
  if (match?.[1]) redirect(`https://app.supabase.com/project/${match[1]}`);
  if (DIRECTUS_URL) redirect(DIRECTUS_URL);

  return (
    <Container className="py-16">
      <h1 className="text-2xl font-bold text-slate-900">Admin</h1>
      <p className="mt-1 text-xs text-slate-400">(SCV2 admin – login redirect)</p>
      <AdminRedirectClient />
      <p className="mt-4 text-slate-600">
        Admin redirects to your backend dashboard when configured.
      </p>
      <p className="mt-2 rounded bg-amber-50 px-3 py-2 text-sm text-amber-900">
        <strong>No redirect:</strong> set <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm">NEXT_PUBLIC_API_BASE</code> (PocketBase), <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm">SUPABASE_URL</code>, or <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm">DIRECTUS_URL</code> in Vercel or <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm">.env.local</code>.
      </p>
      <p className="mt-4 text-sm text-slate-500">
        With <strong>PocketBase</strong>: /admin → PocketBase Admin (<code>/_/</code>) where you log in. With Supabase/Directus, /admin → their dashboard.
      </p>
    </Container>
  );
}
