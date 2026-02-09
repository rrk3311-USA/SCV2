"use client";

import { useEffect, useRef } from "react";
import { reportPurchase } from "@/lib/gtag";

/**
 * Fires reportPurchase (GA4 + Google Ads) once when order confirmation page is viewed with orderId.
 * Used for PayPal and Google Pay payment flows for Google tracking.
 */
export function PurchaseTracker({
  orderId,
  value,
}: {
  orderId: string | undefined;
  value?: number;
}) {
  const fired = useRef(false);

  useEffect(() => {
    if (!orderId || fired.current) return;
    reportPurchase(orderId, typeof value === "number" && value >= 0 ? value : 0);
    fired.current = true;
  }, [orderId, value]);

  return null;
}
