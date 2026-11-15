/**
 * Stripe クライアント（サーバー専用）
 *
 * キーを2本（主: STRIPE_SECRET_KEY / 予備: STRIPE_SECRET_KEY_BACKUP）持ち、
 * 主のキーが認証エラー（期限切れ・失効・削除）で拒否されたら、同じ処理を予備のキーでやり直す。
 * 予備に切り替わったときは運営にメールで知らせる。
 *
 * 権限不足（制限付きキーに必要な権限がない）など認証以外のエラーは切り替えずにそのまま投げる。
 * 予備のキーで隠すと、設定ミスに気づけなくなるため。
 */
import Stripe from "stripe";
import { sendMail } from "@/lib/mail";

const API_VERSION = "2026-07-29.dahlia" as const;

type KeyLabel = "主" | "予備";

const clients = new Map<string, Stripe>();

function clientFor(key: string): Stripe {
  let c = clients.get(key);
  if (!c) {
    c = new Stripe(key, { apiVersion: API_VERSION });
    clients.set(key, c);
  }
  return c;
}

export function configuredKeys(): { label: KeyLabel; key: string }[] {
  const keys: { label: KeyLabel; key: string }[] = [];
  if (process.env.STRIPE_SECRET_KEY) keys.push({ label: "主", key: process.env.STRIPE_SECRET_KEY });
  if (process.env.STRIPE_SECRET_KEY_BACKUP) keys.push({ label: "予備", key: process.env.STRIPE_SECRET_KEY_BACKUP });
  return keys;
}

/** キーが期限切れ・失効・削除などで拒否されたか */
export function isStripeAuthError(e: unknown): boolean {
  const err = e as { type?: string; statusCode?: number };
  return err?.type === "StripeAuthenticationError" || err?.statusCode === 401;
}

/** 通知を送りすぎないよう、同じ種類の通知は1プロセスにつき6時間に1回まで */
const lastAlertAt = new Map<string, number>();
const ALERT_INTERVAL_MS = 6 * 60 * 60 * 1000;

async function alertOnce(kind: string, subject: string, text: string) {
  const now = Date.now();
  if ((lastAlertAt.get(kind) ?? 0) > now - ALERT_INTERVAL_MS) return;
  lastAlertAt.set(kind, now);
  const to = process.env.CONTACT_NOTIFY_TO || process.env.MAIL_REPLY_TO;
  if (!to) return;
  try {
    const result = await sendMail({
      to: to.split(",").map((s) => s.trim()).filter(Boolean),
      subject,
      text,
    });
    if (result.error) console.error("[stripe] alert mail failed:", result.error);
  } catch (e) {
    console.error("[stripe] alert mail threw:", e);
  }
}

/**
 * Stripe を呼ぶ処理は必ずこれを通す。
 * 例: await withStripe((s) => s.refunds.create({...}, { idempotencyKey }))
 * 冪等キーは認証エラーのリクエストでは記録されないので、予備のキーで同じキーを使ってやり直しても二重にならない。
 */
export async function withStripe<T>(fn: (stripe: Stripe) => Promise<T>): Promise<T> {
  const keys = configuredKeys();
  if (keys.length === 0) throw new Error("STRIPE_SECRET_KEY が未設定です");

  let lastError: unknown;
  for (let i = 0; i < keys.length; i++) {
    try {
      const result = await fn(clientFor(keys[i].key));
      if (i > 0) {
        await alertOnce(
          "failover",
          "【YS-BASE 要対応】Stripe の主キーが使えなくなり、予備キーで動いています",
          [
            "YS-BASE の決済・返金で、Stripe の主キー（STRIPE_SECRET_KEY）が拒否されました。",
            "予備キー（STRIPE_SECRET_KEY_BACKUP）に自動で切り替えて処理を続けています。お客様への影響は出ていません。",
            "",
            "対応: Stripe で新しい制限付きキーを作り、Railway（ys-base / production）の STRIPE_SECRET_KEY を入れ替えてください。",
            "手順書: docs/stripe-keys.md",
          ].join("\n")
        );
      }
      return result;
    } catch (e) {
      if (!isStripeAuthError(e)) throw e;
      console.error(`[stripe] ${keys[i].label}キーが認証エラーで拒否されました`);
      lastError = e;
    }
  }

  await alertOnce(
    "all-failed",
    "【YS-BASE 緊急】Stripe のキーがすべて使えません（決済・返金が止まっています）",
    [
      "YS-BASE の Stripe キー（主・予備）がすべて拒否されました。予約の決済と返金ができない状態です。",
      "",
      "対応: Stripe で新しい制限付きキーを作り、Railway（ys-base / production）の STRIPE_SECRET_KEY に入れてください。",
      "手順書: docs/stripe-keys.md",
    ].join("\n")
  );
  throw lastError;
}

/** Webhook の署名検証用（ネットワーク通信をしないので、どのキーのクライアントでもよい） */
export function stripeForWebhookVerification(): Stripe {
  const keys = configuredKeys();
  if (keys.length === 0) throw new Error("STRIPE_SECRET_KEY が未設定です");
  return clientFor(keys[0].key);
}
