"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Filter,
  CalendarDays,
  CircleCheck,
  CircleX,
  Clock3,
  CheckCircle2,
} from "lucide-react";

interface Reservation {
  id: string;
  reservation_date: string;
  slot_hour: number;
  total_price: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
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

export default function AdminPage() {
  const [apiKey, setApiKey] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

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
          alert("認証に失敗しました。APIキーを確認してください。");
          return;
        }
        throw new Error("Failed to fetch");
      }
      const data = await res.json();
      setReservations(data.reservations || []);
      setAuthenticated(true);
    } catch {
      alert("データの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, [apiKey, statusFilter, dateFrom, dateTo]);

  useEffect(() => {
    if (authenticated) {
      fetchReservations();
    }
  }, [statusFilter, dateFrom, dateTo, authenticated, fetchReservations]);

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
      .reduce((sum, r) => sum + r.total_price, 0),
  };

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
          <h1 className="text-lg font-black text-gray-900">YS-BASE 予約管理</h1>
          <button
            onClick={fetchReservations}
            disabled={loading}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            更新
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
                    <h3 className="font-bold text-sm text-gray-800">
                      {formatDate(date)}
                    </h3>
                    <span className="text-xs text-gray-500">{items.length}件</span>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {items.map((r) => {
                      const statusCfg = STATUS_CONFIG[r.status] || STATUS_CONFIG.pending;
                      const StatusIcon = statusCfg.Icon;
                      const isExpanded = expandedId === r.id;

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
                            <span className="text-sm font-bold text-gray-800 ml-auto shrink-0">
                              {r.total_price.toLocaleString()}円
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
      </div>
    </div>
  );
}
