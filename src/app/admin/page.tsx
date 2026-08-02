"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Search,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Filter,
  CalendarDays,
  CircleCheck,
  CircleX,
  Clock3,
  CheckCircle2,
  Tag,
  Ban,
  Undo2,
  Lock,
  Unlock,
  X,
  MessageSquare,
  Trash2,
} from "lucide-react";
import { getAvailableSlots, formatPrice, formatTimeSlot } from "@/lib/pricing";

/* ─── types ─── */

interface Reservation {
  id: string;
  reservation_date: string;
  slot_hour: number;
  total_price: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  discount_amount: number;
  promotion_code: string | null;
  address: string | null;
  purpose: string | null;
  notes: string | null;
  stripe_session_id: string | null;
  stripe_payment_intent_id: string | null;
  status: string;
  created_at: string;
}

interface SlotClosure {
  slot_hour: number;
  reason: string | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; Icon: typeof CircleCheck }> = {
  confirmed: { label: "確定", color: "text-green-700 bg-green-50 border-green-200", Icon: CircleCheck },
  pending: { label: "未決済", color: "text-yellow-700 bg-yellow-50 border-yellow-200", Icon: Clock3 },
  completed: { label: "完了", color: "text-blue-700 bg-blue-50 border-blue-200", Icon: CheckCircle2 },
  cancelled: { label: "キャンセル", color: "text-red-700 bg-red-50 border-red-200", Icon: CircleX },
};

const WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

function formatSlot(hour: number) {
  return `${hour}:00〜${hour + 1}:00`;
}

function formatDateJP(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit", weekday: "short" });
}

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

type Tab = "reservations" | "availability";

export default function AdminPage() {
  const [apiKey, setApiKey] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("ysbase_admin_key") || "";
    }
    return "";
  });
  const [authenticated, setAuthenticated] = useState(false);
  const [tab, setTab] = useState<Tab>("reservations");

  /* ═══ RESERVATIONS STATE ═══ */
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  /* ═══ AVAILABILITY STATE ═══ */
  const [availMonth, setAvailMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());
  const [selectedHours, setSelectedHours] = useState<Set<number>>(new Set());
  const [closedMap, setClosedMap] = useState<Record<string, SlotClosure[]>>({});
  const [bookedMap, setBookedMap] = useState<Record<string, number[]>>({});
  const [availLoading, setAvailLoading] = useState(false);
  const [batchSaving, setBatchSaving] = useState(false);
  const [reason, setReason] = useState("");
  const [confirmAction, setConfirmAction] = useState<"close" | "open" | null>(null);
  const [lastClickedDate, setLastClickedDate] = useState<string | null>(null);
  const [rangeFrom, setRangeFrom] = useState("");
  const [rangeTo, setRangeTo] = useState("");

  const todayDate = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  /* ─── fetch helpers ─── */

  const fetchReservations = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (dateFrom) params.set("from", dateFrom);
    if (dateTo) params.set("to", dateTo);
    try {
      const res = await fetch(`/api/admin/reservations?${params}`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      if (!res.ok) {
        if (res.status === 401) {
          setAuthenticated(false);
          sessionStorage.removeItem("ysbase_admin_key");
          alert("認証に失敗しました。APIキーを確認してください。");
          return;
        }
        throw new Error("Failed to fetch");
      }
      const data = await res.json();
      setReservations(data.reservations || []);
      setAuthenticated(true);
      sessionStorage.setItem("ysbase_admin_key", apiKey);
    } catch {
      alert("データの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, [apiKey, statusFilter, dateFrom, dateTo]);

  const fetchAvailability = useCallback(async () => {
    if (!authenticated) return;
    setAvailLoading(true);
    const year = availMonth.getFullYear();
    const month = availMonth.getMonth();
    const from = `${year}-${String(month + 1).padStart(2, "0")}-01`;
    const lastDay = new Date(year, month + 1, 0).getDate();
    const to = `${year}-${String(month + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
    try {
      const [availRes, reservRes] = await Promise.all([
        fetch(`/api/admin/availability?from=${from}&to=${to}`, {
          headers: { Authorization: `Bearer ${apiKey}` },
        }),
        fetch(`/api/admin/reservations?from=${from}&to=${to}`, {
          headers: { Authorization: `Bearer ${apiKey}` },
        }),
      ]);
      const availData = await availRes.json();
      const reservData = await reservRes.json();

      const closed: Record<string, SlotClosure[]> = {};
      for (const s of availData.slots || []) {
        if (!s.is_available) {
          if (!closed[s.date]) closed[s.date] = [];
          closed[s.date].push({ slot_hour: s.slot_hour, reason: s.reason });
        }
      }
      setClosedMap(closed);

      const booked: Record<string, number[]> = {};
      for (const r of reservData.reservations || []) {
        if (r.status === "confirmed" || r.status === "pending") {
          if (!booked[r.reservation_date]) booked[r.reservation_date] = [];
          if (!booked[r.reservation_date].includes(r.slot_hour)) {
            booked[r.reservation_date].push(r.slot_hour);
          }
        }
      }
      setBookedMap(booked);
    } catch {
      alert("データの取得に失敗しました");
    } finally {
      setAvailLoading(false);
    }
  }, [apiKey, authenticated, availMonth]);

  useEffect(() => {
    if (apiKey && !authenticated) fetchReservations();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (authenticated && tab === "reservations") fetchReservations();
  }, [statusFilter, dateFrom, dateTo, authenticated, tab, fetchReservations]);

  useEffect(() => {
    if (authenticated && tab === "availability") fetchAvailability();
  }, [authenticated, tab, availMonth, fetchAvailability]);

  /* ─── cancel handler ─── */

  async function handleCancel(reservationId: string, doRefund: boolean) {
    try {
      const res = await fetch("/api/admin/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ reservationId, refund: doRefund }),
      });
      const result = await res.json();
      if (!res.ok) {
        alert("エラー: " + (result.error || "キャンセルに失敗しました"));
        return;
      }
      if (result.refund) {
        alert(`キャンセル完了。返金処理を実行しました（¥${result.refund.amount.toLocaleString()}）`);
      } else {
        alert("キャンセル完了。");
      }
      setCancellingId(null);
      fetchReservations();
    } catch {
      alert("通信エラーが発生しました");
    }
  }

  /* ─── delete handler ─── */

  async function handleDelete(reservationId: string) {
    try {
      const res = await fetch("/api/admin/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ reservationId }),
      });
      const result = await res.json();
      if (!res.ok) {
        alert("エラー: " + (result.error || "削除に失敗しました"));
        return;
      }
      setDeletingId(null);
      fetchReservations();
    } catch {
      alert("通信エラーが発生しました");
    }
  }

  /* ─── batch slot handler ─── */

  async function executeBatch(isAvailable: boolean) {
    if (selectedDates.size === 0 || selectedHours.size === 0) return;
    setBatchSaving(true);
    try {
      const res = await fetch("/api/admin/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          dates: Array.from(selectedDates),
          slot_hours: Array.from(selectedHours).sort((a, b) => a - b),
          is_available: isAvailable,
          reason: isAvailable ? undefined : reason || undefined,
        }),
      });
      if (!res.ok) {
        const result = await res.json();
        alert("エラー: " + (result.error || "保存に失敗しました"));
        return;
      }
      setConfirmAction(null);
      setSelectedHours(new Set());
      setReason("");
      await fetchAvailability();
    } catch {
      alert("通信エラーが発生しました");
    } finally {
      setBatchSaving(false);
    }
  }

  /* ─── date selection helpers ─── */

  function addDateRange(fromStr: string, toStr: string) {
    const from = new Date(fromStr + "T00:00:00");
    const to = new Date(toStr + "T00:00:00");
    const start = from <= to ? from : to;
    const end = from <= to ? to : from;
    setSelectedDates((prev) => {
      const next = new Set(prev);
      const cursor = new Date(start);
      while (cursor <= end) {
        if (cursor >= todayDate) {
          const slots = getAvailableSlots(cursor);
          if (slots.length > 0) next.add(toDateStr(cursor));
        }
        cursor.setDate(cursor.getDate() + 1);
      }
      return next;
    });
  }

  function handleDateClick(dateStr: string, shiftKey: boolean) {
    if (shiftKey && lastClickedDate) {
      addDateRange(lastClickedDate, dateStr);
    } else {
      setSelectedDates((prev) => {
        const next = new Set(prev);
        if (next.has(dateStr)) next.delete(dateStr);
        else next.add(dateStr);
        return next;
      });
    }
    setLastClickedDate(dateStr);
  }

  function applyRange() {
    if (!rangeFrom || !rangeTo) return;
    addDateRange(rangeFrom, rangeTo);
  }

  function selectDatePattern(predicate: (d: Date) => boolean) {
    const year = availMonth.getFullYear();
    const month = availMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const dates = new Set<string>();
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      if (date >= todayDate && predicate(date)) {
        const slots = getAvailableSlots(date);
        if (slots.length > 0) dates.add(toDateStr(date));
      }
    }
    setSelectedDates(dates);
  }

  function selectWeekdays() {
    selectDatePattern((d) => d.getDay() >= 1 && d.getDay() <= 5);
  }
  function selectWeekends() {
    selectDatePattern((d) => d.getDay() === 0 || d.getDay() === 6);
  }
  function selectByDow(dow: number) {
    selectDatePattern((d) => d.getDay() === dow);
  }

  /* ─── hour presets ─── */

  function selectHourRange(from: number, to: number) {
    const hours = new Set<number>();
    for (let h = from; h <= to; h++) hours.add(h);
    setSelectedHours(hours);
  }

  /* ─── computed ─── */

  const filtered = reservations.filter((r) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.customer_name.toLowerCase().includes(q) ||
      r.customer_email.toLowerCase().includes(q) ||
      r.customer_phone.includes(q) ||
      (r.address && r.address.toLowerCase().includes(q)) ||
      (r.purpose && r.purpose.toLowerCase().includes(q))
    );
  });

  const grouped = filtered.reduce<Record<string, Reservation[]>>((acc, r) => {
    if (!acc[r.reservation_date]) acc[r.reservation_date] = [];
    acc[r.reservation_date].push(r);
    return acc;
  }, {});

  const stats = {
    active: reservations.filter((r) => r.status !== "cancelled").length,
    confirmed: reservations.filter((r) => r.status === "confirmed").length,
    pending: reservations.filter((r) => r.status === "pending").length,
    cancelled: reservations.filter((r) => r.status === "cancelled").length,
    revenue: reservations
      .filter((r) => r.status === "confirmed" || r.status === "completed")
      .reduce((sum, r) => sum + r.total_price - (r.discount_amount || 0), 0),
  };

  const calendarDays = useMemo(() => {
    const year = availMonth.getFullYear();
    const month = availMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: (Date | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d));
    return days;
  }, [availMonth]);

  // Union of all available hours across selected dates
  const allAvailableHours = useMemo(() => {
    const hours = new Set<number>();
    for (const dateStr of selectedDates) {
      const d = new Date(dateStr + "T00:00:00");
      const slots = getAvailableSlots(d);
      for (const s of slots) hours.add(s.hour);
    }
    return Array.from(hours).sort((a, b) => a - b);
  }, [selectedDates]);

  // Summary of closures for selected hours
  const closureSummary = useMemo(() => {
    let closedCount = 0;
    let openCount = 0;
    for (const dateStr of selectedDates) {
      const closures = closedMap[dateStr] || [];
      const closedHours = new Set(closures.map((c) => c.slot_hour));
      for (const h of selectedHours) {
        if (closedHours.has(h)) closedCount++;
        else openCount++;
      }
    }
    return { closedCount, openCount, total: closedCount + openCount };
  }, [selectedDates, selectedHours, closedMap]);

  /* ─── Login screen ─── */

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <div className="bg-white p-8 border border-gray-200 rounded-sm max-w-sm w-full">
          <h1 className="text-xl font-black text-gray-900 mb-2">YS-BASE 管理画面</h1>
          <p className="text-sm text-gray-500 mb-6">管理用 API キーを入力してください</p>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="API Key"
            className="w-full border border-gray-300 px-4 py-3 text-sm mb-4 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none rounded-sm"
            onKeyDown={(e) => { if (e.key === "Enter" && apiKey) fetchReservations(); }}
          />
          <button
            onClick={fetchReservations}
            disabled={!apiKey || loading}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 text-sm transition-colors disabled:opacity-50 rounded-sm"
          >
            {loading ? "認証中..." : "ログイン"}
          </button>
        </div>
      </div>
    );
  }

  /* ═══ MAIN LAYOUT ═══ */

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header + Tabs */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-lg font-black text-gray-900">YS-BASE 管理画面</h1>
          <button
            onClick={() => tab === "reservations" ? fetchReservations() : fetchAvailability()}
            disabled={loading || availLoading}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <RefreshCw size={16} className={loading || availLoading ? "animate-spin" : ""} />
            更新
          </button>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-0 border-t border-gray-100">
          {(["reservations", "availability"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-3 text-sm font-bold border-b-2 transition-colors ${
                tab === t ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {t === "reservations" ? "予約一覧" : "スロット管理"}
            </button>
          ))}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* ════════════════ TAB: 予約一覧 ════════════════ */}
        {tab === "reservations" && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
              {[
                { label: "有効予約数", value: stats.active, color: "text-gray-900" },
                { label: "確定", value: stats.confirmed, color: "text-green-700" },
                { label: "未決済", value: stats.pending, color: "text-yellow-700" },
                { label: "キャンセル", value: stats.cancelled, color: "text-red-500" },
                { label: "売上合計", value: `${stats.revenue.toLocaleString()}円`, color: "text-gray-900" },
              ].map((s) => (
                <div key={s.label} className="bg-white p-4 border border-gray-200 rounded-sm">
                  <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                  <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Filters */}
            <div className="bg-white p-4 border border-gray-200 rounded-sm mb-6">
              <div className="flex flex-wrap items-end gap-4">
                <div className="flex items-center gap-2">
                  <Filter size={16} className="text-gray-400" />
                  <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border border-gray-300 px-3 py-2 text-sm rounded-sm bg-white">
                    <option value="all">全ステータス</option>
                    <option value="confirmed">確定</option>
                    <option value="pending">未決済</option>
                    <option value="completed">完了</option>
                    <option value="cancelled">キャンセル</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarDays size={16} className="text-gray-400" />
                  <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="border border-gray-300 px-3 py-2 text-sm rounded-sm" />
                  <span className="text-gray-400">〜</span>
                  <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="border border-gray-300 px-3 py-2 text-sm rounded-sm" />
                </div>
                <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                  <Search size={16} className="text-gray-400" />
                  <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="名前・メール・電話で検索" className="border border-gray-300 px-3 py-2 text-sm rounded-sm flex-1" />
                </div>
              </div>
            </div>

            {/* Reservation List */}
            {loading ? (
              <div className="text-center py-12 text-gray-500">読み込み中...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 text-gray-500 bg-white border border-gray-200 rounded-sm">予約データがありません</div>
            ) : (
              <div className="space-y-4">
                {Object.entries(grouped).sort(([a], [b]) => b.localeCompare(a)).map(([date, items]) => (
                  <div key={date} className="bg-white border border-gray-200 rounded-sm overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                      <h3 className="font-bold text-sm text-gray-800">{formatDateJP(date)}</h3>
                      <span className="text-xs text-gray-500">{items.length}件</span>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {items.map((r) => {
                        const statusCfg = STATUS_CONFIG[r.status] || STATUS_CONFIG.pending;
                        const StatusIcon = statusCfg.Icon;
                        const isExpanded = expandedId === r.id;
                        const isCancelling = cancellingId === r.id;
                        return (
                          <div key={r.id}>
                            <button onClick={() => setExpandedId(isExpanded ? null : r.id)} className="w-full px-4 py-3 flex items-center gap-4 hover:bg-gray-50 transition-colors text-left">
                              <span className="text-sm font-mono text-gray-600 w-24 shrink-0">{formatSlot(r.slot_hour)}</span>
                              <span className={`text-xs font-bold px-2 py-0.5 border rounded-sm shrink-0 ${statusCfg.color}`}>
                                <StatusIcon size={12} className="inline mr-1" />{statusCfg.label}
                              </span>
                              <span className="text-sm font-medium text-gray-800 truncate">{r.customer_name}</span>
                              <span className="text-sm text-gray-500 truncate hidden sm:inline">{r.customer_email}</span>
                              {r.promotion_code && (
                                <span className="text-[11px] font-bold px-1.5 py-0.5 border border-purple-200 bg-purple-50 text-purple-700 rounded-sm shrink-0 hidden sm:inline-flex items-center gap-0.5">
                                  <Tag size={10} />{r.promotion_code}
                                </span>
                              )}
                              <span className="text-sm font-bold text-gray-800 ml-auto shrink-0">
                                {r.discount_amount > 0 ? (
                                  <span className="flex items-center gap-1.5">
                                    <span className="text-gray-400 line-through text-xs font-normal">{r.total_price.toLocaleString()}</span>
                                    {(r.total_price - r.discount_amount).toLocaleString()}円
                                  </span>
                                ) : <>{r.total_price.toLocaleString()}円</>}
                              </span>
                              {isExpanded ? <ChevronUp size={16} className="text-gray-400 shrink-0" /> : <ChevronDown size={16} className="text-gray-400 shrink-0" />}
                            </button>
                            {isExpanded && (
                              <div className="px-4 pb-4 bg-gray-50 border-t border-gray-100">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 py-4 text-sm">
                                  <div><span className="text-gray-500 text-xs">お名前</span><p className="font-medium text-gray-800">{r.customer_name}</p></div>
                                  <div><span className="text-gray-500 text-xs">メールアドレス</span><p className="font-medium text-gray-800">{r.customer_email}</p></div>
                                  <div><span className="text-gray-500 text-xs">電話番号</span><p className="font-medium text-gray-800">{r.customer_phone}</p></div>
                                  {r.address && <div><span className="text-gray-500 text-xs">住所</span><p className="font-medium text-gray-800">{r.address}</p></div>}
                                  {r.purpose && <div><span className="text-gray-500 text-xs">利用目的</span><p className="font-medium text-gray-800">{r.purpose}</p></div>}
                                  {r.notes && <div className="sm:col-span-2"><span className="text-gray-500 text-xs">その他</span><p className="font-medium text-gray-800">{r.notes}</p></div>}
                                  {(r.discount_amount > 0 || r.promotion_code) && (
                                    <div className="sm:col-span-2 lg:col-span-3 bg-purple-50 border border-purple-100 rounded-sm p-3">
                                      <span className="text-purple-600 text-xs font-bold flex items-center gap-1 mb-1.5"><Tag size={12} />クーポン利用</span>
                                      <div className="flex flex-wrap gap-4 text-sm">
                                        {r.promotion_code && <div><span className="text-gray-500 text-xs">コード</span><p className="font-bold text-purple-700">{r.promotion_code}</p></div>}
                                        <div><span className="text-gray-500 text-xs">定価</span><p className="font-medium text-gray-800">{r.total_price.toLocaleString()}円</p></div>
                                        <div><span className="text-gray-500 text-xs">割引額</span><p className="font-medium text-red-600">-{r.discount_amount.toLocaleString()}円</p></div>
                                        <div><span className="text-gray-500 text-xs">実際の支払額</span><p className="font-bold text-gray-900">{(r.total_price - r.discount_amount).toLocaleString()}円</p></div>
                                      </div>
                                    </div>
                                  )}
                                  <div><span className="text-gray-500 text-xs">決済ステータス</span><p className="font-medium text-gray-800">{r.stripe_payment_intent_id ? "入金済み" : r.stripe_session_id ? "決済セッション作成済み" : "未決済"}</p></div>
                                  {r.stripe_payment_intent_id && <div><span className="text-gray-500 text-xs">Stripe Payment ID</span><p className="font-mono text-xs text-gray-600 break-all">{r.stripe_payment_intent_id}</p></div>}
                                  <div><span className="text-gray-500 text-xs">予約登録日時</span><p className="font-medium text-gray-800">{new Date(r.created_at).toLocaleString("ja-JP")}</p></div>
                                </div>
                                {r.status !== "cancelled" ? (
                                  <div className="border-t border-gray-200 pt-4">
                                    {isCancelling ? (
                                      <div className="bg-red-50 border border-red-200 rounded-sm p-4">
                                        <p className="text-sm font-bold text-red-800 mb-3">この予約をキャンセルしますか？</p>
                                        {r.stripe_payment_intent_id && (
                                          <p className="text-sm text-gray-600 mb-4 flex items-center gap-1.5">
                                            <Undo2 size={14} className="text-blue-600" />Stripe経由で全額返金されます
                                          </p>
                                        )}
                                        <div className="flex gap-2">
                                          <button onClick={() => handleCancel(r.id, !!r.stripe_payment_intent_id)} className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 text-sm rounded-sm transition-colors flex items-center gap-1.5">
                                            <Ban size={14} />キャンセル
                                          </button>
                                          <button onClick={() => setCancellingId(null)} className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold px-4 py-2 text-sm rounded-sm transition-colors">やめる</button>
                                        </div>
                                      </div>
                                    ) : (
                                      <button onClick={() => setCancellingId(r.id)} className="text-red-600 hover:text-red-700 text-sm font-bold flex items-center gap-1.5 transition-colors">
                                        <Ban size={14} />キャンセル
                                      </button>
                                    )}
                                  </div>
                                ) : (
                                  <div className="border-t border-gray-200 pt-4">
                                    {deletingId === r.id ? (
                                      <div className="bg-red-50 border border-red-200 rounded-sm p-4">
                                        <p className="text-sm font-bold text-red-800 mb-3">この予約データを完全に削除しますか？</p>
                                        <p className="text-xs text-gray-500 mb-4">この操作は取り消せません。</p>
                                        <div className="flex gap-2">
                                          <button onClick={() => handleDelete(r.id)} className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 text-sm rounded-sm transition-colors flex items-center gap-1.5">
                                            <Trash2 size={14} />削除する
                                          </button>
                                          <button onClick={() => setDeletingId(null)} className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold px-4 py-2 text-sm rounded-sm transition-colors">やめる</button>
                                        </div>
                                      </div>
                                    ) : (
                                      <button onClick={() => setDeletingId(r.id)} className="text-gray-400 hover:text-red-600 text-sm font-bold flex items-center gap-1.5 transition-colors">
                                        <Trash2 size={14} />削除
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ════════════════ TAB: スロット管理 ════════════════ */}
        {tab === "availability" && (
          <>
            {/* Quick Pattern Buttons */}
            <div className="bg-white border border-gray-200 rounded-sm p-4 mb-6">
              <div className="flex flex-wrap items-end gap-6">
                <div>
                  <p className="text-xs font-bold text-gray-500 mb-3">パターン選択</p>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={selectWeekdays} className="px-3 py-1.5 text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded-sm hover:bg-blue-100 transition-colors">
                      今月の平日
                    </button>
                    <button onClick={selectWeekends} className="px-3 py-1.5 text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded-sm hover:bg-blue-100 transition-colors">
                      今月の土日
                    </button>
                    <span className="w-px h-6 bg-gray-200 self-center" />
                    {WEEKDAY_LABELS.map((label, dow) => (
                      <button
                        key={dow}
                        onClick={() => selectByDow(dow)}
                        className={`w-8 h-8 text-xs font-bold border rounded-sm transition-colors ${
                          dow === 0 ? "text-red-600 border-red-200 bg-red-50 hover:bg-red-100"
                            : dow === 6 ? "text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100"
                              : "text-gray-700 border-gray-200 bg-gray-50 hover:bg-gray-100"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                    {selectedDates.size > 0 && (
                      <>
                        <span className="w-px h-6 bg-gray-200 self-center" />
                        <button onClick={() => setSelectedDates(new Set())} className="px-3 py-1.5 text-xs font-bold text-gray-500 border border-gray-200 rounded-sm hover:bg-gray-100 transition-colors flex items-center gap-1">
                          <X size={12} />選択解除
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 mb-3">期間指定</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={rangeFrom}
                      onChange={(e) => setRangeFrom(e.target.value)}
                      className="border border-gray-300 px-2.5 py-1.5 text-xs rounded-sm"
                    />
                    <span className="text-gray-400 text-xs">〜</span>
                    <input
                      type="date"
                      value={rangeTo}
                      onChange={(e) => setRangeTo(e.target.value)}
                      className="border border-gray-300 px-2.5 py-1.5 text-xs rounded-sm"
                    />
                    <button
                      onClick={applyRange}
                      disabled={!rangeFrom || !rangeTo}
                      className="px-3 py-1.5 text-xs font-bold bg-blue-600 text-white rounded-sm hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      選択に追加
                    </button>
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-gray-400 mt-3">カレンダー上で Shift+クリック で範囲選択もできます</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Calendar */}
              <div className="lg:col-span-5 bg-white border border-gray-200 rounded-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <button onClick={() => setAvailMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))} className="p-2 hover:bg-gray-100 transition-colors rounded-sm"><ChevronLeft size={20} /></button>
                  <h2 className="text-lg font-bold text-gray-900">{availMonth.getFullYear()}年{availMonth.getMonth() + 1}月</h2>
                  <button onClick={() => setAvailMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))} className="p-2 hover:bg-gray-100 transition-colors rounded-sm"><ChevronRight size={20} /></button>
                </div>

                {availLoading ? (
                  <div className="text-center py-12 text-gray-500">読み込み中...</div>
                ) : (
                  <div className="grid grid-cols-7 gap-1 text-center">
                    {WEEKDAY_LABELS.map((d) => (
                      <div key={d} className={`text-xs font-bold py-2 ${d === "日" ? "text-red-500" : d === "土" ? "text-blue-500" : "text-gray-500"}`}>{d}</div>
                    ))}
                    {calendarDays.map((date, i) => {
                      if (!date) return <div key={`empty-${i}`} />;
                      const isPast = date < todayDate;
                      const dateStr = toDateStr(date);
                      const slots = getAvailableSlots(date);
                      const hasSlots = slots.length > 0;
                      const isSelected = selectedDates.has(dateStr);
                      const closedCount = (closedMap[dateStr] || []).length;
                      const bookedCount = (bookedMap[dateStr] || []).length;
                      const dow = date.getDay();

                      return (
                        <button
                          key={dateStr}
                          disabled={isPast || !hasSlots}
                          onClick={(e) => handleDateClick(dateStr, e.shiftKey)}
                          className={`py-2.5 text-sm transition-all relative rounded-sm ${
                            isSelected
                              ? "bg-blue-600 text-white font-bold ring-2 ring-blue-300"
                              : isPast || !hasSlots
                                ? "text-gray-300 cursor-not-allowed"
                                : "hover:bg-gray-100 cursor-pointer"
                          } ${!isSelected && !isPast && hasSlots && dow === 0 ? "text-red-500" : ""
                          } ${!isSelected && !isPast && hasSlots && dow === 6 ? "text-blue-500" : ""}`}
                        >
                          {date.getDate()}
                          {!isPast && hasSlots && (closedCount > 0 || bookedCount > 0) && (
                            <div className="flex items-center justify-center gap-0.5 mt-0.5">
                              {closedCount > 0 && <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white/60" : "bg-red-400"}`} />}
                              {bookedCount > 0 && <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white/60" : "bg-green-400"}`} />}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-600" />選択中</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400" />閉鎖あり</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400" />予約あり</span>
                </div>

                {selectedDates.size > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-sm font-bold text-gray-700 mb-2">{selectedDates.size}日間選択中</p>
                    <div className="flex flex-wrap gap-1">
                      {Array.from(selectedDates).sort().map((ds) => {
                        const d = new Date(ds + "T00:00:00");
                        return (
                          <span key={ds} className="text-[11px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-sm border border-blue-200">
                            {d.getMonth() + 1}/{d.getDate()}({WEEKDAY_LABELS[d.getDay()]})
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Slot Management Panel */}
              <div className="lg:col-span-7 bg-white border border-gray-200 rounded-sm p-6">
                {selectedDates.size === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                    <CalendarDays size={48} strokeWidth={1} />
                    <p className="mt-4 text-sm">カレンダーから日付を選択してください</p>
                    <p className="text-xs mt-1">複数日を選んで一括操作できます</p>
                  </div>
                ) : (
                  <>
                    <h3 className="text-base font-bold text-gray-900 mb-1">時間帯を選択</h3>
                    <p className="text-sm text-gray-500 mb-4">チェックしたスロットを一括で開放/閉鎖できます</p>

                    {/* Hour preset buttons */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <button onClick={() => selectHourRange(9, 12)} className="px-3 py-1.5 text-xs font-bold bg-gray-50 text-gray-700 border border-gray-200 rounded-sm hover:bg-gray-100 transition-colors">
                        午前 (9-13時)
                      </button>
                      <button onClick={() => selectHourRange(14, 16)} className="px-3 py-1.5 text-xs font-bold bg-gray-50 text-gray-700 border border-gray-200 rounded-sm hover:bg-gray-100 transition-colors">
                        午後 (14-17時)
                      </button>
                      <button onClick={() => selectHourRange(18, 20)} className="px-3 py-1.5 text-xs font-bold bg-gray-50 text-gray-700 border border-gray-200 rounded-sm hover:bg-gray-100 transition-colors">
                        ナイター (18-21時)
                      </button>
                      <button onClick={() => setSelectedHours(new Set(allAvailableHours))} className="px-3 py-1.5 text-xs font-bold bg-gray-50 text-gray-700 border border-gray-200 rounded-sm hover:bg-gray-100 transition-colors">
                        全選択
                      </button>
                      {selectedHours.size > 0 && (
                        <button onClick={() => setSelectedHours(new Set())} className="px-3 py-1.5 text-xs font-bold text-gray-500 border border-gray-200 rounded-sm hover:bg-gray-100 transition-colors flex items-center gap-1">
                          <X size={12} />解除
                        </button>
                      )}
                    </div>

                    {/* Slot checkboxes */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
                      {allAvailableHours.map((hour) => {
                        const isChecked = selectedHours.has(hour);
                        // Check closure status across selected dates
                        let closedIn = 0;
                        let bookedIn = 0;
                        const reasons: string[] = [];
                        for (const ds of selectedDates) {
                          const closures = closedMap[ds] || [];
                          const closure = closures.find((c) => c.slot_hour === hour);
                          if (closure) {
                            closedIn++;
                            if (closure.reason && !reasons.includes(closure.reason)) reasons.push(closure.reason);
                          }
                          if ((bookedMap[ds] || []).includes(hour)) bookedIn++;
                        }

                        return (
                          <label
                            key={hour}
                            className={`flex items-center gap-3 p-3 border rounded-sm cursor-pointer transition-colors ${
                              isChecked ? "border-blue-300 bg-blue-50" : "border-gray-200 hover:bg-gray-50"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                setSelectedHours((prev) => {
                                  const next = new Set(prev);
                                  if (next.has(hour)) next.delete(hour);
                                  else next.add(hour);
                                  return next;
                                });
                              }}
                              className="w-4 h-4 rounded border-gray-300 text-blue-600"
                            />
                            <span className="text-sm font-mono text-gray-700 w-28">{formatTimeSlot(hour)}</span>
                            <div className="flex items-center gap-2 ml-auto">
                              {closedIn > 0 && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-red-50 text-red-600 border border-red-200 rounded-sm flex items-center gap-0.5">
                                  <Lock size={10} />{closedIn}日閉鎖
                                </span>
                              )}
                              {bookedIn > 0 && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-green-50 text-green-600 border border-green-200 rounded-sm">
                                  {bookedIn}日予約済
                                </span>
                              )}
                              {reasons.length > 0 && (
                                <span className="text-[10px] text-gray-500 flex items-center gap-0.5 max-w-[120px] truncate" title={reasons.join(", ")}>
                                  <MessageSquare size={10} />{reasons[0]}
                                </span>
                              )}
                            </div>
                          </label>
                        );
                      })}
                    </div>

                    {allAvailableHours.length === 0 && (
                      <p className="text-gray-500 text-sm py-8 text-center">選択された日付に利用可能なスロットがありません</p>
                    )}

                    {/* Reason + Action */}
                    {selectedHours.size > 0 && (
                      <div className="border-t border-gray-200 pt-5">
                        <div className="mb-4">
                          <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                            <MessageSquare size={14} />
                            閉鎖理由（任意）
                          </label>
                          <input
                            type="text"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="例: YSCC U-15 練習、芝メンテナンス"
                            className="w-full border border-gray-300 px-4 py-2.5 text-sm rounded-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                          />
                        </div>

                        <div className="bg-gray-50 border border-gray-200 rounded-sm p-4 mb-4">
                          <p className="text-sm text-gray-700">
                            <strong>{selectedDates.size}日間</strong> × <strong>{selectedHours.size}スロット</strong> = <strong>{closureSummary.total}件</strong>
                            {closureSummary.closedCount > 0 && <span className="text-red-600 ml-2">（うち{closureSummary.closedCount}件は閉鎖中）</span>}
                            {closureSummary.openCount > 0 && <span className="text-green-600 ml-2">（うち{closureSummary.openCount}件は開放中）</span>}
                          </p>
                        </div>

                        {/* Confirm Dialog */}
                        {confirmAction ? (
                          <div className={`border rounded-sm p-4 mb-4 ${confirmAction === "close" ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}`}>
                            <p className={`text-sm font-bold mb-3 ${confirmAction === "close" ? "text-red-800" : "text-green-800"}`}>
                              {confirmAction === "close"
                                ? `${closureSummary.total}件のスロットを閉鎖します。${reason ? `理由: "${reason}"` : ""}よろしいですか？`
                                : `${closureSummary.total}件のスロットを開放します。よろしいですか？`}
                            </p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => executeBatch(confirmAction === "open")}
                                disabled={batchSaving}
                                className={`font-bold px-4 py-2 text-sm rounded-sm transition-colors flex items-center gap-1.5 text-white ${
                                  confirmAction === "close" ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
                                } ${batchSaving ? "opacity-50" : ""}`}
                              >
                                {batchSaving ? <RefreshCw size={14} className="animate-spin" /> : confirmAction === "close" ? <Lock size={14} /> : <Unlock size={14} />}
                                {batchSaving ? "処理中..." : "実行する"}
                              </button>
                              <button onClick={() => setConfirmAction(null)} className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold px-4 py-2 text-sm rounded-sm transition-colors">
                                やめる
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex gap-3">
                            <button
                              onClick={() => setConfirmAction("close")}
                              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 text-sm rounded-sm transition-colors flex items-center justify-center gap-2"
                            >
                              <Lock size={16} />閉鎖する
                            </button>
                            <button
                              onClick={() => setConfirmAction("open")}
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 text-sm rounded-sm transition-colors flex items-center justify-center gap-2"
                            >
                              <Unlock size={16} />開放する
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
