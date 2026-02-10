/**
 * Sync all products from the built-in catalog (TOP_PRODUCTS + overlays) into
 * Directus `products` collection so they show in the admin at your Directus URL.
 *
 * Prerequisites:
 * Run setup-directus-collections.ts first so the "products" collection exists in Directus (v3).
 * Give your static token permission to create/read/update "products" items.
 *
 * Run from project directory with Directus env set in .env.local (e.g. v3 URL):
 *   npx tsx scripts/sync-products-to-directus.ts
 *
 * Or: DIRECTUS_URL=https://scv3-directus-admin.fly.dev DIRECTUS_STATIC_TOKEN=your-token npx tsx scripts/sync-products-to-directus.ts
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
  console.error("  Example: DIRECTUS_URL=https://scv3-directus-admin.fly.dev");
  process.exit(1);
}

function getHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${DIRECTUS_TOKEN}`,
  };
}

async function getExistingBySlug(slug: string): Promise<{ id: number } | null> {
  const res = await fetch(
    `${DIRECTUS_URL}/items/products?filter[slug][_eq]=${encodeURIComponent(slug)}&fields=id`,
    { headers: getHeaders() }
  );
  if (!res.ok) return null;
  const json = (await res.json()) as { data?: { id: number }[] };
  const list = json.data;
  if (!Array.isArray(list) || list.length === 0) return null;
  return { id: list[0].id };
}

async function createProduct(payload: Record<string, unknown>): Promise<void> {
  const res = await fetch(`${DIRECTUS_URL}/items/products`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Directus create failed: ${res.status} ${text}`);
  }
}

async function updateProduct(id: number, payload: Record<string, unknown>): Promise<void> {
  const res = await fetch(`${DIRECTUS_URL}/items/products/${id}`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Directus update failed: ${res.status} ${text}`);
  }
}

async function main() {
  const { getStoreProductsSortedByBestSellers, getProductBySlug } = await import("../src/data/products");
  const ordered = getStoreProductsSortedByBestSellers();
  if (!ordered?.length) {
    console.error("No products from catalog.");
    process.exit(1);
  }

  const products: Array<NonNullable<ReturnType<typeof getProductBySlug>>> = [];
  for (const p of ordered) {
    const q = getProductBySlug(p.slug);
    if (q) products.push(q);
  }
  if (!products.length) {
    console.error("No products resolved.");
    process.exit(1);
  }

  let created = 0;
  let updated = 0;

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const payload = {
      slug: p.slug,
      sku: p.sku,
      name: p.name,
      price: p.price,
      category: p.category || "Best Seller",
      short_description: p.short_description ?? null,
      description: p.description ?? null,
      image: p.image ?? null,
      images: Array.isArray(p.images) && p.images.length ? p.images : null,
      sort_order: i,
    };

    const existing = await getExistingBySlug(p.slug);
    if (existing) {
      await updateProduct(existing.id, payload);
      updated++;
    } else {
      await createProduct(payload);
      created++;
    }
  }

  console.log(`Sync done: ${created} created, ${updated} updated (${products.length} total).`);
  console.log(`Open ${DIRECTUS_URL} → Content → products to see them.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
