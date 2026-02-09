"use client";

import { useEffect, useRef, useState } from "react";
import { reportPurchase } from "@/lib/gtag";

const API_BASE =
  typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_API_BASE || "https://success-chemistry-pb.fly.dev")
    : "";
const PAYPAL_CLIENT_ID =
  process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ||
  "AfUHsoJ2uDH7vJ-XDc8b2H0MGTtlGqVeEUkORnzKqePIvKFt5G-eKtlOg4Bl7dexwKE5vz7glt1vXqfC";

type OrderItem = { sku: string; name: string; quantity: number; price: number };

type CheckoutPayPalProps = {
  orderId: number;
  total: number;
  items: OrderItem[];
  onCleared?: () => void;
};

declare global {
  interface Window {
    paypal?: {
      Buttons: (config: unknown) => { render: (el: HTMLElement) => Promise<void> };
    };
  }
}

/**
 * PayPal button for cart checkout. Uses PocketBase to create/capture order.
 * On success, marks the Directus order as paid and redirects to order-confirmation.
 */
export function CheckoutPayPal({ orderId, total, items, onCleared }: CheckoutPayPalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current || items.length === 0) return;

    function loadScript(): Promise<void> {
      if (window.paypal) return Promise.resolve();
      return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD&intent=capture&components=buttons,funding-eligibility`;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Failed to load PayPal SDK"));
        document.head.appendChild(script);
      });
    }

    let mounted = true;

    loadScript()
      .then(() => {
        if (!mounted || !containerRef.current || !window.paypal) return;
        containerRef.current.innerHTML = "";

        const purchaseUnits = [
          {
            description: "Success Chemistry – Cart",
            amount: {
              currency_code: "USD",
              value: total.toFixed(2),
              breakdown: {
                item_total: {
                  currency_code: "USD",
                  value: total.toFixed(2),
                },
              },
            },
            items: items.map((item) => ({
              name: item.name,
              description: item.name,
              unit_amount: { currency_code: "USD", value: item.price.toFixed(2) },
              quantity: String(item.quantity),
            })),
          },
        ];

        window.paypal.Buttons({
          style: {
            layout: "vertical",
            color: "gold",
            shape: "rect",
            label: "paypal",
            height: 45,
          },
          createOrder: async () => {
            const res = await fetch(`${API_BASE}/api/paypal/orders`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                intent: "CAPTURE",
                purchase_units: purchaseUnits,
              }),
            });
            const data = await res.json();
            if (!data.success || !data.order?.id) {
              throw new Error(data.error || "Failed to create order");
            }
            return data.order.id;
          },
          onApprove: async (data: { orderID: string }) => {
            const res = await fetch(`${API_BASE}/api/paypal/orders/${data.orderID}/pay`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
            });
            const result = await res.json();
            if (!result.success) {
              setError(result.error || "Payment failed");
              return;
            }
            await fetch(`/api/orders/${orderId}/confirm`, { method: "POST" });
            reportPurchase(String(orderId), total);
            onCleared?.();
            const siteUrl = typeof window !== "undefined" ? window.location.origin : "";
            window.location.href = `${siteUrl}/order-confirmation?orderId=${orderId}&value=${total.toFixed(2)}`;
          },
          onError: (err: Error) => setError(err?.message || "PayPal error"),
        })
          .render(containerRef.current)
          .catch((err) => mounted && setError(err?.message || "Failed to render"));
      })
      .catch((err) => mounted && setError(err?.message || "Failed to load PayPal"));

    return () => {
      mounted = false;
    };
  }, [orderId, total, items, onCleared]);

  return (
    <div className="mt-4">
      <div ref={containerRef} className="min-h-[45px]" />
      {error && (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
