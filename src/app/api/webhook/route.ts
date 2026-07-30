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
  console.log("[webhook] POST received");
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    console.log("[webhook] No signature header");
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
    console.error("[webhook] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  console.log("[webhook] Event verified:", event.type, event.id);
  const supabase = getSupabase();

  const { error: dupError } = await supabase
    .from("processed_stripe_events")
    .insert({ event_id: event.id });
  if (dupError) {
    console.error("[webhook] processed_stripe_events insert error:", JSON.stringify(dupError));
    return NextResponse.json({ received: true });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const meta = session.metadata || {};
    console.log("[webhook] checkout.session.completed, metadata:", JSON.stringify(meta));

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

      const { error: insertError } = await supabase.from("ysbase_reservations").insert(reservations);
      if (insertError) {
        console.error("[webhook] Insert failed:", insertError);
      } else {
        console.log("[webhook] Reservations created:", reservations.length);
      }
    } else {
      console.log("[webhook] Missing metadata (date/slots)");
    }
  }

  return NextResponse.json({ received: true });
}
