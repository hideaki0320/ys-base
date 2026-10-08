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

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }
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

  // この枠の支払額（利用料金 - 割引）だけを返金する。同じ決済の他の枠には影響させない
  if (refund === true && reservation.stripe_payment_intent_id) {
    const slotAmount = (reservation.total_price ?? 0) - (reservation.discount_amount ?? 0);
    try {
      const stripe = getStripe();
      // Stripe 画面で一部返金済みの決済は、ここから返金すると金額がずれるので受け付けない
      const pi = await stripe.paymentIntents.retrieve(reservation.stripe_payment_intent_id, {
        expand: ["latest_charge"],
      });
      const charge = pi.latest_charge as Stripe.Charge | null;
      const refundedSoFar = charge?.amount_refunded ?? 0;

      // この画面から返金した分（同じ決済の他の枠）の合計。これと Stripe の返金済み額が違えば、
      // Stripe の画面で手動返金されているので、二重返金を避けるため受け付けない
      let refundedByAdmin = 0;
      if (reservation.stripe_session_id) {
        const { data: siblings, error: siblingsError } = await supabase
          .from("ysbase_reservations")
          .select("total_price, discount_amount")
          .eq("stripe_session_id", reservation.stripe_session_id)
          .eq("cancel_reason", "管理画面キャンセル（全額返金）")
          .not("refund_id", "is", null);
        if (siblingsError) {
          return NextResponse.json({ error: "返金履歴を確認できませんでした" }, { status: 500 });
        }
        refundedByAdmin = (siblings || []).reduce(
          (sum, r) => sum + (r.total_price ?? 0) - (r.discount_amount ?? 0),
          0
        );
      }
      if (refundedSoFar !== refundedByAdmin) {
        return NextResponse.json(
          {
            error: `この決済は Stripe の画面で ¥${(refundedSoFar - refundedByAdmin).toLocaleString()} 返金されています。二重返金を避けるため、ここからは返金できません。必要なら「返金なしでキャンセル」を使ってください`,
          },
          { status: 409 }
        );
      }
      // 同じ決済で有効な枠がこの1枠だけなら、割引按分の端数ずれを吸収するため残額すべてを返金する
      let refundAmount = slotAmount;
      if (charge && reservation.stripe_session_id) {
        const { count: activeCount } = await supabase
          .from("ysbase_reservations")
          .select("id", { count: "exact", head: true })
          .eq("stripe_session_id", reservation.stripe_session_id)
          .neq("status", "cancelled");
        if (activeCount === 1) refundAmount = charge.amount - refundedSoFar;
      }
      if (charge && refundAmount > charge.amount - refundedSoFar) {
        return NextResponse.json({ error: "返金額が決済の残額を超えるため返金できません。Stripe の画面で確認してください" }, { status: 409 });
      }
      if (refundAmount <= 0) {
        return NextResponse.json({ error: "この枠の支払額が 0 円のため返金できません。「返金なしでキャンセル」を使ってください" }, { status: 400 });
      }
      const refundObj = await stripe.refunds.create(
        { payment_intent: reservation.stripe_payment_intent_id, amount: refundAmount },
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
          { error: "Stripe での返金に失敗したため、キャンセルしていません。Stripe の画面で決済の状態を確認してください" },
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
    .neq("status", "cancelled")
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
