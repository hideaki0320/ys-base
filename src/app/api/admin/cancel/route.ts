import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

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

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  const key = authHeader?.replace("Bearer ", "");

  if (!key || key !== process.env.ADMIN_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { reservationId, refund } = body as {
    reservationId: string;
    refund: boolean;
  };

  if (!reservationId) {
    return NextResponse.json({ error: "reservationId required" }, { status: 400 });
  }

  const supabase = getSupabase();

  const { data: reservation, error: fetchError } = await supabase
    .from("ysbase_reservations")
    .select("*")
    .eq("id", reservationId)
    .single();

  if (fetchError || !reservation) {
    return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
  }

  if (reservation.status === "cancelled") {
    return NextResponse.json({ error: "Already cancelled" }, { status: 400 });
  }

  let refundResult: { id: string; amount: number; status: string | null } | null = null;
  let alreadyRefunded = false;

  // 金額を指定しないので、決済の残額すべてを返金する（同じ決済の他の枠の分も含む）
  if (refund === true && reservation.stripe_payment_intent_id) {
    try {
      const stripe = getStripe();
      const refundObj = await stripe.refunds.create(
        { payment_intent: reservation.stripe_payment_intent_id },
        { idempotencyKey: `ysbase-admin-cancel-${reservationId}` }
      );
      if (refundObj.status === "failed" || refundObj.status === "canceled") {
        return NextResponse.json(
          { error: `返金が ${refundObj.status} になったためキャンセルしていません。Stripe で確認してください` },
          { status: 500 }
        );
      }
      refundResult = {
        id: refundObj.id,
        amount: refundObj.amount,
        status: refundObj.status,
      };
    } catch (err) {
      if ((err as { code?: string }).code === "charge_already_refunded") {
        alreadyRefunded = true;
      } else {
        console.error("[admin/cancel] Stripe refund failed:", err);
        return NextResponse.json(
          { error: "Stripe refund failed: " + (err instanceof Error ? err.message : "unknown") },
          { status: 500 }
        );
      }
    }
  }

  const { data: updated, error: updateError } = await supabase
    .from("ysbase_reservations")
    .update({
      status: "cancelled",
      cancel_reason: refund === true ? "管理画面キャンセル（全額返金）" : "管理画面キャンセル（返金なし）",
      refund_id: refundResult?.id ?? null,
    })
    .eq("id", reservationId)
    .select("id");

  if (updateError || !updated?.length) {
    return NextResponse.json(
      {
        error:
          (refundResult ? "返金は完了しましたが、" : "") +
          `予約のキャンセル更新に失敗しました: ${updateError?.message || "0件"}`,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, refund: refundResult, alreadyRefunded });
}
