import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cancelMail } from "@/lib/mail";

/**
 * 雨天中止メール（予約送信中）の取り消し。
 * 取り消せるのはメールだけ。返金・キャンセルは取り消せない。
 */

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );
}

function authorize(request: Request): boolean {
  const authHeader = request.headers.get("authorization");
  const key = authHeader?.replace("Bearer ", "");
  return !!key && key === process.env.ADMIN_API_KEY;
}

export async function POST(request: Request) {
  if (!authorize(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { sessionIds?: string[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }
  if (!Array.isArray(body.sessionIds) || body.sessionIds.length === 0) {
    return NextResponse.json({ error: "sessionIds required" }, { status: 400 });
  }

  const supabase = getSupabase();
  const results: { sessionId: string; ok: boolean; error?: string }[] = [];

  for (const sessionId of body.sessionIds) {
    const { data: row } = await supabase
      .from("ysbase_reservations")
      .select("cancel_mail_id, cancel_mail_scheduled_at")
      .eq("stripe_session_id", sessionId)
      .not("cancel_mail_id", "is", null)
      .limit(1)
      .maybeSingle();

    if (!row?.cancel_mail_id) {
      results.push({ sessionId, ok: false, error: "取り消せるメールがありません" });
      continue;
    }
    if (row.cancel_mail_scheduled_at && new Date(row.cancel_mail_scheduled_at).getTime() <= Date.now()) {
      results.push({ sessionId, ok: false, error: "送信予定時刻を過ぎているため取り消せません" });
      continue;
    }

    const cancelled = await cancelMail(row.cancel_mail_id);
    if (!cancelled.ok) {
      results.push({ sessionId, ok: false, error: cancelled.error });
      continue;
    }
    await supabase
      .from("ysbase_reservations")
      .update({ cancel_mail_id: null, cancel_mail_scheduled_at: null, cancel_mail_error: "送信を取り消しました" })
      .eq("stripe_session_id", sessionId);
    results.push({ sessionId, ok: true });
  }

  return NextResponse.json({ results });
}
