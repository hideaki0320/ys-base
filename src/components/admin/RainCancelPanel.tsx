"use client";

import { useCallback, useMemo, useState } from "react";
import { CloudRain, Search, AlertTriangle, CircleCheck, CircleX, Undo2, ChevronLeft } from "lucide-react";
import { formatPrice, formatTimeSlot } from "@/lib/pricing";
import { todayKeyJST } from "@/lib/booking-window";
import { fillRainTemplate, formatDateLongJP, rainCancelTemplate } from "@/lib/reservation-mail";

interface Row {
  id: string;
  reservation_date: string;
  slot_hour: number;
  total_price: number;
  discount_amount: number | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  stripe_session_id: string | null;
  status: string;
  cancel_reason: string | null;
  cancel_mail_id: string | null;
  cancel_mail_scheduled_at: string | null;
  cancel_mail_error: string | null;
}

interface Booking {
  sessionId: string;
  rows: Row[];
  name: string;
  email: string;
  phone: string;
  amount: number;
  status: string;
  mailId: string | null;
  mailScheduledAt: string | null;
  mailError: string | null;
}

interface ExecResult {
  sessionId: string;
  customerName: string;
  refunded: boolean;
  refundAmount: number | null;
  cancelled: boolean;
  mailId: string | null;
  mailScheduledAt: string | null;
  error: string | null;
}

type Step = "select" | "edit" | "preview" | "confirm" | "done";

function groupBookings(rows: Row[]): Booking[] {
  const map = new Map<string, Row[]>();
  for (const r of rows) {
    const key = r.stripe_session_id || `no-session-${r.id}`;
    map.set(key, [...(map.get(key) || []), r]);
  }
  return [...map.entries()].map(([sessionId, rs]) => ({
    sessionId,
    rows: rs.sort((a, b) => a.slot_hour - b.slot_hour),
    name: rs[0].customer_name,
    email: rs[0].customer_email,
    phone: rs[0].customer_phone,
    amount: rs.reduce((s, r) => s + r.total_price - (r.discount_amount || 0), 0),
    status: rs[0].status,
    mailId: rs.find((r) => r.cancel_mail_id)?.cancel_mail_id ?? null,
    mailScheduledAt: rs.find((r) => r.cancel_mail_scheduled_at)?.cancel_mail_scheduled_at ?? null,
    mailError: rs.find((r) => r.cancel_mail_error)?.cancel_mail_error ?? null,
  }));
}

function formatTimeJP(iso: string) {
  return new Intl.DateTimeFormat("ja-JP", { timeZone: "Asia/Tokyo", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
}

export function RainCancelPanel({ apiKey }: { apiKey: string }) {
  const template = useMemo(() => rainCancelTemplate(), []);
  const [date, setDate] = useState(() => todayKeyJST());
  const [loadedDate, setLoadedDate] = useState<string | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<Step>("select");

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [mailTargets, setMailTargets] = useState<Set<string>>(new Set());
  const [sendMail, setSendMail] = useState(true);
  const [closeAllSlots, setCloseAllSlots] = useState(true);
  const [subject, setSubject] = useState(template.subject);
  const [body, setBody] = useState(template.body);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [understood, setUnderstood] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [results, setResults] = useState<ExecResult[] | null>(null);
  const [slotsMessage, setSlotsMessage] = useState<string | null>(null);
  const [undoing, setUndoing] = useState<string | null>(null);
  // 取り消し可否の判定基準時刻（一覧を読み込んだ時点）
  const [loadedAt, setLoadedAt] = useState(0);

  const active = bookings.filter((b) => b.status === "confirmed");
  const done = bookings.filter((b) => b.status === "cancelled");
  const chosen = active.filter((b) => selected.has(b.sessionId));
  const mailChosen = sendMail ? chosen.filter((b) => mailTargets.has(b.sessionId)) : [];
  const totalRefund = chosen.reduce((s, b) => s + b.amount, 0);
  const previewBooking = mailChosen.find((b) => b.sessionId === previewId) || mailChosen[0];

  const load = useCallback(async (target: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/rain-cancel?date=${target}`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "取得に失敗しました");
      const grouped = groupBookings(data.reservations || []);
      setBookings(grouped);
      setLoadedDate(target);
      setLoadedAt(Date.now());
      // 決済（Stripe セッション）の無い予約は自動返金できないので、初期選択から外す
      const ids = grouped.filter((b) => b.status === "confirmed" && !b.sessionId.startsWith("no-session-")).map((b) => b.sessionId);
      setSelected(new Set(ids));
      setMailTargets(new Set(ids));
      setStep("select");
      setResults(null);
      setSlotsMessage(null);
      setUnderstood(false);
    } catch (e) {
      alert(e instanceof Error ? e.message : "取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, [apiKey]);

  function toggle(set: Set<string>, setter: (s: Set<string>) => void, id: string) {
    const next = new Set(set);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setter(next);
  }

  async function execute() {
    if (!loadedDate || chosen.length === 0) return;
    setExecuting(true);
    try {
      const res = await fetch("/api/admin/rain-cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          date: loadedDate,
          sessionIds: chosen.map((b) => b.sessionId),
          closeAllSlots,
          mail: { send: sendMail, subject, body, sessionIds: mailChosen.map((b) => b.sessionId) },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "実行に失敗しました");
      setResults(data.results);
      setSlotsMessage(
        closeAllSlots ? (data.slotsClosed ? "この日の全枠を予約停止にしました" : `枠の停止に失敗しました: ${data.slotsError}`) : null
      );
      setStep("done");
    } catch (e) {
      alert(e instanceof Error ? e.message : "実行に失敗しました");
    } finally {
      setExecuting(false);
    }
  }

  async function undoMail(sessionIds: string[]) {
    if (!confirm("メールの送信を取り消します。返金・キャンセルは取り消されません。よろしいですか？")) return;
    setUndoing(sessionIds.join(","));
    try {
      const res = await fetch("/api/admin/rain-cancel/undo-mail", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ sessionIds }),
      });
      const data = await res.json();
      const failed = (data.results || []).filter((r: { ok: boolean }) => !r.ok);
      alert(failed.length ? `取り消せなかったメールがあります: ${failed.map((f: { error?: string }) => f.error).join(" / ")}` : "メールの送信を取り消しました");
      if (loadedDate) await load(loadedDate);
    } finally {
      setUndoing(null);
    }
  }

  const undoable = done.filter((b) => b.mailId && b.mailScheduledAt && new Date(b.mailScheduledAt).getTime() > loadedAt);

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <CloudRain size={20} className="text-gray-700" />
        <h2 className="text-lg font-black text-gray-900">雨天中止</h2>
      </div>
      <p className="text-xs text-gray-500 mb-6 leading-relaxed">
        選んだ日の予約をキャンセルし、お支払い額を全額返金します。お客様へのメールは5分後に送信され、それまでは取り消せます。
        <br />
        <strong className="text-red-600">返金は取り消せません。</strong>
      </p>

      {/* 日付選択 */}
      <div className="bg-white border border-gray-200 rounded-sm p-4 mb-6 flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1">中止する日</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border border-gray-300 px-3 py-2 text-sm rounded-sm"
          />
        </div>
        <button
          onClick={() => date && load(date)}
          disabled={!date || loading || executing}
          className="flex items-center gap-1.5 bg-gray-900 hover:bg-gray-700 text-white font-bold px-4 py-2 text-sm rounded-sm disabled:opacity-50"
        >
          <Search size={14} />
          {loading ? "読み込み中..." : "予約を表示"}
        </button>
      </div>

      {loadedDate && (
        <>
          <h3 className="text-sm font-black text-gray-900 mb-3">{formatDateLongJP(loadedDate)} の予約</h3>

          {/* Step: select */}
          {step === "select" && (
            <>
              {active.length === 0 ? (
                <p className="text-sm text-gray-500 bg-white border border-gray-200 rounded-sm p-6 text-center mb-6">
                  この日の確定済み予約はありません
                </p>
              ) : (
                <div className="bg-white border border-gray-200 rounded-sm divide-y divide-gray-100 mb-4">
                  {active.map((b) => (
                    <label key={b.sessionId} className="flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={selected.has(b.sessionId)}
                        onChange={() => toggle(selected, setSelected, b.sessionId)}
                        disabled={b.sessionId.startsWith("no-session-")}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-baseline gap-x-3">
                          <span className="text-sm font-bold text-gray-900">{b.name}</span>
                          <span className="text-xs text-gray-500 break-all">{b.email}</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-0.5">
                          {b.rows.map((r) => formatTimeSlot(r.slot_hour)).join("、")}
                        </p>
                        {b.sessionId.startsWith("no-session-") && (
                          <p className="text-xs text-amber-700 mt-0.5">オンライン決済の無い予約のため、ここでは返金できません。予約一覧から個別に対応してください</p>
                        )}
                      </div>
                      <span className="text-sm font-bold text-gray-900 tabular-nums">{formatPrice(b.amount)}</span>
                    </label>
                  ))}
                </div>
              )}

              {active.length > 0 && (
                <div className="space-y-2 mb-6 text-sm">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={closeAllSlots} onChange={(e) => setCloseAllSlots(e.target.checked)} />
                    この日の全枠を予約停止にする（新しい予約を受け付けない）
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={sendMail} onChange={(e) => setSendMail(e.target.checked)} />
                    お客様に中止・返金のお知らせメールを送る
                  </label>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={() => setStep(sendMail ? "edit" : "confirm")}
                  disabled={chosen.length === 0}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2 text-sm rounded-sm disabled:opacity-40"
                >
                  次へ（{chosen.length}件を選択中）
                </button>
              </div>
            </>
          )}

          {/* Step: edit mail */}
          {step === "edit" && (
            <div className="bg-white border border-gray-200 rounded-sm p-5 space-y-4">
              <div>
                <p className="text-xs font-bold text-gray-600 mb-2">メールを送る相手</p>
                <div className="space-y-1.5">
                  {chosen.map((b) => (
                    <label key={b.sessionId} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={mailTargets.has(b.sessionId)}
                        onChange={() => toggle(mailTargets, setMailTargets, b.sessionId)}
                      />
                      {b.name}
                      <span className="text-xs text-gray-500 break-all">{b.email}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">件名</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full border border-gray-300 px-3 py-2 text-sm rounded-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">本文</label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={18}
                  className="w-full border border-gray-300 px-3 py-2 text-sm rounded-sm font-mono leading-relaxed"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {"{お名前} {日程} {時間} {返金額}"} は送信時にお客様ごとの内容に置き換わります。
                </p>
              </div>
              <div className="flex justify-between">
                <button onClick={() => setStep("select")} className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
                  <ChevronLeft size={16} />
                  戻る
                </button>
                <button
                  onClick={() => setStep("preview")}
                  disabled={mailChosen.length === 0 || !subject.trim() || !body.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2 text-sm rounded-sm disabled:opacity-40"
                >
                  プレビューへ
                </button>
              </div>
            </div>
          )}

          {/* Step: preview */}
          {step === "preview" && previewBooking && (
            <div className="bg-white border border-gray-200 rounded-sm p-5 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-gray-600">プレビューする相手</span>
                <select
                  value={previewBooking.sessionId}
                  onChange={(e) => setPreviewId(e.target.value)}
                  className="border border-gray-300 px-2 py-1 text-sm rounded-sm bg-white"
                >
                  {mailChosen.map((b) => (
                    <option key={b.sessionId} value={b.sessionId}>{b.name}</option>
                  ))}
                </select>
              </div>
              <div className="border border-gray-200 rounded-sm">
                <div className="px-4 py-2 border-b border-gray-200 text-xs text-gray-600 space-y-0.5">
                  <p>宛先: {previewBooking.email}</p>
                  <p className="font-bold text-gray-900 text-sm">{fillRainTemplate(subject, previewBooking.rows)}</p>
                </div>
                <pre className="px-4 py-3 text-sm text-gray-800 whitespace-pre-wrap font-sans leading-relaxed">
                  {fillRainTemplate(body, previewBooking.rows)}
                </pre>
              </div>
              <div className="flex justify-between">
                <button onClick={() => setStep("edit")} className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
                  <ChevronLeft size={16} />
                  文面を直す
                </button>
                <button
                  onClick={() => setStep("confirm")}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2 text-sm rounded-sm"
                >
                  最終確認へ
                </button>
              </div>
            </div>
          )}

          {/* Step: confirm */}
          {step === "confirm" && (
            <div className="bg-white border border-red-200 rounded-sm p-5 space-y-4">
              <p className="flex items-center gap-2 text-sm font-black text-red-700">
                <AlertTriangle size={16} />
                以下の内容で実行します
              </p>
              <dl className="text-sm space-y-1.5">
                <div className="flex gap-3"><dt className="w-28 text-gray-500 shrink-0">日程</dt><dd>{formatDateLongJP(loadedDate)}</dd></div>
                <div className="flex gap-3"><dt className="w-28 text-gray-500 shrink-0">キャンセル</dt><dd>{chosen.length}件（{chosen.map((b) => b.name).join("、")}）</dd></div>
                <div className="flex gap-3"><dt className="w-28 text-gray-500 shrink-0">返金合計</dt><dd className="font-bold">{formatPrice(totalRefund)}（取り消し不可）</dd></div>
                <div className="flex gap-3"><dt className="w-28 text-gray-500 shrink-0">お客様メール</dt><dd>{mailChosen.length > 0 ? `${mailChosen.length}通（5分後に送信・それまで取り消し可）` : "送らない"}</dd></div>
                <div className="flex gap-3"><dt className="w-28 text-gray-500 shrink-0">枠の停止</dt><dd>{closeAllSlots ? "この日の全枠を予約停止にする" : "しない"}</dd></div>
              </dl>
              <label className="flex items-start gap-2 text-sm bg-red-50 border border-red-100 p-3 rounded-sm">
                <input type="checkbox" checked={understood} onChange={(e) => setUnderstood(e.target.checked)} className="mt-0.5" />
                返金は実行後に取り消せないことを確認しました
              </label>
              <div className="flex justify-between">
                <button
                  onClick={() => setStep(sendMail ? "preview" : "select")}
                  disabled={executing}
                  className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
                >
                  <ChevronLeft size={16} />
                  戻る
                </button>
                <button
                  onClick={execute}
                  disabled={!understood || executing}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-2 text-sm rounded-sm disabled:opacity-40"
                >
                  {executing ? "実行中..." : `${chosen.length}件をキャンセルして返金する`}
                </button>
              </div>
            </div>
          )}

          {/* Step: done */}
          {step === "done" && results && (
            <div className="bg-white border border-gray-200 rounded-sm p-5 space-y-3">
              <p className="text-sm font-black text-gray-900">実行結果</p>
              {results.map((r) => (
                <div key={r.sessionId} className="flex items-start gap-2 text-sm">
                  {r.error ? (
                    <CircleX size={16} className="text-red-600 shrink-0 mt-0.5" />
                  ) : (
                    <CircleCheck size={16} className="text-green-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="font-bold">{r.customerName || r.sessionId}</p>
                    <p className="text-xs text-gray-600">
                      {r.cancelled ? "キャンセル済み" : "キャンセル未完了"} ／ {r.refunded ? `返金済み${r.refundAmount != null ? `（${formatPrice(r.refundAmount)}）` : ""}` : "返金未完了"}
                      {r.mailScheduledAt && ` ／ メールは ${formatTimeJP(r.mailScheduledAt)} に送信予定`}
                    </p>
                    {r.error && <p className="text-xs text-red-600 mt-0.5">{r.error}</p>}
                  </div>
                </div>
              ))}
              {slotsMessage && <p className="text-xs text-gray-600">{slotsMessage}</p>}
              <div className="flex flex-wrap justify-end gap-2 pt-2">
                {results.some((r) => r.mailId) && (
                  <button
                    onClick={() => undoMail(results.filter((r) => r.mailId).map((r) => r.sessionId))}
                    disabled={!!undoing}
                    className="flex items-center gap-1.5 border border-gray-300 text-gray-700 hover:bg-gray-50 font-bold px-4 py-2 text-sm rounded-sm disabled:opacity-50"
                  >
                    <Undo2 size={14} />
                    メールの送信をすべて取り消す
                  </button>
                )}
                <button
                  onClick={() => load(loadedDate)}
                  className="bg-gray-900 hover:bg-gray-700 text-white font-bold px-4 py-2 text-sm rounded-sm"
                >
                  一覧に戻る
                </button>
              </div>
            </div>
          )}

          {/* この日に雨天中止済みの予約 */}
          {step === "select" && done.length > 0 && (
            <div className="mt-8">
              <p className="text-xs font-bold text-gray-600 mb-2">この日に雨天中止した予約</p>
              <div className="bg-white border border-gray-200 rounded-sm divide-y divide-gray-100">
                {done.map((b) => {
                  const canUndo = undoable.some((u) => u.sessionId === b.sessionId);
                  return (
                    <div key={b.sessionId} className="flex flex-wrap items-center gap-3 px-4 py-3 text-sm">
                      <span className="font-bold">{b.name}</span>
                      <span className="text-xs text-gray-500">{b.rows.map((r) => formatTimeSlot(r.slot_hour)).join("、")}</span>
                      <span className="text-xs text-gray-500 flex-1">
                        {b.mailScheduledAt
                          ? canUndo
                            ? `メール ${formatTimeJP(b.mailScheduledAt)} に送信予定`
                            : `メール ${formatTimeJP(b.mailScheduledAt)} に送信済み`
                          : b.mailError || "メールなし"}
                      </span>
                      {canUndo && (
                        <button
                          onClick={() => undoMail([b.sessionId])}
                          disabled={!!undoing}
                          className="flex items-center gap-1 text-xs font-bold text-gray-700 border border-gray-300 px-2.5 py-1 rounded-sm hover:bg-gray-50 disabled:opacity-50"
                        >
                          <Undo2 size={12} />
                          メールを取り消す
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
