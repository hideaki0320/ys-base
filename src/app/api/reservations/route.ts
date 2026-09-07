import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const MONTH_RE = /^\d{4}-\d{2}$/;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  const month = searchParams.get("month");

  if (month) {
    return getMonthStatus(month);
  }

  if (!date || !DATE_RE.test(date)) {
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

/**
 * 月単位の予約済み・休止枡を返す（カレンダーで満枠日をグレーアウトするため）
 * レスポンス: { unavailable: { "YYYY-MM-DD": [hour, ...] } }
 */
async function getMonthStatus(month: string) {
  if (!MONTH_RE.test(month)) {
    return NextResponse.json({ error: "month must be YYYY-MM" }, { status: 400 });
  }
  const [y, m] = month.split("-").map(Number);
  const lastDay = new Date(y, m, 0).getDate();
  const from = `${month}-01`;
  const to = `${month}-${String(lastDay).padStart(2, "0")}`;

  const supabase = getSupabase();
  const [reservationsResult, availabilityResult] = await Promise.all([
    supabase
      .from("ysbase_reservations")
      .select("reservation_date, slot_hour")
      .gte("reservation_date", from)
      .lte("reservation_date", to)
      .in("status", ["confirmed", "pending"]),
    supabase
      .from("ysbase_slot_availability")
      .select("date, slot_hour")
      .gte("date", from)
      .lte("date", to)
      .eq("is_available", false),
  ]);

  if (reservationsResult.error) {
    return NextResponse.json({ error: reservationsResult.error.message }, { status: 500 });
  }

  const unavailable: Record<string, number[]> = {};
  const add = (d: string, h: number) => {
    if (!unavailable[d]) unavailable[d] = [];
    if (!unavailable[d].includes(h)) unavailable[d].push(h);
  };
  for (const r of reservationsResult.data) add(r.reservation_date, r.slot_hour);
  for (const r of availabilityResult.data || []) add(r.date, r.slot_hour);

  return NextResponse.json({ unavailable });
}
