import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  if (!date) {
    return NextResponse.json({ error: "date parameter required" }, { status: 400 });
  }

  const { data, error } = await getSupabase()
    .from("ysbase_reservations")
    .select("slot_hour, status")
    .eq("reservation_date", date)
    .in("status", ["confirmed", "pending"]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const bookedSlots = data.map((r) => r.slot_hour);
  return NextResponse.json({ bookedSlots });
}

