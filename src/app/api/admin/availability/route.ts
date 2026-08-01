import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );
}

function authorize(request: Request): boolean {
  const authHeader = request.headers.get("authorization");
  const key = authHeader?.replace("Bearer ", "");
  return key === process.env.ADMIN_API_KEY;
}

export async function GET(request: Request) {
  if (!authorize(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (!from || !to) {
    return NextResponse.json({ error: "from and to parameters required" }, { status: 400 });
  }

  const { data, error } = await getSupabase()
    .from("ysbase_slot_availability")
    .select("date, slot_hour, is_available")
    .gte("date", from)
    .lte("date", to);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ slots: data || [] });
}

export async function POST(request: Request) {
  if (!authorize(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { date, slot_hour, is_available } = body as {
    date: string;
    slot_hour: number;
    is_available: boolean;
  };

  if (!date || slot_hour === undefined || is_available === undefined) {
    return NextResponse.json({ error: "date, slot_hour, is_available required" }, { status: 400 });
  }

  const supabase = getSupabase();

  if (is_available) {
    const { error } = await supabase
      .from("ysbase_slot_availability")
      .delete()
      .eq("date", date)
      .eq("slot_hour", slot_hour);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  } else {
    const { error } = await supabase
      .from("ysbase_slot_availability")
      .upsert(
        { date, slot_hour, is_available: false },
        { onConflict: "date,slot_hour" }
      );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
