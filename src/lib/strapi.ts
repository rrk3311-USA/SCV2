/**
 * Strapi REST client for server-side orders.
 * Set STRAPI_URL and STRAPI_API_TOKEN in env.
 * Strapi content type: "order" with total (decimal), status (enum), items (JSON).
 */

const STRAPI_URL = (process.env.STRAPI_URL || process.env.NEXT_PUBLIC_STRAPI_URL || "").replace(/\/$/, "");
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN || "";

function getHeaders(): HeadersInit {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (STRAPI_TOKEN) headers["Authorization"] = `Bearer ${STRAPI_TOKEN}`;
  return headers;
}

export function isStrapiConfigured(): boolean {
  return Boolean(STRAPI_URL?.trim());
}

/** Create an order in Strapi. Returns the created order id (number or string). */
export async function createOrder(
  total: number,
  items: { sku: string; name: string; quantity: number; price: number }[],
  _options?: { paypal_order_id?: string }
): Promise<{ id: number | string } | null> {
  if (!STRAPI_URL?.trim()) return null;

  const res = await fetch(`${STRAPI_URL}/api/orders`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      data: {
        total: Math.round(total * 100) / 100,
        status: "pending",
        items: items.map((i) => ({
          sku: i.sku,
          name: i.name,
          quantity: i.quantity,
          price: Math.round(i.price * 100) / 100,
        })),
      },
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Strapi order create failed: ${res.status} ${text}`);
  }
  const json = (await res.json()) as { data?: { id: number | string } };
  const id = json?.data?.id;
  if (id == null) throw new Error("Strapi did not return order id");
  return { id };
}

/** Get a single order by id (for checkout page). */
export async function getOrder(orderId: string | number): Promise<{
  id: number | string;
  status: string;
  total: number;
  order_items?: { sku: string; name: string; quantity: number; price: number }[];
} | null> {
  if (!STRAPI_URL?.trim()) return null;

  const res = await fetch(`${STRAPI_URL}/api/orders/${orderId}`, { headers: getHeaders() });
  if (!res.ok) return null;
  const json = (await res.json()) as {
    data?: {
      id: number | string;
      attributes?: {
        status?: string;
        total?: number;
        items?: { sku: string; name: string; quantity: number; price: number }[];
      };
    };
  };
  const d = json?.data;
  if (!d) return null;
  const attrs = d.attributes || {};
  const items = Array.isArray(attrs.items) ? attrs.items : [];
  return {
    id: d.id,
    status: attrs.status ?? "pending",
    total: Number(attrs.total) ?? 0,
    order_items: items,
  };
}

/** Update order status (e.g. after PayPal capture). */
export async function updateOrderStatus(
  orderId: number | string,
  status: "pending" | "paid" | "cancelled"
): Promise<boolean> {
  if (!STRAPI_URL?.trim()) return false;
  const res = await fetch(`${STRAPI_URL}/api/orders/${orderId}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify({ data: { status } }),
  });
  return res.ok;
}
