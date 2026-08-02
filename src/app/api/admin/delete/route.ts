import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );
}

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  const key = authHeader?.replace("Bearer ", "");

  if (!key || key !== process.env.ADMIN_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { reservationId } = body as { reservationId: string };

  if (!reservationId) {
    return NextResponse.json({ error: "reservationId required" }, { status: 400 });
  }

  const supabase = getSupabase();

  const { data: reservation, error: fetchError } = await supabase
    .from("ysbase_reservations")
    .select("id, status")
    .eq("id", reservationId)
    .single();

  if (fetchError || !reservation) {
    return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
  }

  if (reservation.status !== "cancelled") {
    return NextResponse.json({ error: "キャンセル済みの予約のみ削除できます" }, { status: 400 });
  }

  const { error: deleteError } = await supabase
    .from("ysbase_reservations")
    .delete()
    .eq("id", reservationId);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
