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

async function getDiscountInfo(
  stripe: Stripe,
  session: Stripe.Checkout.Session
): Promise<{ promotionCode: string | null; discountAmount: number }> {
  const sessionAny = session as unknown as { total_details?: { amount_discount?: number } };
  const discountAmount = sessionAny.total_details?.amount_discount || 0;

  if (discountAmount === 0) {
    return { promotionCode: null, discountAmount: 0 };
  }

  let promotionCode: string | null = null;
  try {
    const retrieved = await stripe.checkout.sessions.retrieve(session.id, {
      expand: ["discounts.promotion_code"],
    });
    const discounts = (
      retrieved as unknown as { discounts?: Array<{ promotion_code?: { code?: string }; coupon?: { name?: string } }> }
    ).discounts;
    if (Array.isArray(discounts) && discounts.length > 0) {
      const d = discounts[0];
      if (d.promotion_code?.code) {
        promotionCode = d.promotion_code.code;
      } else if (d.coupon?.name) {
        promotionCode = d.coupon.name;
      }
    }
  } catch (e) {
    console.error("[webhook] Failed to retrieve promotion code:", e);
  }

  return { promotionCode, discountAmount };
}

export async function POST(request: Request) {
  console.log("[webhook] POST received");
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    console.log("[webhook] No signature header");
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  const stripe = getStripe();
  let event: Stripe.Event;
  try {
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

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const meta = session.metadata || {};
    console.log("[webhook] checkout.session.completed, metadata:", JSON.stringify(meta));

    if (meta.date && meta.slots) {
      const { error: dupError } = await supabase
        .from("processed_stripe_events")
        .insert({ event_id: `ysbase:${event.id}` });
      if (dupError) {
        if (dupError.code === "23505") {
          console.log("[webhook] Already processed:", event.id);
          return NextResponse.json({ received: true });
        }
        console.error("[webhook] processed_stripe_events insert error:", JSON.stringify(dupError));
        return NextResponse.json({ error: "DB error" }, { status: 500 });
      }

      const slots: number[] = JSON.parse(meta.slots);
      const reservationDate = new Date(meta.date + "T00:00:00");

      const { promotionCode, discountAmount } = await getDiscountInfo(stripe, session);
      if (discountAmount > 0) {
        console.log("[webhook] Discount applied:", discountAmount, "code:", promotionCode);
      }

      const subtotal = slots.reduce(
        (sum, hour) => sum + (getPrice(reservationDate, hour) ?? 0),
        0
      );

      const reservations = slots.map((hour) => {
        const slotPrice = getPrice(reservationDate, hour) ?? 0;
        const slotDiscount =
          subtotal > 0 ? Math.round(discountAmount * (slotPrice / subtotal)) : 0;

        return {
          reservation_date: meta.date,
          slot_hour: hour,
          total_price: slotPrice,
          discount_amount: slotDiscount,
          promotion_code: promotionCode,
          customer_name: meta.customerName || "",
          customer_email: session.customer_email || "",
          customer_phone: meta.customerPhone || "",
          address: meta.address || null,
          purpose: meta.purpose || null,
          notes: meta.notes || null,
          stripe_session_id: session.id,
          stripe_payment_intent_id: session.payment_intent as string,
          status: "confirmed",
        };
      });

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
