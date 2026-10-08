import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { getPrice } from "@/lib/pricing";
import { isWithinBookingWindow } from "@/lib/booking-window";
import { SITE_URL } from "@/lib/site";

// 決済後の戻り先。本番は正式ドメイン、ローカル開発では NEXT_PUBLIC_BASE_URL（localhost）
const RETURN_BASE =
  process.env.NODE_ENV === "production" ? SITE_URL : process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-07-29.dahlia",
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { date, slots, customerName, customerEmail, customerPhone, address, purpose, notes } = body;

    if (!Array.isArray(slots) || slots.length === 0 || !slots.every((h) => Number.isInteger(h))) {
      return NextResponse.json({ error: "slots required" }, { status: 400 });
    }

    if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ error: "日付が正しくありません" }, { status: 400 });
    }
    if (!isWithinBookingWindow(date)) {
      return NextResponse.json(
        { error: "ご予約いただけるのは1ヶ月先（同じ日付）までです。日付を選び直してください" },
        { status: 400 }
      );
    }

    const reservationDate = new Date(date + "T00:00:00");
    const serverTotal = (slots as number[]).reduce((sum: number, hour: number) => {
      const p = getPrice(reservationDate, hour);
      if (p === null) throw new Error(`invalid slot: ${hour}`);
      return sum + p;
    }, 0);

    // 停止中・予約済みの枠は決済画面を作らない（画面を開いたまま時間が経った場合など）
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);
    const [closed, booked] = await Promise.all([
      supabase.from("ysbase_slot_availability").select("slot_hour").eq("date", date).eq("is_available", false).in("slot_hour", slots),
      supabase.from("ysbase_reservations").select("slot_hour").eq("reservation_date", date).in("status", ["pending", "confirmed"]).in("slot_hour", slots),
    ]);
    if (closed.error || booked.error) {
      console.error("[checkout] availability check failed:", closed.error?.message, booked.error?.message);
      return NextResponse.json({ error: "空き状況を確認できませんでした。時間をおいて再度お試しください" }, { status: 500 });
    }
    if ((closed.data?.length ?? 0) > 0 || (booked.data?.length ?? 0) > 0) {
      return NextResponse.json(
        { error: "選択した時間帯はご予約いただけなくなりました。お手数ですが、日時を選び直してください" },
        { status: 409 }
      );
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "paypay"],
      mode: "payment",
      allow_promotion_codes: true,
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
      success_url: `${RETURN_BASE}/reserve/complete?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${RETURN_BASE}/reserve/calendar`,
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
