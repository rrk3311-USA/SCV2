"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { getCart, removeFromCart, updateCartQuantity } from "@/lib/cart";
import { ROUTES } from "@/lib/constants";
import { getProductBySku } from "@/data/products";
import { Flask, Trash } from "@phosphor-icons/react";
import type { CartItem } from "@/lib/cart";
import { CartUpsell } from "./CartUpsell";

export function CartContents() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const sync = () => setCart(getCart());
    sync();
    window.addEventListener("cartUpdated", sync);
    return () => window.removeEventListener("cartUpdated", sync);
  }, []);

  if (!mounted) {
    return (
      <div className="mt-8 rounded-2xl border border-slate-200/80 bg-white p-8">
        <p className="text-slate-500">Loading cart…</p>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <>
        <div className="mt-8 rounded-2xl border border-slate-200/80 bg-white p-8 shadow-sm sm:p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="rounded-full bg-slate-100 p-6">
              <Flask size={64} weight="regular" className="text-slate-400" />
            </div>
            <h2 className="mt-6 text-xl font-semibold text-slate-900">Your cart is empty</h2>
            <p className="mt-2 max-w-sm text-slate-600">
              Add supplements from our shop to get started. Free shipping on orders over $50.
            </p>
            <Link
              href={ROUTES.store}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#2854a6] px-8 py-4 font-semibold text-white no-underline shadow-md transition hover:bg-[#1e3a8a] hover:shadow-lg"
            >
              <Flask size={22} weight="regular" />
              Browse Shop
            </Link>
          </div>
        </div>
        <CartUpsell excludeSkus={[]} title="Recommended for you" className="mt-12" />
      </>
    );
  }

  const subtotal = cart.reduce(
    (sum, i) => sum + parseFloat(i.price || "0") * (i.quantity || 1),
    0
  );

  const handleRemove = (sku: string, optionLabel?: string, isSubscription?: boolean) => {
    removeFromCart(sku, optionLabel, isSubscription);
    setCart(getCart());
  };

  const handleQtyChange = (sku: string, qty: number, optionLabel?: string, isSubscription?: boolean) => {
    updateCartQuantity(sku, qty, optionLabel, isSubscription);
    setCart(getCart());
  };

  const handleMedusaCheckout = async () => {
    setCheckoutError(null);
    setCheckoutLoading(true);
    try {
      const res = await fetch("/api/medusa-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((i) => ({
            sku: i.sku,
            quantity: i.quantity,
            optionLabel: i.optionLabel,
            isSubscription: i.isSubscription,
          })),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setCheckoutError(data.error || "Checkout failed");
        return;
      }
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
        return;
      }
      if (data.cartId) {
        const base = process.env.NEXT_PUBLIC_MEDUSA_URL || "";
        if (base) {
          window.location.href = `${base.replace(/\/$/, "")}/checkout?cart_id=${data.cartId}`;
          return;
        }
      }
      setCheckoutError("No checkout URL returned");
    } catch (e) {
      setCheckoutError(e instanceof Error ? e.message : "Checkout failed");
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <>
      <div className="mt-8 space-y-6">
        <ul className="space-y-4">
          {cart.map((item) => {
            const slug = getProductBySku(item.sku)?.slug ?? item.sku;
            const lineKey = `${item.sku}-${item.optionLabel ?? ""}-${item.isSubscription ?? false}`;
            return (
            <li
              key={lineKey}
              className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:gap-6"
            >
              {item.image && (
                <Link
                  href={ROUTES.product(slug)}
                  className="relative block h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50"
                >
                  <Image
                    src={item.image}
                    alt=""
                    fill
                    className="object-contain p-1"
                    sizes="96px"
                  />
                </Link>
              )}
              <div className="min-w-0 flex-1">
                <Link
                  href={ROUTES.product(slug)}
                  className="font-medium text-slate-900 hover:text-[#2854a6] hover:underline"
                >
                  {item.name}
                </Link>
                {(item.optionLabel || item.isSubscription) && (
                  <p className="mt-0.5 text-sm text-slate-500">
                    {item.optionLabel}
                    {item.optionLabel && item.isSubscription && " · "}
                    {item.isSubscription && "Subscribe & Save"}
                  </p>
                )}
                <p className="mt-1 text-lg font-semibold text-[#2854a6]">
                  ${item.price} × {item.quantity}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center rounded-lg border border-slate-200 bg-white">
                  <button
                    type="button"
                    onClick={() => handleQtyChange(item.sku, item.quantity - 1, item.optionLabel, item.isSubscription)}
                    className="px-3 py-1.5 text-slate-600 hover:bg-slate-100"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="min-w-[2rem] py-1.5 text-center text-sm font-medium">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleQtyChange(item.sku, item.quantity + 1, item.optionLabel, item.isSubscription)}
                    className="px-3 py-1.5 text-slate-600 hover:bg-slate-100"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(item.sku, item.optionLabel, item.isSubscription)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                  aria-label="Remove"
                >
                  <Trash size={20} weight="regular" />
                </button>
              </div>
            </li>
          );
          })}
        </ul>

        <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-6">
          <p className="text-right text-xl font-bold text-slate-900">
            Subtotal: ${subtotal.toFixed(2)}
          </p>
          <p className="mt-1 text-right text-sm text-slate-600">
            Shipping & taxes calculated at checkout
          </p>
          {checkoutError && (
            <p className="mt-2 text-right text-sm text-red-600" role="alert">
              {checkoutError}
            </p>
          )}
          <div className="mt-4 flex flex-wrap justify-end gap-3">
            <Link
              href={ROUTES.store}
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 no-underline transition hover:bg-slate-50"
            >
              <Flask size={20} weight="regular" />
              Continue shopping
            </Link>
            <button
              type="button"
              onClick={handleMedusaCheckout}
              disabled={checkoutLoading}
              className="inline-flex rounded-full bg-[#2854a6] px-6 py-3 font-semibold text-white shadow-md transition hover:bg-[#1e3a8a] disabled:opacity-70"
            >
              {checkoutLoading ? "Redirecting to PayPal…" : "Checkout with PayPal"}
            </button>
          </div>
        </div>
      </div>

      <CartUpsell excludeSkus={cart.map((i) => i.sku)} subtotal={subtotal} title="Add more, save more" className="mt-12" />
    </>
  );
}
