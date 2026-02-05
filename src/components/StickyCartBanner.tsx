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
    <div
      className="sticky-cart-slide-up fixed bottom-0 left-0 right-0 z-[9999] flex items-center justify-between gap-4 border-t border-white/20 px-5 py-4 shadow-[0_-4px_20px_rgba(0,0,0,0.2)] sm:gap-6 sm:px-6"
      style={{
        background: "linear-gradient(135deg, #2854a6 0%, #1e3f73 100%)",
      }}
    >
      <div className="flex flex-1 items-center gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/15">
          <ShoppingCart size={24} weight="regular" className="text-white" />
        </div>
        <div>
          <p className="font-semibold text-white sm:text-lg">{itemsLabel}</p>
          <p className="text-sm text-white/90">${summary.total.toFixed(2)}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Link
          href={ROUTES.cart}
          className="inline-flex items-center gap-1.5 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#2854a6] no-underline shadow-md transition hover:opacity-90"
        >
          View Cart
          <CaretRight size={18} weight="bold" />
        </Link>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Close"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-white/50 text-white transition hover:bg-white/20"
        >
          <X size={18} weight="bold" />
        </button>
      </div>
    </div>
  );
}
