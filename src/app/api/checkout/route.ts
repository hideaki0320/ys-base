import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getPrice } from "@/lib/pricing";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-07-29.dahlia",
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { date, slots, customerName, customerEmail, customerPhone, address, purpose, notes } = body;

    const reservationDate = new Date(date + "T00:00:00");
    const serverTotal = (slots as number[]).reduce((sum: number, hour: number) => {
      const p = getPrice(reservationDate, hour);
      if (p === null) throw new Error(`invalid slot: ${hour}`);
      return sum + p;
    }, 0);

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: customerEmail,
      line_items: [
        {
          price_data: {
            currency: "jpy",
            product_data: {
              name: `YS-BASE コート予約`,
              description: `${date} ${slots.join("、")}`,
            },
            unit_amount: serverTotal,
          },
          quantity: 1,
        },
      ],
      metadata: {
        date,
        slots: JSON.stringify(slots),
        customerName,
        customerPhone,
        address: address || "",
        purpose: purpose || "",
        notes: notes || "",
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/reserve/complete?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/reserve/calendar`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "決済セッションの作成に失敗しました" },
      { status: 500 }
    );
  }
}
