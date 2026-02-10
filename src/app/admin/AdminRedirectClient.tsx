"use client";

import { useEffect } from "react";

export function AdminRedirectClient() {
  useEffect(() => {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE?.trim()?.replace(/\/$/, "");
    if (apiBase) {
      window.location.replace(`${apiBase}/_/`);
      return;
    }
    const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
    const m = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
    if (m?.[1]) {
      window.location.replace(`https://app.supabase.com/project/${m[1]}`);
      return;
    }
    const directusUrl = (process.env.NEXT_PUBLIC_DIRECTUS_URL || "").trim();
    if (directusUrl) window.location.replace(directusUrl);
  }, []);
  return (
    <p className="mt-2 text-sm text-slate-500">
      Redirecting to admin login…
    </p>
  );
}
