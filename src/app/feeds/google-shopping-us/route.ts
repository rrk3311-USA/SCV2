/**
 * Google Merchant Center – USA supplemental product feed (RSS 2.0 + g: namespace).
 * Served at /feeds/google-shopping-us – use as SUPPLEMENTAL data source in Merchant Center.
 *
 * Adds US-specific data on top of the international primary feed:
 *  - feed_label=US (maps to United States target country)
 *  - Shipping: free standard + $15 express
 *  - Currency: USD (matching US target)
 *
 * In Merchant Center: Data sources → Add supplemental → URL → /feeds/google-shopping-us
 */

import { NextResponse } from "next/server";
import { buildGoogleShoppingFeedXmlUS } from "@/lib/google-shopping-feed";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const xml = buildGoogleShoppingFeedXmlUS();

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
