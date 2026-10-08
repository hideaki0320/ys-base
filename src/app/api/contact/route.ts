import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );
}

const CATEGORY_LABELS: Record<string, string> = {
  reservation: "予約について",
  facility: "施設について",
  event: "イベント利用について",
  other: "その他",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function str(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

export async function GET() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "不正なリクエストです" }, { status: 400 });
  }

  // スパム対策: 人には見えない入力欄に値が入っていたらボットとみなし、保存せず成功扱いで返す
  if (str(body.website, 200)) {
    return NextResponse.json({ ok: true });
  }

  const name = str(body.name, 100);
  const org = str(body.org, 200);
  const email = str(body.email, 254);
  const phone = str(body.phone, 30);
  const category = str(body.category, 20);
  const message = str(body.message, 5000);

  if (!name || !email || !category || !message) {
    return NextResponse.json({ error: "必須項目を入力してください" }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "メールアドレスの形式が正しくありません" }, { status: 400 });
  }
  if (!CATEGORY_LABELS[category]) {
    return NextResponse.json({ error: "お問い合わせ種別を選択してください" }, { status: 400 });
  }

  const supabase = getSupabase();
  const { data: inquiry, error } = await supabase
    .from("ysbase_inquiries")
    .insert({
      name,
      org: org || null,
      email,
      phone: phone || null,
      category,
      message,
    })
    .select("id, created_at")
    .single();

  if (error || !inquiry) {
    console.error("[contact] insert failed:", error?.message);
    return NextResponse.json(
      { error: "送信に失敗しました。お手数ですがお電話（045-621-8760）でお問い合わせください" },
      { status: 500 }
    );
  }

  // 保存できていれば問い合わせは失われないので、通知メールの失敗は利用者には返さない
  const notifyError = await notifyAdmin({ name, org, email, phone, category, message });
  const { error: updateError } = await supabase
    .from("ysbase_inquiries")
    .update(notifyError ? { notify_error: notifyError } : { notified_at: new Date().toISOString() })
    .eq("id", inquiry.id);
  if (updateError) {
    console.error("[contact] notify status update failed:", updateError.message);
  }

  return NextResponse.json({ ok: true });
}

async function notifyAdmin(input: {
  name: string;
  org: string;
  email: string;
  phone: string;
  category: string;
  message: string;
}): Promise<string | null> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM;
  const to = process.env.CONTACT_NOTIFY_TO || process.env.MAIL_REPLY_TO;

  if (!apiKey || !from || !to) {
    const msg = "RESEND_API_KEY / MAIL_FROM / CONTACT_NOTIFY_TO が未設定のため通知メールを送信していません";
    console.error("[contact]", msg);
    return msg;
  }

  const text = [
    "YS-BASE のお問い合わせフォームから送信がありました。",
    "このメールに返信すると、お問い合わせ者に直接届きます。",
    "",
    `お名前: ${input.name}`,
    `チーム名・団体名: ${input.org || "-"}`,
    `メールアドレス: ${input.email}`,
    `電話番号: ${input.phone || "-"}`,
    `種別: ${CATEGORY_LABELS[input.category]}`,
    "",
    "お問い合わせ内容:",
    input.message,
    "",
    "管理画面: https://ys-base.yscc1986.net/admin",
  ].join("\n");

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: to.split(",").map((s) => s.trim()).filter(Boolean),
        reply_to: input.email,
        subject: `[YS-BASE お問い合わせ] ${CATEGORY_LABELS[input.category]} - ${input.name.replace(/[\r\n]/g, " ")} 様`,
        text,
      }),
    });
    if (!res.ok) {
      const detail = await res.text();
      const msg = `Resend ${res.status}: ${detail.slice(0, 500)}`;
      console.error("[contact] notify failed:", msg);
      return msg;
    }
    return null;
  } catch (e) {
    const msg = `Resend 接続エラー: ${e instanceof Error ? e.message : String(e)}`;
    console.error("[contact]", msg);
    return msg;
  }
}
