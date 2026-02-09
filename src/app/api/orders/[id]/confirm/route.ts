import { NextResponse } from "next/server";
import { updateOrderStatus } from "@/lib/directus";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Missing order id" }, { status: 400 });
  const orderId = parseInt(id, 10);
  if (Number.isNaN(orderId)) return NextResponse.json({ error: "Invalid order id" }, { status: 400 });
  const ok = await updateOrderStatus(orderId, "paid");
  if (!ok) return NextResponse.json({ error: "Failed to update order" }, { status: 502 });
  return NextResponse.json({ success: true });
}
