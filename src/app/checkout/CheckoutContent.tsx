"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Container } from "@/components/Container";
import { CheckoutPayPal } from "@/components/CheckoutPayPal";
import { ROUTES } from "@/lib/constants";

type Order = {
  id: number | string;
  status: string;
  total: number;
  order_items?: { sku: string; name: string; quantity: number; price: number }[];
};

export function CheckoutContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setError("Missing order");
      setLoading(false);
      return;
    }
    fetch(`/api/orders/${orderId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Order not found");
        return res.json();
      })
      .then(setOrder)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load order"))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return (
      <Container className="py-16 text-center">
        <p className="text-slate-500">Loading checkout…</p>
      </Container>
    );
  }

  if (error || !order) {
    return (
      <Container className="py-16 text-center">
        <p className="text-red-600">{error || "Order not found"}</p>
        <Link href={ROUTES.cart} className="mt-4 inline-block text-[#2854a6] underline">
          Back to cart
        </Link>
      </Container>
    );
  }

  if (order.status === "paid") {
    return (
      <Container className="py-16 text-center">
        <p className="text-slate-600">This order is already paid.</p>
        <Link
          href={`/order-confirmation?orderId=${order.id}&value=${order.total}`}
          className="mt-4 inline-block text-[#2854a6] font-medium underline"
        >
          View confirmation
        </Link>
      </Container>
    );
  }

  const items = order.order_items ?? [];
  const total = order.total;

  return (
    <Container className="py-12">
      <h1 className="text-2xl font-bold text-slate-900">Complete your order</h1>
      <p className="mt-1 text-slate-600">Order #{order.id}</p>
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-lg font-semibold text-slate-900">
          Total: ${total.toFixed(2)} USD
        </p>
        {items.length > 0 && (
          <ul className="mt-3 list-inside list-disc text-sm text-slate-600">
            {items.map((item, i) => (
              <li key={i}>
                {item.name} × {item.quantity} — ${(item.price * item.quantity).toFixed(2)}
              </li>
            ))}
          </ul>
        )}
        <CheckoutPayPal orderId={order.id} total={total} items={items} />
      </div>
      <p className="mt-4 text-center text-sm text-slate-500">
        <Link href={ROUTES.cart} className="text-[#2854a6] underline">
          Back to cart
        </Link>
      </p>
    </Container>
  );
}
