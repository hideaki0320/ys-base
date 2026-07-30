import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { getPrice } from "@/lib/pricing";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-07-29.dahlia",
  });
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );
}

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = getSupabase();

  const { error: dupError } = await supabase
    .from("processed_stripe_events")
    .insert({ event_id: event.id });
  if (dupError) {
    return NextResponse.json({ received: true });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const meta = session.metadata || {};

    if (meta.date && meta.slots) {
      const slots: number[] = JSON.parse(meta.slots);
      const reservationDate = new Date(meta.date + "T00:00:00");
      const reservations = slots.map((hour) => ({
        reservation_date: meta.date,
        slot_hour: hour,
        total_price: getPrice(reservationDate, hour) ?? 0,
        customer_name: meta.customerName || "",
        customer_email: session.customer_email || "",
        customer_phone: meta.customerPhone || "",
        address: meta.address || null,
        purpose: meta.purpose || null,
        notes: meta.notes || null,
        stripe_session_id: session.id,
        stripe_payment_intent_id: session.payment_intent as string,
        status: "confirmed",
      }));

      await supabase.from("ysbase_reservations").insert(reservations);
    }
  }

  return NextResponse.json({ received: true });
}
