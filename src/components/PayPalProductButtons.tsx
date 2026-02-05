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

type PayPalProductButtonsProps = {
  sku: string;
  name: string;
  price: number;
  quantity?: number;
};

declare global {
  interface Window {
    paypal?: {
      Buttons: (config: unknown) => { render: (el: HTMLElement) => Promise<void> };
    };
  }
}

/**
 * Loads PayPal SDK and renders dynamic checkout buttons for this product.
 * Uses PocketBase API: POST /api/paypal/orders and POST /api/paypal/orders/:id/pay.
 */
export function PayPalProductButtons({ sku, name, price, quantity = 1 }: PayPalProductButtonsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return;

    const amount = price * quantity;
    const description = quantity > 1 ? `${name} (×${quantity})` : name;
    const items = [
      { name, description: name, price, quantity },
    ];

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
                purchase_units: [
                  {
                    description,
                    amount: {
                      currency_code: "USD",
                      value: amount.toFixed(2),
                      ...(items.length
                        ? {
                            breakdown: {
                              item_total: {
                                currency_code: "USD",
                                value: amount.toFixed(2),
                              },
                            },
                          }
                        : {}),
                    },
                    items: items.map((item) => ({
                      name: item.name,
                      description: item.description || item.name,
                      unit_amount: {
                        currency_code: "USD",
                        value: item.price.toFixed(2),
                      },
                      quantity: String(item.quantity),
                    })),
                  },
                ],
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
            if (result.success) {
              const orderId = result.details?.id || data.orderID;
              reportPurchase(orderId, amount);
              window.location.href = `/order-confirmation?orderId=${orderId}`;
            } else {
              setError(result.error || "Payment failed");
            }
          },
          onError: (err: Error) => {
            setError(err?.message || "PayPal error");
          },
        })
          .render(containerRef.current)
          .then(() => mounted && setLoaded(true))
          .catch((err) => mounted && setError(err?.message || "Failed to render buttons"));
      })
      .catch((err) => mounted && setError(err?.message || "Failed to load PayPal"));

    return () => {
      mounted = false;
    };
  }, [sku, name, price, quantity]);

  return (
    <div className="mt-4">
      <p className="mb-2 text-sm font-medium text-slate-700">Pay with PayPal</p>
      <div ref={containerRef} className="min-h-[45px]" />
      {error && (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      {loaded && (
        <p className="mt-2 text-xs text-slate-500">
          Secure checkout. Supports PayPal, cards, Pay Later, and Venmo.
        </p>
      )}
    </div>
  );
}
