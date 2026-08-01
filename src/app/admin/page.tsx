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
} from "lucide-react";
import { getAvailableSlots, formatPrice, formatTimeSlot } from "@/lib/pricing";

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

const STATUS_CONFIG: Record<string, { label: string; color: string; Icon: typeof CircleCheck }> = {
  confirmed: { label: "確定", color: "text-green-700 bg-green-50 border-green-200", Icon: CircleCheck },
  pending: { label: "未決済", color: "text-yellow-700 bg-yellow-50 border-yellow-200", Icon: Clock3 },
  completed: { label: "完了", color: "text-blue-700 bg-blue-50 border-blue-200", Icon: CheckCircle2 },
  cancelled: { label: "キャンセル", color: "text-red-700 bg-red-50 border-red-200", Icon: CircleX },
};

function formatSlot(hour: number) {
  return `${hour}:00〜${hour + 1}:00`;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit", weekday: "short" });
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

  // --- Reservations state ---
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelRefund, setCancelRefund] = useState(true);

  // --- Availability state ---
  const [availMonth, setAvailMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [closedSlots, setClosedSlots] = useState<Record<string, number[]>>({});
  const [bookedSlotsMap, setBookedSlotsMap] = useState<Record<string, number[]>>({});
  const [availLoading, setAvailLoading] = useState(false);
  const [slotSaving, setSlotSaving] = useState<number | null>(null);

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

  useEffect(() => {
    if (apiKey && !authenticated) {
      fetchReservations();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (authenticated && tab === "reservations") {
      fetchReservations();
    }
  }, [statusFilter, dateFrom, dateTo, authenticated, tab, fetchReservations]);

  // --- Availability data fetching ---
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

      const closed: Record<string, number[]> = {};
      for (const s of availData.slots || []) {
        if (!s.is_available) {
          if (!closed[s.date]) closed[s.date] = [];
          closed[s.date].push(s.slot_hour);
        }
      }
      setClosedSlots(closed);

      const booked: Record<string, number[]> = {};
      for (const r of reservData.reservations || []) {
        if (r.status === "confirmed" || r.status === "pending") {
          if (!booked[r.reservation_date]) booked[r.reservation_date] = [];
          if (!booked[r.reservation_date].includes(r.slot_hour)) {
            booked[r.reservation_date].push(r.slot_hour);
          }
        }
      }
      setBookedSlotsMap(booked);
    } catch {
      alert("データの取得に失敗しました");
    } finally {
      setAvailLoading(false);
    }
  }, [apiKey, authenticated, availMonth]);

  useEffect(() => {
    if (authenticated && tab === "availability") {
      fetchAvailability();
    }
  }, [authenticated, tab, availMonth, fetchAvailability]);

  // --- Cancel handler ---
  async function handleCancel(reservationId: string, doRefund: boolean) {
    try {
      const res = await fetch("/api/admin/cancel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
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

  // --- Slot toggle handler ---
  async function toggleSlot(dateStr: string, hour: number, currentlyClosed: boolean) {
    setSlotSaving(hour);
    try {
      const res = await fetch("/api/admin/availability", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          date: dateStr,
          slot_hour: hour,
          is_available: currentlyClosed,
        }),
      });
      if (!res.ok) {
        const result = await res.json();
        alert("エラー: " + (result.error || "保存に失敗しました"));
        return;
      }
      setClosedSlots((prev) => {
        const next = { ...prev };
        if (currentlyClosed) {
          next[dateStr] = (next[dateStr] || []).filter((h) => h !== hour);
        } else {
          next[dateStr] = [...(next[dateStr] || []), hour];
        }
        return next;
      });
    } catch {
      alert("通信エラーが発生しました");
    } finally {
      setSlotSaving(null);
    }
  }

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
    total: reservations.length,
    confirmed: reservations.filter((r) => r.status === "confirmed").length,
    pending: reservations.filter((r) => r.status === "pending").length,
    cancelled: reservations.filter((r) => r.status === "cancelled").length,
    revenue: reservations
      .filter((r) => r.status === "confirmed" || r.status === "completed")
      .reduce((sum, r) => sum + r.total_price - (r.discount_amount || 0), 0),
  };

  // --- Availability calendar ---
  const calendarDays = useMemo(() => {
    const year = availMonth.getFullYear();
    const month = availMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: (Date | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(new Date(year, month, d));
    }
    return days;
  }, [availMonth]);

  const todayDate = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const selectedDateSlots = useMemo(() => {
    if (!selectedDate) return [];
    const dateStr = selectedDate.toISOString().split("T")[0];
    const allSlots = getAvailableSlots(selectedDate);
    const closed = closedSlots[dateStr] || [];
    const booked = bookedSlotsMap[dateStr] || [];
    return allSlots.map((s) => ({
      ...s,
      isClosed: closed.includes(s.hour),
      isBooked: booked.includes(s.hour),
    }));
  }, [selectedDate, closedSlots, bookedSlotsMap]);

  // --- Login screen ---
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
            onKeyDown={(e) => {
              if (e.key === "Enter" && apiKey) fetchReservations();
            }}
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

  return (
    <div className="min-h-screen bg-gray-100">
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
        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-0 border-t border-gray-100">
          <button
            onClick={() => setTab("reservations")}
            className={`px-5 py-3 text-sm font-bold border-b-2 transition-colors ${
              tab === "reservations"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            予約一覧
          </button>
          <button
            onClick={() => setTab("availability")}
            className={`px-5 py-3 text-sm font-bold border-b-2 transition-colors ${
              tab === "availability"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            スロット管理
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* ============== TAB: 予約一覧 ============== */}
        {tab === "reservations" && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="bg-white p-4 border border-gray-200 rounded-sm">
                <p className="text-xs text-gray-500 mb-1">総予約数</p>
                <p className="text-2xl font-black text-gray-900">{stats.total}</p>
              </div>
              <div className="bg-white p-4 border border-gray-200 rounded-sm">
                <p className="text-xs text-gray-500 mb-1">確定</p>
                <p className="text-2xl font-black text-green-700">{stats.confirmed}</p>
              </div>
              <div className="bg-white p-4 border border-gray-200 rounded-sm">
                <p className="text-xs text-gray-500 mb-1">未決済</p>
                <p className="text-2xl font-black text-yellow-700">{stats.pending}</p>
              </div>
              <div className="bg-white p-4 border border-gray-200 rounded-sm">
                <p className="text-xs text-gray-500 mb-1">売上合計</p>
                <p className="text-2xl font-black text-gray-900">{stats.revenue.toLocaleString()}円</p>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 border border-gray-200 rounded-sm mb-6">
              <div className="flex flex-wrap items-end gap-4">
                <div className="flex items-center gap-2">
                  <Filter size={16} className="text-gray-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border border-gray-300 px-3 py-2 text-sm rounded-sm bg-white"
                  >
                    <option value="all">全ステータス</option>
                    <option value="confirmed">確定</option>
                    <option value="pending">未決済</option>
                    <option value="completed">完了</option>
                    <option value="cancelled">キャンセル</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarDays size={16} className="text-gray-400" />
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="border border-gray-300 px-3 py-2 text-sm rounded-sm"
                  />
                  <span className="text-gray-400">〜</span>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="border border-gray-300 px-3 py-2 text-sm rounded-sm"
                  />
                </div>
                <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                  <Search size={16} className="text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="名前・メール・電話で検索"
                    className="border border-gray-300 px-3 py-2 text-sm rounded-sm flex-1"
                  />
                </div>
              </div>
            </div>

            {/* Reservation List */}
            {loading ? (
              <div className="text-center py-12 text-gray-500">読み込み中...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 text-gray-500 bg-white border border-gray-200 rounded-sm">
                予約データがありません
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(grouped)
                  .sort(([a], [b]) => b.localeCompare(a))
                  .map(([date, items]) => (
                    <div key={date} className="bg-white border border-gray-200 rounded-sm overflow-hidden">
                      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                        <h3 className="font-bold text-sm text-gray-800">{formatDate(date)}</h3>
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
                              <button
                                onClick={() => setExpandedId(isExpanded ? null : r.id)}
                                className="w-full px-4 py-3 flex items-center gap-4 hover:bg-gray-50 transition-colors text-left"
                              >
                                <span className="text-sm font-mono text-gray-600 w-24 shrink-0">
                                  {formatSlot(r.slot_hour)}
                                </span>
                                <span className={`text-xs font-bold px-2 py-0.5 border rounded-sm shrink-0 ${statusCfg.color}`}>
                                  <StatusIcon size={12} className="inline mr-1" />
                                  {statusCfg.label}
                                </span>
                                <span className="text-sm font-medium text-gray-800 truncate">
                                  {r.customer_name}
                                </span>
                                <span className="text-sm text-gray-500 truncate hidden sm:inline">
                                  {r.customer_email}
                                </span>
                                {r.promotion_code && (
                                  <span className="text-[11px] font-bold px-1.5 py-0.5 border border-purple-200 bg-purple-50 text-purple-700 rounded-sm shrink-0 hidden sm:inline-flex items-center gap-0.5">
                                    <Tag size={10} />
                                    {r.promotion_code}
                                  </span>
                                )}
                                <span className="text-sm font-bold text-gray-800 ml-auto shrink-0">
                                  {r.discount_amount > 0 ? (
                                    <span className="flex items-center gap-1.5">
                                      <span className="text-gray-400 line-through text-xs font-normal">
                                        {r.total_price.toLocaleString()}
                                      </span>
                                      {(r.total_price - r.discount_amount).toLocaleString()}円
                                    </span>
                                  ) : (
                                    <>{r.total_price.toLocaleString()}円</>
                                  )}
                                </span>
                                {isExpanded ? (
                                  <ChevronUp size={16} className="text-gray-400 shrink-0" />
                                ) : (
                                  <ChevronDown size={16} className="text-gray-400 shrink-0" />
                                )}
                              </button>
                              {isExpanded && (
                                <div className="px-4 pb-4 bg-gray-50 border-t border-gray-100">
                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 py-4 text-sm">
                                    <div>
                                      <span className="text-gray-500 text-xs">お名前</span>
                                      <p className="font-medium text-gray-800">{r.customer_name}</p>
                                    </div>
                                    <div>
                                      <span className="text-gray-500 text-xs">メールアドレス</span>
                                      <p className="font-medium text-gray-800">{r.customer_email}</p>
                                    </div>
                                    <div>
                                      <span className="text-gray-500 text-xs">電話番号</span>
                                      <p className="font-medium text-gray-800">{r.customer_phone}</p>
                                    </div>
                                    {r.address && (
                                      <div>
                                        <span className="text-gray-500 text-xs">住所</span>
                                        <p className="font-medium text-gray-800">{r.address}</p>
                                      </div>
                                    )}
                                    {r.purpose && (
                                      <div>
                                        <span className="text-gray-500 text-xs">利用目的</span>
                                        <p className="font-medium text-gray-800">{r.purpose}</p>
                                      </div>
                                    )}
                                    {r.notes && (
                                      <div className="sm:col-span-2">
                                        <span className="text-gray-500 text-xs">その他</span>
                                        <p className="font-medium text-gray-800">{r.notes}</p>
                                      </div>
                                    )}
                                    {(r.discount_amount > 0 || r.promotion_code) && (
                                      <div className="sm:col-span-2 lg:col-span-3 bg-purple-50 border border-purple-100 rounded-sm p-3">
                                        <span className="text-purple-600 text-xs font-bold flex items-center gap-1 mb-1.5">
                                          <Tag size={12} />
                                          クーポン利用
                                        </span>
                                        <div className="flex flex-wrap gap-4 text-sm">
                                          {r.promotion_code && (
                                            <div>
                                              <span className="text-gray-500 text-xs">コード</span>
                                              <p className="font-bold text-purple-700">{r.promotion_code}</p>
                                            </div>
                                          )}
                                          <div>
                                            <span className="text-gray-500 text-xs">定価</span>
                                            <p className="font-medium text-gray-800">{r.total_price.toLocaleString()}円</p>
                                          </div>
                                          <div>
                                            <span className="text-gray-500 text-xs">割引額</span>
                                            <p className="font-medium text-red-600">-{r.discount_amount.toLocaleString()}円</p>
                                          </div>
                                          <div>
                                            <span className="text-gray-500 text-xs">実際の支払額</span>
                                            <p className="font-bold text-gray-900">{(r.total_price - r.discount_amount).toLocaleString()}円</p>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                    <div>
                                      <span className="text-gray-500 text-xs">決済ステータス</span>
                                      <p className="font-medium text-gray-800">
                                        {r.stripe_payment_intent_id ? "入金済み" : r.stripe_session_id ? "決済セッション作成済み" : "未決済"}
                                      </p>
                                    </div>
                                    {r.stripe_payment_intent_id && (
                                      <div>
                                        <span className="text-gray-500 text-xs">Stripe Payment ID</span>
                                        <p className="font-mono text-xs text-gray-600 break-all">{r.stripe_payment_intent_id}</p>
                                      </div>
                                    )}
                                    <div>
                                      <span className="text-gray-500 text-xs">予約登録日時</span>
                                      <p className="font-medium text-gray-800">
                                        {new Date(r.created_at).toLocaleString("ja-JP")}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Cancel / Refund actions */}
                                  {r.status !== "cancelled" && (
                                    <div className="border-t border-gray-200 pt-4">
                                      {isCancelling ? (
                                        <div className="bg-red-50 border border-red-200 rounded-sm p-4">
                                          <p className="text-sm font-bold text-red-800 mb-3">
                                            この予約をキャンセルしますか？
                                          </p>
                                          {r.stripe_payment_intent_id && (
                                            <label className="flex items-center gap-2 text-sm text-gray-700 mb-4 cursor-pointer">
                                              <input
                                                type="checkbox"
                                                checked={cancelRefund}
                                                onChange={(e) => setCancelRefund(e.target.checked)}
                                                className="w-4 h-4 rounded border-gray-300"
                                              />
                                              <Undo2 size={14} className="text-blue-600" />
                                              Stripe経由で全額返金する
                                            </label>
                                          )}
                                          <div className="flex gap-2">
                                            <button
                                              onClick={() => handleCancel(r.id, cancelRefund && !!r.stripe_payment_intent_id)}
                                              className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 text-sm rounded-sm transition-colors flex items-center gap-1.5"
                                            >
                                              <Ban size={14} />
                                              {cancelRefund && r.stripe_payment_intent_id ? "キャンセル＋返金" : "キャンセルのみ"}
                                            </button>
                                            <button
                                              onClick={() => setCancellingId(null)}
                                              className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold px-4 py-2 text-sm rounded-sm transition-colors"
                                            >
                                              やめる
                                            </button>
                                          </div>
                                        </div>
                                      ) : (
                                        <button
                                          onClick={() => {
                                            setCancellingId(r.id);
                                            setCancelRefund(true);
                                          }}
                                          className="text-red-600 hover:text-red-700 text-sm font-bold flex items-center gap-1.5 transition-colors"
                                        >
                                          <Ban size={14} />
                                          キャンセル
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

        {/* ============== TAB: スロット管理 ============== */}
        {tab === "availability" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Calendar */}
            <div className="bg-white border border-gray-200 rounded-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => setAvailMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
                  className="p-2 hover:bg-gray-100 transition-colors rounded-sm"
                >
                  <ChevronLeft size={20} />
                </button>
                <h2 className="text-lg font-bold text-gray-900">
                  {availMonth.getFullYear()}年{availMonth.getMonth() + 1}月
                </h2>
                <button
                  onClick={() => setAvailMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
                  className="p-2 hover:bg-gray-100 transition-colors rounded-sm"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              {availLoading ? (
                <div className="text-center py-12 text-gray-500">読み込み中...</div>
              ) : (
                <div className="grid grid-cols-7 gap-1 text-center">
                  {["日", "月", "火", "水", "木", "金", "土"].map((d) => (
                    <div
                      key={d}
                      className={`text-xs font-bold py-2 ${
                        d === "日" ? "text-red-500" : d === "土" ? "text-blue-500" : "text-gray-500"
                      }`}
                    >
                      {d}
                    </div>
                  ))}
                  {calendarDays.map((date, i) => {
                    if (!date) return <div key={`empty-${i}`} />;
                    const isPast = date < todayDate;
                    const dateStr = date.toISOString().split("T")[0];
                    const slots = getAvailableSlots(date);
                    const hasSlots = slots.length > 0;
                    const closedCount = (closedSlots[dateStr] || []).length;
                    const bookedCount = (bookedSlotsMap[dateStr] || []).length;
                    const isSelected = selectedDate?.toDateString() === date.toDateString();
                    const dayOfWeek = date.getDay();

                    return (
                      <button
                        key={dateStr}
                        disabled={isPast || !hasSlots}
                        onClick={() => setSelectedDate(date)}
                        className={`py-2 text-sm transition-colors relative rounded-sm ${
                          isSelected
                            ? "bg-blue-600 text-white font-bold"
                            : isPast || !hasSlots
                              ? "text-gray-300 cursor-not-allowed"
                              : "hover:bg-gray-100 cursor-pointer"
                        } ${
                          !isSelected && !isPast && hasSlots && dayOfWeek === 0
                            ? "text-red-500"
                            : !isSelected && !isPast && hasSlots && dayOfWeek === 6
                              ? "text-blue-500"
                              : ""
                        }`}
                      >
                        {date.getDate()}
                        {!isPast && hasSlots && (closedCount > 0 || bookedCount > 0) && (
                          <div className="flex items-center justify-center gap-0.5 mt-0.5">
                            {closedCount > 0 && (
                              <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white/60" : "bg-red-400"}`} />
                            )}
                            {bookedCount > 0 && (
                              <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white/60" : "bg-green-400"}`} />
                            )}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-400" />
                  閉鎖あり
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-400" />
                  予約あり
                </span>
              </div>
            </div>

            {/* Slot Detail */}
            <div className="bg-white border border-gray-200 rounded-sm p-6">
              {selectedDate ? (
                <>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {selectedDate.toLocaleDateString("ja-JP", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      weekday: "short",
                    })}
                  </h3>
                  <p className="text-sm text-gray-500 mb-6">
                    各スロットの開放/閉鎖を切り替えてください
                  </p>

                  {selectedDateSlots.length === 0 ? (
                    <p className="text-gray-500 text-sm py-8 text-center">
                      この日には利用可能なスロットがありません
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {selectedDateSlots.map((slot) => {
                        const dateStr = selectedDate.toISOString().split("T")[0];
                        const isOpen = !slot.isClosed;
                        const isSaving = slotSaving === slot.hour;

                        return (
                          <div
                            key={slot.hour}
                            className={`flex items-center justify-between p-3 border rounded-sm transition-colors ${
                              slot.isBooked
                                ? "border-green-200 bg-green-50"
                                : slot.isClosed
                                  ? "border-red-200 bg-red-50"
                                  : "border-gray-200"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-mono text-gray-700 w-28">
                                {formatTimeSlot(slot.hour)}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatPrice(slot.price)}
                              </span>
                              {slot.isBooked && (
                                <span className="text-[11px] font-bold px-1.5 py-0.5 bg-green-100 text-green-700 border border-green-200 rounded-sm">
                                  予約済み
                                </span>
                              )}
                            </div>

                            {slot.isBooked ? (
                              <Lock size={16} className="text-gray-400" />
                            ) : (
                              <button
                                onClick={() => toggleSlot(dateStr, slot.hour, slot.isClosed)}
                                disabled={isSaving}
                                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-sm transition-colors ${
                                  isOpen
                                    ? "bg-green-600 hover:bg-green-700 text-white"
                                    : "bg-red-100 hover:bg-red-200 text-red-700 border border-red-300"
                                } ${isSaving ? "opacity-50" : ""}`}
                              >
                                {isSaving ? (
                                  <RefreshCw size={12} className="animate-spin" />
                                ) : isOpen ? (
                                  <Unlock size={12} />
                                ) : (
                                  <Lock size={12} />
                                )}
                                {isOpen ? "開放中" : "閉鎖中"}
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <CalendarDays size={48} strokeWidth={1} />
                  <p className="mt-4 text-sm">カレンダーから日付を選択してください</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
