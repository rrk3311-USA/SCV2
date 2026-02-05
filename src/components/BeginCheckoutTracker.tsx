"use client";

import { useEffect, useRef } from "react";
import { getCart } from "@/lib/cart";
import { reportBeginCheckout } from "@/lib/gtag";

/**
 * Fires begin_checkout when cart page is viewed with non-empty cart (deepest linking).
 */
export function BeginCheckoutTracker() {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    const cart = getCart();
    if (cart.length === 0) return;
    const value = cart.reduce(
      (sum, i) => sum + parseFloat(i.price || "0") * (i.quantity || 1),
      0
    );
    reportBeginCheckout(
      cart.map((i) => ({
        item_id: i.sku,
        item_name: i.name,
        price: parseFloat(i.price || "0"),
        quantity: i.quantity || 1,
      })),
      value
    );
    fired.current = true;
  }, []);

  return null;
}
