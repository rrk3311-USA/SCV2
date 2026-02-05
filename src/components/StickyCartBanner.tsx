"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, CaretRight, X } from "@phosphor-icons/react";
import { ROUTES } from "@/lib/constants";
import { getCartSummary } from "@/lib/cart";

/**
 * Sticky bottom bar – shows when cart has items (hidden on cart page).
 * New UX: compact, rounded-full buttons, Phosphor icons.
 */
export function StickyCartBanner() {
  const pathname = usePathname();
  const [summary, setSummary] = useState({ count: 0, total: 0 });
  const [dismissed, setDismissed] = useState(false);

  const update = () => {
    setSummary(getCartSummary());
  };

  useEffect(() => {
    update();

    const onCartUpdate = () => update();
    window.addEventListener("cartUpdated", onCartUpdate);
    window.addEventListener("storage", onCartUpdate);
    return () => {
      window.removeEventListener("cartUpdated", onCartUpdate);
      window.removeEventListener("storage", onCartUpdate);
    };
  }, []);

  const isCartPage = pathname === ROUTES.cart;
  const show = summary.count > 0 && !isCartPage && !dismissed;

  if (!show) return null;

  const itemsLabel = summary.count === 1 ? "1 item" : `${summary.count} items`;

  return (
    <div className="sticky-cart-slide-up fixed bottom-0 left-0 right-0 z-[9999] flex flex-col shadow-[0_-4px_20px_rgba(0,0,0,0.2)]">
      {/* Top gradient strip – animated color flow (blue, purple, pink, cyan, yellow, green) */}
      <div className="sticky-cart-gradient-strip h-1.5 w-full shrink-0" aria-hidden />
      <div
        className="flex min-h-0 w-full items-center justify-between gap-3 px-4 py-3 sm:gap-6 sm:px-6 sm:py-4"
        style={{
          background: "linear-gradient(135deg, #2854a6 0%, #1e3f73 100%)",
          borderTop: "1px solid rgba(255,255,255,0.2)",
        }}
      >
        <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15 sm:h-11 sm:w-11">
            <ShoppingCart size={24} weight="regular" className="text-white" />
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold text-white text-sm sm:text-lg">{itemsLabel}</p>
            <p className="text-xs text-white/90 sm:text-sm">${summary.total.toFixed(2)}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setDismissed(true)}
            aria-label="Close"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white transition hover:bg-white/20 sm:h-10 sm:w-10"
          >
            <X size={18} weight="bold" />
          </button>
          <Link
            href={ROUTES.cart}
            className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl px-4 py-2 text-xs font-semibold no-underline transition hover:opacity-95 sm:gap-2 sm:px-5 sm:py-2.5 sm:text-sm"
          style={{
            background: "linear-gradient(145deg, #e8e8e8 0%, #c0c0c0 35%, #a8a8a8 70%, #c8c8c8 100%)",
            color: "#2d3748",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.4), 0 2px 6px rgba(0,0,0,0.25), 0 1px 0 rgba(0,0,0,0.1)",
            border: "1px solid rgba(255,255,255,0.35)",
          }}
        >
          View Cart
          <CaretRight size={18} weight="bold" />
        </Link>
      </div>
      </div>
    </div>
  );
}
