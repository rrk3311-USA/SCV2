"use client";

import { useEffect, useRef } from "react";

function toYotpoProductId(sku: string): string {
  return sku.replace(/[^a-zA-Z0-9_-]/g, "_");
}

export type YotpoReviewsProps = {
  sku: string;
  name: string;
  price: number;
  productUrl: string;
  imageUrl: string;
  showStarRating?: boolean;
};

export function YotpoReviews({
  sku,
  name,
  price,
  productUrl,
  imageUrl,
  showStarRating = true,
}: YotpoReviewsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const productId = toYotpoProductId(sku);

  useEffect(() => {
    const w = typeof window !== "undefined" ? (window as Window & { yotpo?: { refreshWidgets: () => void } }).yotpo : undefined;
    if (w?.refreshWidgets && containerRef.current) w.refreshWidgets();
  }, [productId]);

  if (!process.env.NEXT_PUBLIC_YOTPO_APP_KEY) return null;

  return (
    <section className="mt-12 border-t border-slate-200 pt-10" ref={containerRef} aria-label="Customer reviews">
      <h2 className="text-lg font-semibold text-slate-900 mb-4">Customer reviews</h2>
      {showStarRating && <div className="yotpo bottomLine mb-6" data-yotpo-product-id={productId} />}
      <div
        className="yotpo yotpo-main-widget"
        data-product-id={productId}
        data-price={String(price)}
        data-currency="USD"
        data-name={name}
        data-url={productUrl}
        data-image-url={imageUrl}
      />
    </section>
  );
}
