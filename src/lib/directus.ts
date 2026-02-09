/**
 * Directus REST client for server-side use (orders, optional products).
 * Set DIRECTUS_URL and DIRECTUS_STATIC_TOKEN in env.
 */

const DIRECTUS_URL = process.env.DIRECTUS_URL || process.env.NEXT_PUBLIC_DIRECTUS_URL || "";
const DIRECTUS_TOKEN = process.env.DIRECTUS_STATIC_TOKEN || "";

export type DirectusOrder = {
  id?: number;
  status: "pending" | "paid" | "cancelled";
  total: number;
  currency?: string;
  date_created?: string;
  paypal_order_id?: string;
};

export type DirectusOrderItem = {
  id?: number;
  order_id?: number;
  sku: string;
  name: string;
  quantity: number;
  price: number;
};

function getHeaders(): HeadersInit {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (DIRECTUS_TOKEN) headers["Authorization"] = `Bearer ${DIRECTUS_TOKEN}`;
  return headers;
}

export function isDirectusConfigured(): boolean {
  return Boolean(DIRECTUS_URL?.trim());
}

/** Create an order and its line items in Directus. Returns the created order id. */
export async function createOrder(
  total: number,
  items: { sku: string; name: string; quantity: number; price: number }[],
  options?: { paypal_order_id?: string }
): Promise<{ id: number } | null> {
  if (!DIRECTUS_URL?.trim()) return null;

  const orderPayload: Record<string, unknown> = {
    status: "pending",
    total: Math.round(total * 100) / 100,
    currency: "USD",
    ...(options?.paypal_order_id && { paypal_order_id: options.paypal_order_id }),
  };

  const res = await fetch(`${DIRECTUS_URL.replace(/\/$/, "")}/items/orders`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(orderPayload),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Directus order create failed: ${res.status} ${text}`);
  }
  const order = (await res.json()) as { data?: { id: number }; id?: number };
  const orderId = order?.data?.id ?? order?.id;
  if (orderId == null) throw new Error("Directus did not return order id");

  const collection = "order_items";
  for (const item of items) {
    const itemPayload = {
      order_id: orderId,
      sku: item.sku,
      name: item.name,
      quantity: item.quantity,
      price: Math.round(item.price * 100) / 100,
    };
    const ir = await fetch(`${DIRECTUS_URL.replace(/\/$/, "")}/items/${collection}`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(itemPayload),
    });
    if (!ir.ok) {
      const text = await ir.text();
      throw new Error(`Directus order_items create failed: ${ir.status} ${text}`);
    }
  }

  return { id: orderId };
}

/** Get a single order by id (for checkout page). */
export async function getOrder(orderId: string | number): Promise<{
  id: number;
  status: string;
  total: number;
  currency?: string;
  order_items?: DirectusOrderItem[];
} | null> {
  if (!DIRECTUS_URL?.trim()) return null;
  const id = typeof orderId === "string" ? parseInt(orderId, 10) : orderId;
  if (Number.isNaN(id)) return null;

  const res = await fetch(
    `${DIRECTUS_URL.replace(/\/$/, "")}/items/orders/${id}?fields=*,order_items.*`,
    { headers: getHeaders() }
  );
  if (!res.ok) return null;
  const json = (await res.json()) as { data?: unknown };
  return (json.data as { id: number; status: string; total: number; currency?: string; order_items?: DirectusOrderItem[] }) ?? null;
}

/** Update order status (e.g. after PayPal capture). */
export async function updateOrderStatus(orderId: number, status: "pending" | "paid" | "cancelled"): Promise<boolean> {
  if (!DIRECTUS_URL?.trim()) return false;
  const res = await fetch(`${DIRECTUS_URL.replace(/\/$/, "")}/items/orders/${orderId}`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify({ status }),
  });
  return res.ok;
}
