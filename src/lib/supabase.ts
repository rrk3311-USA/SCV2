/**
 * Supabase server client for orders (alternative to Directus).
 * Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in env.
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient | null {
  if (!SUPABASE_URL?.trim() || !SUPABASE_SERVICE_ROLE_KEY?.trim()) return null;
  if (!_client) {
    _client = createClient(SUPABASE_URL.trim(), SUPABASE_SERVICE_ROLE_KEY.trim(), {
      auth: { persistSession: false },
    });
  }
  return _client;
}

export type SupabaseOrder = {
  id?: number;
  status: "pending" | "paid" | "cancelled";
  total: number;
  currency?: string;
  date_created?: string;
  paypal_order_id?: string;
  pocketbase_order_id?: string;
};

export type SupabaseOrderItem = {
  id?: number;
  order_id?: number;
  sku: string;
  name: string;
  quantity: number;
  price: number;
};

export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL?.trim() && SUPABASE_SERVICE_ROLE_KEY?.trim());
}

/** Create an order and its line items in Supabase (backup copy). Optionally link to PB order via pocketbase_order_id. */
export async function createOrder(
  total: number,
  items: { sku: string; name: string; quantity: number; price: number }[],
  options?: { paypal_order_id?: string; pocketbase_order_id?: string }
): Promise<{ id: number } | null> {
  const db = getClient();
  if (!db) return null;

  const { data: order, error: orderError } = await db
    .from("orders")
    .insert({
      status: "pending",
      total: Math.round(total * 100) / 100,
      currency: "USD",
      ...(options?.paypal_order_id && { paypal_order_id: options.paypal_order_id }),
      ...(options?.pocketbase_order_id && { pocketbase_order_id: options.pocketbase_order_id }),
    })
    .select("id")
    .single();

  if (orderError || !order?.id) {
    throw new Error(`Supabase order create failed: ${orderError?.message ?? "no id"}`);
  }

  const orderId = typeof order.id === "string" ? parseInt(order.id, 10) : Number(order.id);
  if (items.length > 0) {
    const rows = items.map((item) => ({
      order_id: orderId,
      sku: item.sku,
      name: item.name,
      quantity: item.quantity,
      price: Math.round(item.price * 100) / 100,
    }));
    const { error: itemsError } = await db.from("order_items").insert(rows);
    if (itemsError) throw new Error(`Supabase order_items create failed: ${itemsError.message}`);
  }

  return { id: orderId };
}

/** Get a single order by id with items (includes pocketbase_order_id for mirroring). */
export async function getOrder(orderId: string | number): Promise<{
  id: number;
  status: string;
  total: number;
  currency?: string;
  pocketbase_order_id?: string | null;
  order_items?: SupabaseOrderItem[];
} | null> {
  const db = getClient();
  if (!db) return null;
  const id = typeof orderId === "string" ? parseInt(orderId, 10) : orderId;
  if (Number.isNaN(id)) return null;

  const { data: order, error: orderError } = await db
    .from("orders")
    .select("*")
    .eq("id", id)
    .single();

  if (orderError || !order) return null;

  const { data: orderItems } = await db
    .from("order_items")
    .select("*")
    .eq("order_id", id);

  return {
    id: order.id,
    status: order.status,
    total: order.total,
    currency: order.currency,
    pocketbase_order_id: order.pocketbase_order_id ?? undefined,
    order_items: orderItems ?? [],
  };
}

/** Set PocketBase order id on a Supabase order (for mirror so PB Admin shows it). */
export async function setPocketBaseOrderId(
  supabaseOrderId: number,
  pocketbaseOrderId: string
): Promise<boolean> {
  const db = getClient();
  if (!db) return false;
  const { error } = await db
    .from("orders")
    .update({ pocketbase_order_id: pocketbaseOrderId })
    .eq("id", supabaseOrderId);
  return !error;
}

/** Update order status by Supabase id. */
export async function updateOrderStatus(
  orderId: number,
  status: "pending" | "paid" | "cancelled"
): Promise<boolean> {
  const db = getClient();
  if (!db) return false;
  const { error } = await db.from("orders").update({ status }).eq("id", orderId);
  return !error;
}

/** Update backup order status by PocketBase order id (so backup stays in sync when PB is main). */
export async function updateOrderStatusByPocketBaseId(
  pocketbaseOrderId: string,
  status: "pending" | "paid" | "cancelled"
): Promise<boolean> {
  const db = getClient();
  if (!db) return false;
  const { error } = await db
    .from("orders")
    .update({ status })
    .eq("pocketbase_order_id", pocketbaseOrderId);
  return !error;
}

/** Product row from Supabase products table (full copy for store, feeds, schema.org; not all fields are public-facing). */
type SupabaseProductRow = {
  slug: string;
  sku: string;
  name: string;
  price: number;
  category: string | null;
  short_description: string | null;
  description: string | null;
  suggested_use: string | null;
  supplement_facts: string | null;
  ingredients: string | null;
  upc: string | null;
  gtin: string | null;
  weight: string | null;
  dimensions: string | null;
  key_search_terms: string | null;
  faqs: { question: string; answer: string }[] | null;
  image: string | null;
  images: string[] | null;
  sort_order: number | null;
};

type MappedProduct = {
  slug: string;
  sku: string;
  name: string;
  price: number;
  category: string;
  short_description?: string;
  description?: string;
  suggested_use?: string;
  supplement_facts?: string;
  ingredients?: string;
  upc?: string;
  gtin?: string;
  weight?: string;
  dimensions?: string;
  key_search_terms?: string;
  faqs?: { question: string; answer: string }[];
  image: string;
  images: string[];
};

/** Map a Supabase products row to store Product shape. */
function mapProductRow(row: SupabaseProductRow): MappedProduct {
  const images = Array.isArray(row.images) ? row.images : [];
  const image = row.image?.trim() || images[0] || "/images/placeholder.png";
  const faqs = Array.isArray(row.faqs) ? row.faqs : [];
  return {
    slug: row.slug,
    sku: row.sku,
    name: row.name,
    price: Number(row.price),
    category: row.category ?? "Best Seller",
    short_description: row.short_description ?? undefined,
    description: row.description ?? undefined,
    suggested_use: row.suggested_use ?? undefined,
    supplement_facts: row.supplement_facts ?? undefined,
    ingredients: row.ingredients ?? undefined,
    upc: row.upc ?? undefined,
    gtin: row.gtin ?? undefined,
    weight: row.weight ?? undefined,
    dimensions: row.dimensions ?? undefined,
    key_search_terms: row.key_search_terms ?? undefined,
    faqs: faqs.length ? faqs : undefined,
    image,
    images: images.length ? images : [image],
  };
}

const PRODUCTS_SELECT = "slug, sku, name, price, category, short_description, description, suggested_use, supplement_facts, ingredients, upc, gtin, weight, dimensions, key_search_terms, faqs, image, images, sort_order";

/** Get all products from Supabase, ordered by sort_order then id. Returns null if not configured or table missing. */
export async function getProductsFromSupabase(): Promise<MappedProduct[] | null> {
  const db = getClient();
  if (!db) return null;
  const { data, error } = await db
    .from("products")
    .select(PRODUCTS_SELECT)
    .order("sort_order", { ascending: true })
    .order("id", { ascending: true });
  if (error || !data?.length) return null;
  return data.map((row) => mapProductRow(row as SupabaseProductRow));
}

/** Get one product by slug from Supabase. Returns null if not found or not configured. */
export async function getProductBySlugFromSupabase(slug: string): Promise<MappedProduct | null> {
  const db = getClient();
  if (!db) return null;
  const { data, error } = await db
    .from("products")
    .select(PRODUCTS_SELECT)
    .eq("slug", slug)
    .single();
  if (error || !data) return null;
  return mapProductRow(data as SupabaseProductRow);
}
