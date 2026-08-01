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

  const supabase = getSupabase();

  const [reservationsResult, availabilityResult] = await Promise.all([
    supabase
      .from("ysbase_reservations")
      .select("slot_hour, status")
      .eq("reservation_date", date)
      .in("status", ["confirmed", "pending"]),
    supabase
      .from("ysbase_slot_availability")
      .select("slot_hour, is_available")
      .eq("date", date)
      .eq("is_available", false),
  ]);

  if (reservationsResult.error) {
    return NextResponse.json({ error: reservationsResult.error.message }, { status: 500 });
  }

  const bookedSlots = reservationsResult.data.map((r) => r.slot_hour);
  const closedSlots = (availabilityResult.data || []).map((r) => r.slot_hour);

  return NextResponse.json({ bookedSlots, closedSlots });
}
