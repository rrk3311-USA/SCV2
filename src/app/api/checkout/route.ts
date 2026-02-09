/**
 * Checkout API route for SCV2 - creates orders and initiates PayPal payment
 * Uses Directus backend for order storage and PayPal for payment processing
 */
import { NextResponse } from "next/server";
import { getProductBySku } from "@/data/products";

type CartLine = { 
  sku: string; 
  quantity: number; 
  optionLabel?: string; 
  isSubscription?: boolean 
};

type CheckoutBody = {
  items: CartLine[];
  email?: string;
  shippingAddress?: {
    firstName?: string;
    lastName?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
};

function parseBody(body: unknown): CheckoutBody | null {
  if (!body || typeof body !== "object" || !Array.isArray((body as CheckoutBody).items))
    return null;
  
  const items = (body as CheckoutBody).items;
  const out: CartLine[] = [];
  
  for (const it of items) {
    if (it && typeof it === "object" && typeof it.sku === "string") {
      const quantity = Math.max(1, Math.min(999, Number(it.quantity) || 1));
      out.push({
        sku: it.sku,
        quantity,
        optionLabel: typeof it.optionLabel === "string" ? it.optionLabel : undefined,
        isSubscription: Boolean(it.isSubscription),
      });
    }
  }
  
  if (out.length === 0) return null;
  
  return {
    items: out,
    email: typeof (body as CheckoutBody).email === "string" ? (body as CheckoutBody).email : undefined,
    shippingAddress: (body as CheckoutBody).shippingAddress,
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const checkout = parseBody(body);
    
    if (!checkout || checkout.items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const line of checkout.items) {
      const product = getProductBySku(line.sku);
      if (!product) {
        return NextResponse.json(
          { error: `Product not found: ${line.sku}` },
          { status: 400 }
        );
      }

      let price = product.price;
      
      // Apply bundle pricing if optionLabel is provided
      if (line.optionLabel && product.bundle_options) {
        const bundleOption = product.bundle_options.find(
          (opt) => opt.label === line.optionLabel
        );
        if (bundleOption) {
          price = bundleOption.price;
        }
      }

      // Apply Subscribe & Save discount
      if (line.isSubscription && product.subscribe_save_percent) {
        price = price * (1 - product.subscribe_save_percent / 100);
      }

      const lineTotal = price * line.quantity;
      subtotal += lineTotal;

      orderItems.push({
        sku: line.sku,
        name: product.name,
        price,
        quantity: line.quantity,
        optionLabel: line.optionLabel,
        isSubscription: line.isSubscription,
        total: lineTotal,
      });
    }

    // For now, calculate simple shipping and tax
    // In production, use real shipping rates and tax API
    const shipping = subtotal >= 50 ? 0 : 7.99;
    const taxRate = 0.08; // 8% - replace with real tax calculation
    const tax = subtotal * taxRate;
    const total = subtotal + shipping + tax;

    // Create order in Directus (if backend is configured)
    let orderId = null;
    const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL;
    
    if (directusUrl) {
      try {
        const orderNumber = `SC${Date.now()}${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
        
        // This would create an order in Directus
        // For now, we'll just generate the order number
        orderId = orderNumber;
        
        // TODO: Implement Directus order creation
        // const directusToken = process.env.DIRECTUS_API_TOKEN;
        // if (directusToken) {
        //   const response = await fetch(`${directusUrl}/items/orders`, {
        //     method: 'POST',
        //     headers: {
        //       'Authorization': `Bearer ${directusToken}`,
        //       'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify({
        //       order_number: orderNumber,
        //       status: 'pending',
        //       payment_status: 'pending',
        //       payment_method: 'paypal',
        //       subtotal,
        //       tax,
        //       shipping,
        //       total,
        //       customer_email: checkout.email,
        //       shipping_address: checkout.shippingAddress,
        //     }),
        //   });
        //   const order = await response.json();
        //   orderId = order.data.id;
        // }
      } catch (error) {
        console.error('Failed to create order in Directus:', error);
        // Continue without Directus order
      }
    }

    // For PayPal integration, return checkout data
    // The frontend will handle PayPal SDK initialization
    return NextResponse.json({
      success: true,
      orderId,
      orderNumber: orderId || `SC${Date.now()}`,
      subtotal: subtotal.toFixed(2),
      shipping: shipping.toFixed(2),
      tax: tax.toFixed(2),
      total: total.toFixed(2),
      items: orderItems,
      // For PayPal, we return the data and let the frontend handle the SDK
      paymentMethod: 'paypal',
      redirectUrl: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID 
        ? null // Frontend will handle PayPal SDK
        : '/cart?error=paypal_not_configured',
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Checkout failed";
    console.error('Checkout error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
