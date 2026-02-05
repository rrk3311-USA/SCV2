/**
 * Medusa checkout: create cart, add line items (SKU → variant_id via handle/slug), initiate PayPal.
 * No Stripe – PayPal only. Returns cart id and payment session redirect URL for client redirect.
 */
import { NextResponse } from "next/server";
import { sdk } from "@/lib/sdk";
import { getProductBySku } from "@/data/products";

const PAYPAL_PROVIDER_PREFIX = "pp_"; // e.g. pp_paypal_paypal

type CartLine = { sku: string; quantity: number; optionLabel?: string; isSubscription?: boolean };

function parseBody(body: unknown): CartLine[] | null {
  if (!body || typeof body !== "object" || !Array.isArray((body as { items?: unknown }).items))
    return null;
  const items = (body as { items: unknown[] }).items;
  const out: CartLine[] = [];
  for (const it of items) {
    if (it && typeof it === "object" && typeof (it as CartLine).sku === "string") {
      const sku = (it as CartLine).sku;
      const quantity = Math.max(1, Math.min(999, Number((it as CartLine).quantity) || 1));
      out.push({
        sku,
        quantity,
        optionLabel: typeof (it as CartLine).optionLabel === "string" ? (it as CartLine).optionLabel : undefined,
        isSubscription: Boolean((it as CartLine).isSubscription),
      });
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

    const baseUrl = process.env.NEXT_PUBLIC_MEDUSA_URL || "http://localhost:9000";
    if (!baseUrl || baseUrl === "http://localhost:9000") {
      return NextResponse.json(
        { error: "Medusa backend not configured (NEXT_PUBLIC_MEDUSA_URL)" },
        { status: 503 }
      );
    }

    const { regions } = await sdk.store.region.list({ limit: 1 });
    const region = regions?.[0];
    if (!region?.id) {
      return NextResponse.json({ error: "No Medusa region found" }, { status: 503 });
    }

    const { cart: newCart } = await sdk.store.cart.create(
      { region_id: region.id },
      { fields: "id,*items,*payment_collection,*payment_collection.payment_sessions" }
    );
    if (!newCart?.id) {
      return NextResponse.json({ error: "Failed to create Medusa cart" }, { status: 502 });
    }

    const allProducts: { id: string; handle: string | null; variants?: { id: string; sku?: string | null }[] }[] = [];
    let offset = 0;
    const limit = 100;
    for (;;) {
      const { products } = await sdk.store.product.list({
        limit,
        offset,
        fields: "id,handle,*variants",
      });
      const list = (products ?? []) as { id: string; handle: string | null; variants?: { id: string; sku?: string | null }[] }[];
      allProducts.push(...list);
      if (list.length < limit) break;
      offset += limit;
    }

    const slugToVariantId = new Map<string, string>();
    const skuToVariantId = new Map<string, string>();
    for (const p of allProducts) {
      const handle = p.handle ?? p.id;
      const variants = p.variants ?? [];
      const firstVariantId = variants[0]?.id;
      if (firstVariantId) {
        slugToVariantId.set(handle, firstVariantId);
        for (const v of variants) {
          if (v.sku) skuToVariantId.set(v.sku, v.id);
        }
      }
    }

    for (const line of lines) {
      const variantId =
        skuToVariantId.get(line.sku) ??
        slugToVariantId.get(getProductBySku(line.sku)?.slug ?? line.sku);
      if (!variantId) {
        return NextResponse.json(
          { error: `Product not found in Medusa: ${line.sku}` },
          { status: 400 }
        );
      }
      await sdk.store.cart.createLineItem(
        newCart.id,
        { variant_id: variantId, quantity: line.quantity },
        { fields: "id,*items,*payment_collection" }
      );
    }

    const { cart: updatedCart } = await sdk.store.cart.retrieve(newCart.id, {
      fields: "id,*items,*payment_collection,*payment_collection.payment_sessions",
    });

    const { payment_providers } = await sdk.store.payment.listPaymentProviders({
      region_id: region.id,
    });
    const paypalProvider = (payment_providers as { id: string }[] | undefined)?.find(
      (p) => p.id.toLowerCase().startsWith(PAYPAL_PROVIDER_PREFIX) || p.id.toLowerCase().includes("paypal")
    );
    if (!paypalProvider) {
      return NextResponse.json(
        { error: "PayPal not available for this region" },
        { status: 503 }
      );
    }

    const cartForPayment = updatedCart ?? newCart;
    const { payment_collection } = await sdk.store.payment.initiatePaymentSession(
      cartForPayment as Parameters<typeof sdk.store.payment.initiatePaymentSession>[0],
      { provider_id: paypalProvider.id },
      { fields: "*payment_sessions" }
    );

    const sessions = (payment_collection as { payment_sessions?: unknown[] })?.payment_sessions ?? [];
    const paypalSession = sessions.find(
      (s: { provider_id?: string }) => s?.provider_id === paypalProvider.id
    ) as { data?: { redirect_url?: string; url?: string } } | undefined;
    const redirectUrl =
      paypalSession?.data?.redirect_url ?? paypalSession?.data?.url ?? null;

    return NextResponse.json({
      cartId: updatedCart?.id ?? newCart.id,
      redirectUrl,
      paymentCollectionId: (payment_collection as { id?: string })?.id,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Checkout failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
