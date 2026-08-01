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

  let refundResult = null;

  if (refund && reservation.stripe_payment_intent_id) {
    try {
      const stripe = getStripe();
      const refundObj = await stripe.refunds.create({
        payment_intent: reservation.stripe_payment_intent_id,
      });
      refundResult = {
        id: refundObj.id,
        amount: refundObj.amount,
        status: refundObj.status,
      };
    } catch (err) {
      console.error("[admin/cancel] Stripe refund failed:", err);
      return NextResponse.json(
        { error: "Stripe refund failed: " + (err instanceof Error ? err.message : "unknown") },
        { status: 500 }
      );
    }
  }

  const { error: updateError } = await supabase
    .from("ysbase_reservations")
    .update({ status: "cancelled" })
    .eq("id", reservationId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, refund: refundResult });
}
