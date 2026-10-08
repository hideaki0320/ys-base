/**
 * Resend 送信ヘルパー（サーバー専用）
 * 環境変数: RESEND_API_KEY / MAIL_FROM / MAIL_REPLY_TO
 */

export type SendMailResult = { id: string; error?: undefined } | { id?: undefined; error: string };

export function isMailConfigured(): boolean {
  return !!(process.env.RESEND_API_KEY && process.env.MAIL_FROM);
}

export async function sendMail(input: {
  to: string[];
  subject: string;
  text: string;
  replyTo?: string;
  /** ISO 8601。指定すると予約送信になり、送信前なら cancelMail で取り消せる */
  scheduledAt?: string;
  /** 同じキーの再送を Resend 側で 1 通にまとめる（24 時間有効） */
  idempotencyKey?: string;
}): Promise<SendMailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM;
  if (!apiKey || !from) {
    return { error: "RESEND_API_KEY / MAIL_FROM が未設定のためメールを送信していません" };
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };
  if (input.idempotencyKey) headers["Idempotency-Key"] = input.idempotencyKey.slice(0, 256);

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers,
      body: JSON.stringify({
        from,
        to: input.to,
        reply_to: input.replyTo || process.env.MAIL_REPLY_TO || undefined,
        subject: input.subject.replace(/[\r\n]/g, " "),
        text: input.text,
        scheduled_at: input.scheduledAt,
      }),
    });
    const body = await res.text();
    if (!res.ok) {
      return { error: `Resend ${res.status}: ${body.slice(0, 500)}` };
    }
    const id = (JSON.parse(body) as { id?: string }).id;
    return id ? { id } : { error: `Resend の応答に id がありません: ${body.slice(0, 200)}` };
  } catch (e) {
    return { error: `Resend 接続エラー: ${e instanceof Error ? e.message : String(e)}` };
  }
}

/** 予約送信（scheduledAt 付き）のメールを取り消す。送信済みのものは取り消せない */
export async function cancelMail(id: string): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { ok: false, error: "RESEND_API_KEY が未設定です" };
  try {
    const res = await fetch(`https://api.resend.com/emails/${encodeURIComponent(id)}/cancel`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    });
    if (!res.ok) {
      return { ok: false, error: `Resend ${res.status}: ${(await res.text()).slice(0, 300)}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: `Resend 接続エラー: ${e instanceof Error ? e.message : String(e)}` };
  }
}
