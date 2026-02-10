import { NextResponse } from "next/server";
import { getOrder as getOrderPocketBase, isPocketBaseConfigured } from "@/lib/pocketbase";
import { getOrder as getOrderSupabase, isSupabaseConfigured } from "@/lib/supabase";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Missing order id" }, { status: 400 });
  // PB = main admin (id is PB record id)
  const order = isPocketBaseConfigured()
    ? await getOrderPocketBase(id)
    : isSupabaseConfigured()
      ? await getOrderSupabase(id)
      : null;
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  return NextResponse.json(order);
}
