"use client";

import Script from "next/script";

const YOTPO_APP_KEY = process.env.NEXT_PUBLIC_YOTPO_APP_KEY;

/**
 * Loads Yotpo widget script so review widgets (star rating, main widget) work.
 * Only renders when NEXT_PUBLIC_YOTPO_APP_KEY is set.
 */
export function YotpoScript() {
  if (!YOTPO_APP_KEY) return null;
  return (
    <Script
      src={`https://staticw2.yotpo.com/${YOTPO_APP_KEY}/widget.js`}
      strategy="afterInteractive"
    />
  );
}
