"use client";

import Script from "next/script";
import { useMemo } from "react";

const YOTPO_APP_KEY = process.env.NEXT_PUBLIC_YOTPO_APP_KEY;

export type YotpoConversionTrackerProps = {
  orderId: string | undefined;
  orderAmount: number | undefined;
  orderCurrency?: string;
};

export function YotpoConversionTracker({
  orderId,
  orderAmount,
  orderCurrency = "USD",
}: YotpoConversionTrackerProps) {
  const shouldTrack = Boolean(YOTPO_APP_KEY && orderId);
  const conversionData = useMemo(() => {
    if (!shouldTrack) return null;
    return { orderId, orderAmount: String(orderAmount ?? 0), orderCurrency };
  }, [shouldTrack, orderId, orderAmount, orderCurrency]);

  if (!shouldTrack || !conversionData) return null;

  return (
    <>
      <Script id="yotpo-conversion-data" strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: `window.yotpoTrackConversionData = ${JSON.stringify(conversionData)};` }} />
      <Script src={`https://staticw2.yotpo.com/${YOTPO_APP_KEY}/widget.js`} strategy="afterInteractive" />
      <noscript>
        <img src={`https://api.yotpo.com/conversion_tracking.gif?app_key=${YOTPO_APP_KEY}&order_id=${encodeURIComponent(conversionData.orderId)}&order_amount=${encodeURIComponent(conversionData.orderAmount)}&order_currency=${encodeURIComponent(conversionData.orderCurrency)}`} alt="" width={1} height={1} />
      </noscript>
    </>
  );
}
