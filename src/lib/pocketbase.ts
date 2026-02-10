/**
 * PocketBase REST client for server-side orders.
 * Uses NEXT_PUBLIC_API_BASE (PocketBase URL). Same backend is used for PayPal (client) and orders (server).
 * Create order as "pending"; after PayPal capture, PATCH order to "paid".
 */

const PB_URL = (process.env.POCKETBASE_URL || process.env.NEXT_PUBLIC_API_BASE || "").replace(/\/$/, "");

function getHeaders(): HeadersInit {
  return { "Content-Type": "application/json" };
}

export function isPocketBaseConfigured(): boolean {
  return Boolean(PB_URL?.trim());
}

/** Create an order in PocketBase (status: pending). Returns the created order id (string). */
export async function createOrder(
  total: number,
  items: { sku: string; name: string; quantity: number; price: number }[],
  _options?: { paypal_order_id?: string }
): Promise<{ id: string } | null> {
  if (!PB_URL?.trim()) return null;

  const res = await fetch(`${PB_URL}/api/custom/orders`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      status: "pending",
      total: Math.round(total * 100) / 100,
      items: items.map((i) => ({
        sku: i.sku,
        name: i.name,
        quantity: i.quantity,
        price: Math.round(i.price * 100) / 100,
      })),
      customerEmail: "",
      customerName: "",
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PocketBase order create failed: ${res.status} ${text}`);
  }
  const json = (await res.json()) as { success?: boolean; id?: string };
  const id = json?.id;
  if (!id) throw new Error("PocketBase did not return order id");
  return { id };
}

/** Get a single order by id (for checkout page). */
export async function getOrder(orderId: string | number): Promise<{
  id: string;
  status: string;
  total: number;
  order_items?: { sku: string; name: string; quantity: number; price: number }[];
} | null> {
  if (!PB_URL?.trim()) return null;

  const id = String(orderId);
  const res = await fetch(`${PB_URL}/api/custom/orders/${id}`, { headers: getHeaders() });
  if (!res.ok) return null;
  const data = (await res.json()) as {
    id?: string;
    status?: string;
    total?: number;
    items?: { sku: string; name: string; quantity: number; price: number }[];
  };
  if (!data?.id) return null;
  const items = Array.isArray(data.items) ? data.items : [];
  return {
    id: data.id,
    status: data.status ?? "pending",
    total: Number(data.total) ?? 0,
    order_items: items,
  };
}

/** Update order status (e.g. after PayPal capture). */
export async function updateOrderStatus(
  orderId: string | number,
  status: "pending" | "paid" | "cancelled"
): Promise<boolean> {
  if (!PB_URL?.trim()) return false;
  const id = String(orderId);
  const res = await fetch(`${PB_URL}/api/custom/orders/${id}`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify({ status }),
  });
  return res.ok;
}
