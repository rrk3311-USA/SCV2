"use client";

import { useEffect } from "react";
import { reportOutboundLink } from "@/lib/gtag";

/**
 * Listens for clicks on outbound links (external, mailto, tel) and fires event for deepest linking.
 */
export function OutboundTracker() {
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target?.href) return;
      try {
        const url = new URL(target.href);
        const isExternal =
          url.origin !== window.location.origin ||
          url.protocol === "mailto:" ||
          url.protocol === "tel:";
        if (isExternal) {
          reportOutboundLink(target.href, target.textContent?.slice(0, 100) ?? undefined);
        }
      } catch {
        // ignore invalid URLs
      }
    };
    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []);

  return null;
}
