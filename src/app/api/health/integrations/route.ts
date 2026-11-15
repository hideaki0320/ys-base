import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import { configuredKeys, withStripe } from "@/lib/stripe";

/**
 * 外部サービス連携の健康診断（毎朝、監視リポジトリの GitHub Actions から呼ばれる）
 *
 * - Stripe の主キー・予備キーが有効か（残高の読み取りで確かめる。決済や返金はしない）
 * - Resend の送信キーが有効か（メールは送らない）
 * - 支払い済みなのに予約が作られていない決済がないか（直近3日）
 *
 * 認証: Authorization: Bearer <HEALTH_CHECK_TOKEN>。未設定なら 404。
 * 応答にはキーの値やエラー本文を含めない（結果と短い説明だけ）。
 */

const API_VERSION = "2026-07-29.dahlia" as const;
const RECONCILE_DAYS = 3;
const WEBHOOK_GRACE_MS = 30 * 60 * 1000; // 決済直後は webhook の処理待ちなので対象外にする

interface Check {
  name: string;
  label: string;
  ok: boolean;
  detail: string;
}

function authorized(request: Request): boolean {
  const token = process.env.HEALTH_CHECK_TOKEN;
  const auth = request.headers.get("authorization");
  return !!token && auth === `Bearer ${token}`;
}

async function checkStripeKey(label: string, key: string | undefined): Promise<Check> {
  const name = label === "主" ? "stripe_primary" : "stripe_backup";
  if (!key) {
    return { name, label: `Stripe ${label}キー`, ok: false, detail: "未設定" };
  }
  try {
    await new Stripe(key, { apiVersion: API_VERSION }).balance.retrieve();
    return { name, label: `Stripe ${label}キー`, ok: true, detail: "有効" };
  } catch (e) {
    const err = e as { type?: string; statusCode?: number };
    const detail =
      err.statusCode === 401
        ? "無効（期限切れ・失効・削除）"
        : err.statusCode === 403
          ? "権限不足（制限付きキーに Balance の読み取り権限がない）"
          : `確認できませんでした（${err.type ?? "unknown"}）`;
    return { name, label: `Stripe ${label}キー`, ok: false, detail };
  }
}

async function checkResend(): Promise<Check> {
  const key = process.env.RESEND_API_KEY;
  const base = { name: "resend", label: "メール送信（Resend）キー" };
  if (!key) return { ...base, ok: false, detail: "未設定" };
  try {
    const res = await fetch("https://api.resend.com/domains", {
      headers: { Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) return { ...base, ok: true, detail: "有効" };
    const body = (await res.json().catch(() => ({}))) as { message?: string };
    // 送信専用キーは一覧の読み取りを拒否されるが、キー自体は有効
    if (res.status === 401 && /restricted to only send emails/i.test(body.message ?? "")) {
      return { ...base, ok: true, detail: "有効（送信専用キー）" };
    }
    return { ...base, ok: false, detail: `無効（HTTP ${res.status}）` };
  } catch {
    return { ...base, ok: false, detail: "確認できませんでした（接続エラー）" };
  }
}

async function checkReconciliation(): Promise<Check> {
  const base = { name: "reconciliation", label: "支払い済みの予約の取りこぼし" };
  if (configuredKeys().length === 0) return { ...base, ok: false, detail: "Stripe キー未設定のため確認できません" };

  try {
    const since = Math.floor((Date.now() - RECONCILE_DAYS * 24 * 60 * 60 * 1000) / 1000);
    const graceEdge = Math.floor((Date.now() - WEBHOOK_GRACE_MS) / 1000);

    // 同じ Stripe アカウントを他のアプリ（チケット販売）と共用しているので、YS-BASE の決済（metadata に date と slots がある）だけを見る
    const paidSessionIds: string[] = [];
    await withStripe(async (stripe) => {
      for await (const s of stripe.checkout.sessions.list({ created: { gte: since }, status: "complete", limit: 100 })) {
        if (s.payment_status !== "paid") continue;
        if (!s.metadata?.date || !s.metadata?.slots) continue;
        if (s.created > graceEdge) continue;
        paidSessionIds.push(s.id);
      }
    });
    if (paidSessionIds.length === 0) return { ...base, ok: true, detail: `直近${RECONCILE_DAYS}日の YS-BASE の決済なし` };

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);
    const { data, error } = await supabase
      .from("ysbase_reservations")
      .select("stripe_session_id")
      .in("stripe_session_id", paidSessionIds);
    if (error) return { ...base, ok: false, detail: "予約データを読めませんでした" };

    const found = new Set((data ?? []).map((r) => r.stripe_session_id));
    const missing = paidSessionIds.filter((id) => !found.has(id));
    if (missing.length > 0) {
      return {
        ...base,
        ok: false,
        detail: `支払い済みなのに予約がない決済が ${missing.length} 件あります（Stripe の決済 ID: ${missing.join(", ")}）`,
      };
    }
    return { ...base, ok: true, detail: `直近${RECONCILE_DAYS}日の決済 ${paidSessionIds.length} 件はすべて予約あり` };
  } catch (e) {
    const err = e as { statusCode?: number; type?: string };
    return {
      ...base,
      ok: false,
      detail:
        err.statusCode === 403
          ? "権限不足（制限付きキーに Checkout Sessions の読み取り権限がない）"
          : `確認できませんでした（${err.type ?? "unknown"}）`,
    };
  }
}

export async function GET(request: Request) {
  if (!process.env.HEALTH_CHECK_TOKEN) {
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const checks = await Promise.all([
    checkStripeKey("主", process.env.STRIPE_SECRET_KEY),
    checkStripeKey("予備", process.env.STRIPE_SECRET_KEY_BACKUP),
    checkResend(),
    checkReconciliation(),
  ]);
  const ok = checks.every((c) => c.ok);

  return NextResponse.json(
    { app: "ys-base", ok, checkedAt: new Date().toISOString(), checks },
    { status: ok ? 200 : 503, headers: { "Cache-Control": "no-store" } }
  );
}
