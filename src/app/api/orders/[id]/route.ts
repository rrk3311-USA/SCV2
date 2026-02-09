import { NextResponse } from "next/server";
import { getOrder } from "@/lib/directus";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Missing order id" }, { status: 400 });
  const order = await getOrder(id);
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  return NextResponse.json(order);
}
