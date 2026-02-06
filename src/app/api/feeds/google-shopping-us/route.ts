/**
 * Google Merchant Center – USA supplemental feed (fallback route).
 * Served at /api/feeds/google-shopping-us – use if /feeds/google-shopping-us returns 404.
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
