/**
 * Google Pay order endpoint.
 * Receives payment token + cart items and returns orderId + value for redirect to /order-confirmation.
 *
 * Current behavior: returns a stub order (orderId, value) so the redirect and tracking work.
 * For production: integrate with your payment processor (Stripe, Braintree, etc.):
 * 1. Use paymentMethodData.tokenizationData.token (and type) to charge via your gateway.
 * 2. Create the order in your PocketBase backend.
 * 3. Return the real orderId and value.
 * See GOOGLE_PAY_SETUP.md and your gateway's Google Pay docs.
 */
import { NextResponse } from "next/server";

type LineItem = { sku: string; name: string; price: number; quantity: number };

function parseBody(body: unknown): {
  paymentMethodData: unknown;
  items: LineItem[];
  total: number;
  currency: string;
} | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  const items = b.items;
  if (!Array.isArray(items) || items.length === 0) return null;
  const total = Number(b.total);
  if (!Number.isFinite(total) || total <= 0) return null;
  const parsed: LineItem[] = [];
  for (const it of items) {
    if (it && typeof it === "object" && typeof (it as LineItem).sku === "string") {
      const price = Number((it as LineItem).price);
      const quantity = Math.max(1, Math.min(999, Number((it as LineItem).quantity) || 1));
      if (Number.isFinite(price)) {
        parsed.push({
          sku: (it as LineItem).sku,
          name: typeof (it as LineItem).name === "string" ? (it as LineItem).name : "Item",
          price,
          quantity,
        });
      }
    }
  }
  if (parsed.length === 0) return null;
  return {
    paymentMethodData: b.paymentMethodData,
    items: parsed,
    total,
    currency: typeof b.currency === "string" ? b.currency : "USD",
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const parsed = parseBody(body);
    if (!parsed) {
      return NextResponse.json(
        { error: "Invalid request: items and total required" },
        { status: 400 }
      );
    }

    // TODO: Production – charge via your gateway using parsed.paymentMethodData, create order in backend.
    // const token = (parsed.paymentMethodData as { tokenizationData?: { token?: string } })?.tokenizationData?.token;
    // e.g. Stripe: create PaymentIntent with payment_method_data from token, then create order.

    const orderId = `gpay-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const value = parsed.total;

    return NextResponse.json({ orderId, value });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Payment failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
