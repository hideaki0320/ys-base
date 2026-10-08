import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import { sendMail } from "@/lib/mail";
import { fillRainTemplate } from "@/lib/reservation-mail";

/**
 * 雨天中止: 指定日の予約を決済単位（Stripe セッション）でキャンセル＋全額返金し、
 * 任意でお客様へメール（5分後の予約送信。送信前なら undo-mail で取り消せる）、
 * 任意でその日の全枠を予約停止にする。
 */

const MAIL_DELAY_MS = 5 * 60 * 1000;
const ALL_HOURS = Array.from({ length: 12 }, (_, i) => i + 9); // 9〜20時
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const REASON = "雨天中止";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );
}

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-07-29.dahlia",
  });
}

function authorize(request: Request): boolean {
  const authHeader = request.headers.get("authorization");
  const key = authHeader?.replace("Bearer ", "");
  return !!key && key === process.env.ADMIN_API_KEY;
}

/** 指定日の予約（確定済み＋この日に雨天中止したもの）を返す */
export async function GET(request: Request) {
  if (!authorize(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const date = new URL(request.url).searchParams.get("date");
  if (!date || !DATE_RE.test(date)) {
    return NextResponse.json({ error: "date (YYYY-MM-DD) required" }, { status: 400 });
  }

  const { data, error } = await getSupabase()
    .from("ysbase_reservations")
    .select("*")
    .eq("reservation_date", date)
    .or(`status.eq.confirmed,cancel_reason.eq.${REASON}`)
    .order("slot_hour", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ reservations: data || [] });
}

interface ExecuteBody {
  date?: string;
  sessionIds?: string[];
  closeAllSlots?: boolean;
  mail?: { send?: boolean; subject?: string; body?: string; sessionIds?: string[] };
}

interface SessionResult {
  sessionId: string;
  customerName: string;
  refunded: boolean;
  refundAmount: number | null;
  cancelled: boolean;
  mailId: string | null;
  mailScheduledAt: string | null;
  error: string | null;
}

export async function POST(request: Request) {
  if (!authorize(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: ExecuteBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }

  const { date, sessionIds, closeAllSlots, mail } = body;
  if (!date || !DATE_RE.test(date) || !Array.isArray(sessionIds) || sessionIds.length === 0) {
    return NextResponse.json({ error: "date and sessionIds required" }, { status: 400 });
  }
  const sendMailEnabled = !!mail?.send;
  if (sendMailEnabled && (!mail?.subject?.trim() || !mail?.body?.trim())) {
    return NextResponse.json({ error: "メールの件名と本文を入力してください" }, { status: 400 });
  }
  if (sessionIds.length > 50 || sessionIds.some((s) => typeof s !== "string" || !s.startsWith("cs_"))) {
    return NextResponse.json({ error: "sessionIds が不正です（1回50件まで）" }, { status: 400 });
  }
  const mailTargets = new Set(mail?.sessionIds || []);

  const supabase = getSupabase();
  const stripe = getStripe();
  const results: SessionResult[] = [];

  // 0. 先に全枠を停止する（キャンセル処理中に空いた枠へ新しい予約が入らないように）
  let slotsClosed = false;
  let slotsError: string | null = null;
  if (closeAllSlots) {
    const { error } = await supabase.from("ysbase_slot_availability").upsert(
      ALL_HOURS.map((slot_hour) => ({ date, slot_hour, is_available: false, reason: REASON })),
      { onConflict: "date,slot_hour" }
    );
    if (error) slotsError = error.message;
    else slotsClosed = true;
  }

  for (const sessionId of sessionIds) {
    const result: SessionResult = {
      sessionId,
      customerName: "",
      refunded: false,
      refundAmount: null,
      cancelled: false,
      mailId: null,
      mailScheduledAt: null,
      error: null,
    };
    results.push(result);

    const { data: rows, error: fetchError } = await supabase
      .from("ysbase_reservations")
      .select("*")
      .eq("stripe_session_id", sessionId)
      .eq("reservation_date", date)
      .eq("status", "confirmed");
    if (fetchError || !rows || rows.length === 0) {
      result.error = fetchError?.message || "対象の確定済み予約がありません（既にキャンセル済みの可能性があります）";
      continue;
    }
    result.customerName = rows[0].customer_name;

    // 1. 返金（金額を指定しないと決済の残額すべてを返金する）
    let refundId: string | null = null;
    const paymentIntent = rows[0].stripe_payment_intent_id as string | null;
    if (paymentIntent) {
      try {
        // 同じ決済に「返金なしでキャンセル」した枠（キャンセル料として保持）があれば、
        // その分まで返金しないよう、今回の対象枠の支払額だけを返金する。無ければ残額すべてを返金する
        const { count: keptCount } = await supabase
          .from("ysbase_reservations")
          .select("id", { count: "exact", head: true })
          .eq("stripe_session_id", sessionId)
          .eq("cancel_reason", "管理画面キャンセル（返金なし）");
        const targetAmount = rows.reduce(
          (sum, r) => sum + (r.total_price ?? 0) - (r.discount_amount ?? 0),
          0
        );
        const refund = await stripe.refunds.create(
          {
            payment_intent: paymentIntent,
            reason: "requested_by_customer",
            ...((keptCount ?? 0) > 0 ? { amount: targetAmount } : {}),
          },
          { idempotencyKey: `ysbase-rain-${sessionId}` }
        );
        if (refund.status === "failed" || refund.status === "canceled") {
          result.error = `返金が ${refund.status} になったためキャンセルしていません。Stripe で確認してください`;
          continue;
        }
        refundId = refund.id;
        result.refunded = true;
        result.refundAmount = refund.amount;
      } catch (err) {
        const code = (err as { code?: string }).code;
        if (code === "charge_already_refunded") {
          result.refunded = true;
        } else {
          result.error = `返金に失敗したためキャンセルしていません: ${err instanceof Error ? err.message : String(err)}`;
          continue;
        }
      }
    } else {
      result.error = "決済情報（payment_intent）が無いため返金していません。Stripe で確認してください";
      continue;
    }

    // 2. キャンセル
    const { data: updated, error: updateError } = await supabase
      .from("ysbase_reservations")
      .update({ status: "cancelled", cancel_reason: REASON, refund_id: refundId })
      .eq("stripe_session_id", sessionId)
      .eq("reservation_date", date)
      .eq("status", "confirmed")
      .select("id");
    if (updateError || !updated?.length) {
      result.error = `返金は完了しましたが、予約のキャンセル更新に失敗しました: ${updateError?.message || "0件"}`;
      continue;
    }
    result.cancelled = true;

    // 3. お客様へのメール（5分後に送信。送信前なら取り消せる）
    if (sendMailEnabled && mailTargets.has(sessionId)) {
      const to = rows[0].customer_email as string;
      const scheduledAt = new Date(Date.now() + MAIL_DELAY_MS).toISOString();
      const sent = await sendMail({
        to: [to],
        subject: fillRainTemplate(mail!.subject!, rows),
        text: fillRainTemplate(mail!.body!, rows),
        scheduledAt,
        idempotencyKey: `ysbase-rain-mail-${sessionId}`,
      });
      const mailUpdate = sent.id
        ? { cancel_mail_id: sent.id, cancel_mail_scheduled_at: scheduledAt, cancel_mail_error: null }
        : { cancel_mail_error: sent.error };
      if (sent.id) {
        result.mailId = sent.id;
        result.mailScheduledAt = scheduledAt;
      } else {
        result.error = `キャンセル・返金は完了しましたが、メールの予約に失敗しました: ${sent.error}`;
      }
      const { error: mailUpdateError } = await supabase
        .from("ysbase_reservations")
        .update(mailUpdate)
        .eq("stripe_session_id", sessionId)
        .eq("reservation_date", date);
      if (mailUpdateError) {
        result.error = `メールの送信予約は完了しましたが、記録に失敗しました（この画面からは取り消せません）: ${mailUpdateError.message}`;
      }
    }
  }

  return NextResponse.json({ results, slotsClosed, slotsError });
}
