import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const key = authHeader?.replace("Bearer ", "");

  if (!key || key !== process.env.ADMIN_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  let query = getSupabase()
    .from("ysbase_reservations")
    .select("*")
    .order("reservation_date", { ascending: false })
    .order("slot_hour", { ascending: true });

  if (status && status !== "all") {
    query = query.eq("status", status);
  }
  if (from) {
    query = query.gte("reservation_date", from);
  }
  if (to) {
    query = query.lte("reservation_date", to);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ reservations: data });
}
