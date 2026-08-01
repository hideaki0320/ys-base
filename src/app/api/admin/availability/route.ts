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
    .select("date, slot_hour, is_available, reason")
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
  const supabase = getSupabase();

  // Batch mode: dates[] × slot_hours[]
  if (Array.isArray(body.dates) && Array.isArray(body.slot_hours)) {
    const { dates, slot_hours, is_available, reason } = body as {
      dates: string[];
      slot_hours: number[];
      is_available: boolean;
      reason?: string;
    };

    let affected = 0;

    if (is_available) {
      for (const date of dates) {
        await supabase
          .from("ysbase_slot_availability")
          .delete()
          .eq("date", date)
          .in("slot_hour", slot_hours);
      }
      affected = dates.length * slot_hours.length;
    } else {
      const rows = dates.flatMap((date) =>
        slot_hours.map((slot_hour) => ({
          date,
          slot_hour,
          is_available: false,
          reason: reason || null,
        }))
      );

      const { error } = await supabase
        .from("ysbase_slot_availability")
        .upsert(rows, { onConflict: "date,slot_hour" });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      affected = rows.length;
    }

    return NextResponse.json({ ok: true, affected });
  }

  // Single mode: date × slot_hour (backward compatible)
  const { date, slot_hour, is_available, reason } = body as {
    date: string;
    slot_hour: number;
    is_available: boolean;
    reason?: string;
  };

  if (!date || slot_hour === undefined || is_available === undefined) {
    return NextResponse.json({ error: "date, slot_hour, is_available required" }, { status: 400 });
  }

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
        { date, slot_hour, is_available: false, reason: reason || null },
        { onConflict: "date,slot_hour" }
      );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
