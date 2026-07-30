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
    .from("reservations")
    .select("slot_hour, status")
    .eq("reservation_date", date)
    .in("status", ["confirmed", "pending"]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const bookedSlots = data.map((r) => r.slot_hour);
  return NextResponse.json({ bookedSlots });
}

export async function POST(request: Request) {
  const body = await request.json();
  const {
    date,
    slots,
    totalPrice,
    customerName,
    customerEmail,
    customerPhone,
    teamName,
    playerCount,
    notes,
    stripeSessionId,
  } = body;

  const reservations = (slots as number[]).map((hour: number) => ({
    reservation_date: date,
    slot_hour: hour,
    total_price: totalPrice,
    customer_name: customerName,
    customer_email: customerEmail,
    customer_phone: customerPhone,
    team_name: teamName || null,
    player_count: playerCount || null,
    notes: notes || null,
    stripe_session_id: stripeSessionId || null,
    status: stripeSessionId ? "confirmed" : "pending",
  }));

  const { data, error } = await getSupabase()
    .from("reservations")
    .insert(reservations)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ reservations: data });
}
