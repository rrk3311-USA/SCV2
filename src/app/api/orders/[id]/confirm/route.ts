import { NextResponse } from "next/server";
import {
  updateOrderStatus as updateOrderStatusSupabase,
  updateOrderStatusByPocketBaseId,
  isSupabaseConfigured,
} from "@/lib/supabase";
import { updateOrderStatus as updateOrderStatusPocketBase, isPocketBaseConfigured } from "@/lib/pocketbase";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Missing order id" }, { status: 400 });

  // PB = main admin (id is PB record id)
  if (isPocketBaseConfigured()) {
    const ok = await updateOrderStatusPocketBase(id, "paid");
    if (!ok) return NextResponse.json({ error: "Failed to update order" }, { status: 502 });
    // Backup: update Supabase copy so it has the same status
    if (isSupabaseConfigured()) {
      try {
        await updateOrderStatusByPocketBaseId(id, "paid");
      } catch {
        // Non-fatal: PB is main; Supabase is backup
      }
    }
    return NextResponse.json({ success: true });
  }

  // Fallback: only Supabase configured (id would be numeric)
  if (isSupabaseConfigured()) {
    const numId = parseInt(id, 10);
    if (!Number.isNaN(numId)) {
      const ok = await updateOrderStatusSupabase(numId, "paid");
      if (ok) return NextResponse.json({ success: true });
    }
  }

  return NextResponse.json({ error: "Backend not configured" }, { status: 503 });
}
