/**
 * Google Merchant Center / Google Shopping product feed (RSS 2.0 + g: namespace).
 * Served at /api/feeds/google-shopping – use this URL in Merchant Center if /feeds/google-shopping returns 404.
 */

import { NextResponse } from "next/server";
import { buildGoogleShoppingFeedXml } from "@/lib/google-shopping-feed";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const xml = buildGoogleShoppingFeedXml();

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
