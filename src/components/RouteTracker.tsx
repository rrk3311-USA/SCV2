"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { setPageView } from "@/lib/gtag";

/**
 * Fires page_view on every client-side route change (deepest linking).
 * GA4 config only sends page_view on first load; this covers SPA navigations.
 */
export function RouteTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname) setPageView(pathname);
  }, [pathname]);

  return null;
}
