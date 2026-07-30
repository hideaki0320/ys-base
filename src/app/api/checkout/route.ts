import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-04-30.basil",
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { date, slots, totalPrice, customerName, customerEmail, customerPhone, teamName } = body;

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
            unit_amount: totalPrice,
          },
          quantity: 1,
        },
      ],
      metadata: {
        date,
        slots: JSON.stringify(slots),
        customerName,
        customerPhone,
        teamName: teamName || "",
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
