/**
 * Checkout: create order in Directus, return checkout URL.
 * Cart stays in localStorage; this records the order and sends user to payment.
 */
import { NextResponse } from "next/server";
import { createOrder, isDirectusConfigured } from "@/lib/directus";
import { getProductBySku } from "@/data/products";

type CartLine = { sku: string; quantity: number; name?: string; price?: string | number };

function parseBody(body: unknown): CartLine[] | null {
  if (!body || typeof body !== "object" || !Array.isArray((body as { items?: unknown }).items))
    return null;
  const items = (body as { items: unknown[] }).items;
  const out: CartLine[] = [];
  for (const it of items) {
    if (it && typeof it === "object" && typeof (it as CartLine).sku === "string") {
      const sku = (it as CartLine).sku;
      const quantity = Math.max(1, Math.min(999, Number((it as CartLine).quantity) || 1));
      const name = typeof (it as CartLine).name === "string" ? (it as CartLine).name : undefined;
      const price = (it as CartLine).price !== undefined ? (it as CartLine).price : undefined;
      out.push({ sku, quantity, name, price });
    }
  }
  return out.length ? out : null;
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const lines = parseBody(body);
    if (!lines || lines.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    if (!isDirectusConfigured()) {
      return NextResponse.json(
        { error: "Directus not configured (DIRECTUS_URL and DIRECTUS_STATIC_TOKEN)" },
        { status: 503 }
      );
    }

    const items: { sku: string; name: string; quantity: number; price: number }[] = [];
    let total = 0;
    for (const line of lines) {
      const product = getProductBySku(line.sku);
      const name = line.name ?? product?.name ?? line.sku;
      const price = product?.price ?? (typeof line.price === "number" ? line.price : parseFloat(String(line.price || "0")));
      const safePrice = Math.max(0, price);
      total += safePrice * line.quantity;
      items.push({ sku: line.sku, name, quantity: line.quantity, price: safePrice });
    }

    const result = await createOrder(total, items);
    if (!result) {
      return NextResponse.json({ error: "Failed to create order" }, { status: 502 });
    }

    const siteBase =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:8000");
    const checkoutUrl = `${siteBase.replace(/\/$/, "")}/checkout?order_id=${result.id}`;

    return NextResponse.json({
      orderId: result.id,
      checkoutUrl,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Checkout failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
