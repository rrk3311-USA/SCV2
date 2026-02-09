import { redirect } from "next/navigation";
import { Container } from "@/components/Container";

const DIRECTUS_URL =
  process.env.DIRECTUS_URL || process.env.NEXT_PUBLIC_DIRECTUS_URL || "";

export default function AdminPage() {
  const base = DIRECTUS_URL.trim().replace(/\/$/, "");
  if (base) {
    redirect(base);
  }

  return (
    <Container className="py-16">
      <h1 className="text-2xl font-bold text-slate-900">Admin</h1>
      <p className="mt-4 text-slate-600">
        Admin is the <strong>Directus</strong> dashboard. For local preview:
      </p>
      <ol className="mt-4 list-decimal list-inside space-y-2 text-slate-700">
        <li>Run Directus locally (e.g. in another folder): <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm">npx directus init</code> then <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm">npx directus start</code></li>
        <li>Set in <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm">.env.local</code>: <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm">DIRECTUS_URL=http://localhost:8055</code></li>
        <li>Restart <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm">npm run dev</code> and open <a href="/admin" className="text-[#2854a6] underline">/admin</a> again — you’ll be redirected to Directus.</li>
      </ol>
      <p className="mt-6 text-sm text-slate-500">
        See <strong>DIRECTUS_SETUP.md</strong> for schema (orders, order_items) and token setup.
      </p>
    </Container>
  );
}
