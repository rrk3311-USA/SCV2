/**
 * Create orders, order_items, and products collections in Directus via the System API.
 * Run once so the Directus admin (e.g. scv3-directus-admin.fly.dev) shows Orders, Order Items, and Products.
 *
 * Requires an admin token (or token with "full access" / schema create).
 * Run from project root: npx tsx scripts/setup-directus-collections.ts
 *
 * Loads .env.local for DIRECTUS_URL and DIRECTUS_STATIC_TOKEN.
 */

import { readFileSync, existsSync } from "fs";
import { join } from "path";

function loadEnvLocal() {
  const cwd = process.cwd();
  for (const dir of [cwd, join(cwd, "..")]) {
    const path = join(dir, ".env.local");
    if (!existsSync(path)) continue;
    const content = readFileSync(path, "utf8");
    for (const line of content.split("\n")) {
      const idx = line.indexOf("=");
      if (idx <= 0) continue;
      const key = line.slice(0, idx).trim();
      let val = line.slice(idx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))
        val = val.slice(1, -1);
      if (key) process.env[key] = val;
    }
    return;
  }
}

loadEnvLocal();

const DIRECTUS_URL = (process.env.DIRECTUS_URL || process.env.NEXT_PUBLIC_DIRECTUS_URL || "").replace(/\/$/, "");
const DIRECTUS_TOKEN = process.env.DIRECTUS_STATIC_TOKEN || "";

if (!DIRECTUS_URL || !DIRECTUS_TOKEN) {
  console.error("Set DIRECTUS_URL and DIRECTUS_STATIC_TOKEN in .env.local or env.");
  process.exit(1);
}

const headers: HeadersInit = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${DIRECTUS_TOKEN}`,
};

async function getCollections(): Promise<{ collection: string }[]> {
  const res = await fetch(`${DIRECTUS_URL}/collections`, { headers });
  if (!res.ok) throw new Error(`GET /collections failed: ${res.status} ${await res.text()}`);
  const json = (await res.json()) as { data?: { collection: string }[] };
  return json.data ?? [];
}

async function createCollection(body: Record<string, unknown>): Promise<void> {
  const res = await fetch(`${DIRECTUS_URL}/collections`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`POST /collections failed: ${res.status} ${text}`);
  }
}

async function createField(collection: string, body: Record<string, unknown>): Promise<void> {
  const res = await fetch(`${DIRECTUS_URL}/fields/${collection}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`POST /fields/${collection} failed: ${res.status} ${text}`);
  }
}

async function createRelation(body: Record<string, unknown>): Promise<void> {
  const res = await fetch(`${DIRECTUS_URL}/relations`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`POST /relations failed: ${res.status} ${text}`);
  }
}

async function main() {
  const existing = await getCollections();
  const names = new Set((existing || []).map((c) => c.collection));

  if (names.has("orders")) {
    console.log("Collection 'orders' already exists. Skipping.");
  } else {
    console.log("Creating collection 'orders'...");
    await createCollection({ collection: "orders" });
    console.log("Adding fields to 'orders'...");
    await createField("orders", { field: "status", type: "string", schema: {}, meta: { interface: "select-dropdown", options: { choices: [{ text: "pending", value: "pending" }, { text: "paid", value: "paid" }, { text: "cancelled", value: "cancelled" }] } } });
    await createField("orders", { field: "total", type: "decimal", schema: {}, meta: { interface: "input" } });
    await createField("orders", { field: "currency", type: "string", schema: {}, meta: { interface: "input" } });
    await createField("orders", { field: "date_created", type: "timestamp", schema: {}, meta: { interface: "datetime" } });
    await createField("orders", { field: "paypal_order_id", type: "string", schema: {}, meta: { interface: "input" } });
    console.log("Created 'orders'.");
  }

  if (names.has("order_items")) {
    console.log("Collection 'order_items' already exists. Skipping.");
  } else {
    console.log("Creating collection 'order_items'...");
    await createCollection({ collection: "order_items" });
    console.log("Adding fields to 'order_items'...");
    await createField("order_items", { field: "order_id", type: "integer", schema: {}, meta: { interface: "select-dropdown-m2o", options: { related_collection: "orders", template: "{{id}}" } } });
    await createField("order_items", { field: "sku", type: "string", schema: {}, meta: { interface: "input" } });
    await createField("order_items", { field: "name", type: "string", schema: {}, meta: { interface: "input" } });
    await createField("order_items", { field: "quantity", type: "integer", schema: {}, meta: { interface: "input" } });
    await createField("order_items", { field: "price", type: "decimal", schema: {}, meta: { interface: "input" } });
    try {
      await createRelation({
        collection: "order_items",
        field: "order_id",
        related_collection: "orders",
        meta: { many_collection: "order_items", many_field: "order_id", one_collection: "orders", one_field: "order_items" },
        schema: {},
      });
      console.log("Relation order_items.order_id -> orders.id created.");
    } catch (e) {
      console.warn("Relation create failed (you may need to link in admin):", (e as Error).message);
    }
    console.log("Created 'order_items'.");
  }

  if (names.has("products")) {
    console.log("Collection 'products' already exists. Skipping.");
  } else {
    console.log("Creating collection 'products'...");
    await createCollection({ collection: "products" });
    console.log("Adding fields to 'products'...");
    await createField("products", { field: "slug", type: "string", schema: {}, meta: { interface: "input" } });
    await createField("products", { field: "sku", type: "string", schema: {}, meta: { interface: "input" } });
    await createField("products", { field: "name", type: "string", schema: {}, meta: { interface: "input" } });
    await createField("products", { field: "price", type: "decimal", schema: {}, meta: { interface: "input" } });
    await createField("products", { field: "category", type: "string", schema: {}, meta: { interface: "input" } });
    await createField("products", { field: "short_description", type: "text", schema: {}, meta: { interface: "input-multiline" } });
    await createField("products", { field: "description", type: "text", schema: {}, meta: { interface: "input-rich-text-md" } });
    await createField("products", { field: "image", type: "string", schema: {}, meta: { interface: "input" } });
    await createField("products", { field: "images", type: "json", schema: {}, meta: { interface: "input-code" } });
    await createField("products", { field: "sort_order", type: "integer", schema: {}, meta: { interface: "input" } });
    console.log("Created 'products'.");
  }

  console.log("Done. Open", DIRECTUS_URL, "→ Content to see Orders, Order Items, and Products.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
