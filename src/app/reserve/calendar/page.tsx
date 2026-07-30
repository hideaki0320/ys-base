"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  Users,
  CreditCard,
} from "lucide-react";
import { getAvailableSlots, formatPrice, formatTimeSlot } from "@/lib/pricing";

type Step = "date" | "slots" | "form" | "confirm";

interface ReservationData {
  date: Date | null;
  selectedSlots: number[];
  name: string;
  email: string;
  phone: string;
  teamName: string;
  playerCount: string;
  notes: string;
}

export default function ReservationCalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [step, setStep] = useState<Step>("date");
  const [data, setData] = useState<ReservationData>({
    date: null,
    selectedSlots: [],
    name: "",
    email: "",
    phone: "",
    teamName: "",
    playerCount: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days: (Date | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(new Date(year, month, d));
    }
    return days;
  }, [currentMonth]);

  const availableSlots = useMemo(() => {
    if (!data.date) return [];
    return getAvailableSlots(data.date);
  }, [data.date]);

  const totalPrice = useMemo(() => {
    return availableSlots
      .filter((s) => data.selectedSlots.includes(s.hour))
      .reduce((sum, s) => sum + s.price, 0);
  }, [availableSlots, data.selectedSlots]);

  function prevMonth() {
    setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1));
  }
  function nextMonth() {
    setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1));
  }

  function selectDate(date: Date) {
    setData((d) => ({ ...d, date, selectedSlots: [] }));
    setStep("slots");
  }

  function toggleSlot(hour: number) {
    setData((d) => ({
      ...d,
      selectedSlots: d.selectedSlots.includes(hour)
        ? d.selectedSlots.filter((h) => h !== hour)
        : [...d.selectedSlots, hour].sort((a, b) => a - b),
    }));
  }

  function isDateSelectable(date: Date): boolean {
    if (date < today) return false;
    const slots = getAvailableSlots(date);
    return slots.length > 0;
  }

  async function handleSubmit() {
    setSubmitting(true);
    // In production, this would call the API to create a Stripe checkout session
    // For now, simulate the process
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setCompleted(true);
    setSubmitting(false);
  }

  if (completed) {
    return (
      <div className="pt-20 min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="bg-white p-8 sm:p-12 border border-gray-200">
            <div className="w-16 h-16 bg-green-100 flex items-center justify-center mx-auto mb-6">
              <CreditCard size={32} className="text-green-600" />
            </div>
            <h1 className="text-2xl font-black text-primary mb-4">予約を受け付けました</h1>
            <p className="text-gray-700 leading-relaxed mb-6">
              ご予約いただきありがとうございます。
              <br />
              確認メールをお送りしましたのでご確認ください。
              <br />
              お支払い確認後、利用確定メールをお送りいたします。
            </p>
            <div className="bg-gray-50 p-4 text-left text-sm space-y-2 mb-6">
              <p>
                <strong>日程：</strong>
                {data.date?.toLocaleDateString("ja-JP", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  weekday: "short",
                })}
              </p>
              <p>
                <strong>時間：</strong>
                {data.selectedSlots.map((h) => formatTimeSlot(h)).join("、")}
              </p>
              <p>
                <strong>合計金額：</strong>
                {formatPrice(totalPrice)}（税込）
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold px-8 py-3 transition-colors"
            >
              トップに戻る
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
        <h1 className="text-2xl sm:text-3xl font-black text-primary mb-2">コート予約</h1>
        <p className="text-gray-600 mb-8">ご希望の日時を選んで予約してください。</p>

        {/* Progress Steps */}
        <div className="flex items-center gap-2 mb-10">
          {[
            { key: "date", label: "日程選択" },
            { key: "slots", label: "時間選択" },
            { key: "form", label: "情報入力" },
            { key: "confirm", label: "確認" },
          ].map((s, i) => (
            <div key={s.key} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 flex items-center justify-center text-sm font-bold ${
                  step === s.key
                    ? "bg-accent text-primary"
                    : ["date", "slots", "form", "confirm"].indexOf(step) > i
                      ? "bg-primary text-white"
                      : "bg-gray-200 text-gray-500"
                }`}
              >
                {i + 1}
              </div>
              <span
                className={`text-sm hidden sm:inline ${
                  step === s.key ? "font-bold text-primary" : "text-gray-500"
                }`}
              >
                {s.label}
              </span>
              {i < 3 && (
                <div className="w-4 sm:w-8 h-px bg-gray-300" />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Date Selection */}
        {step === "date" && (
          <div className="bg-white border border-gray-200 p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={prevMonth}
                className="p-2 hover:bg-gray-100 transition-colors"
                aria-label="前の月"
              >
                <ChevronLeft size={20} />
              </button>
              <h2 className="text-lg font-bold text-primary">
                {currentMonth.getFullYear()}年{currentMonth.getMonth() + 1}月
              </h2>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-gray-100 transition-colors"
                aria-label="次の月"
              >
                <ChevronRight size={20} />
              </button>
            </div>
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
                const selectable = isDateSelectable(date);
                const isToday =
                  date.toDateString() === today.toDateString();
                const isSelected =
                  data.date?.toDateString() === date.toDateString();
                const dayOfWeek = date.getDay();

                return (
                  <button
                    key={date.toISOString()}
                    disabled={!selectable}
                    onClick={() => selectDate(date)}
                    className={`py-3 text-sm transition-colors relative ${
                      isSelected
                        ? "bg-accent text-primary font-bold"
                        : selectable
                          ? "hover:bg-accent/10 cursor-pointer"
                          : "text-gray-300 cursor-not-allowed"
                    } ${
                      selectable && dayOfWeek === 0
                        ? "text-red-500"
                        : selectable && dayOfWeek === 6
                          ? "text-blue-500"
                          : ""
                    }`}
                  >
                    {date.getDate()}
                    {isToday && (
                      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-accent rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
            <p className="mt-4 text-xs text-gray-500">
              ※グレーの日付は予約不可です。
            </p>
          </div>
        )}

        {/* Step 2: Time Slot Selection */}
        {step === "slots" && data.date && (
          <div className="bg-white border border-gray-200 p-6 sm:p-8">
            <button
              onClick={() => setStep("date")}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary mb-4 transition-colors"
            >
              <ChevronLeft size={16} />
              日程選択に戻る
            </button>
            <div className="flex items-center gap-3 mb-6">
              <Calendar size={20} className="text-accent" />
              <h2 className="text-lg font-bold text-primary">
                {data.date.toLocaleDateString("ja-JP", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  weekday: "short",
                })}
              </h2>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              利用する時間帯を選択してください（複数選択可）。
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {availableSlots.map((slot) => {
                const isSelected = data.selectedSlots.includes(slot.hour);
                return (
                  <button
                    key={slot.hour}
                    onClick={() => toggleSlot(slot.hour)}
                    className={`flex items-center justify-between p-4 border transition-all ${
                      isSelected
                        ? "border-accent bg-accent/10 ring-1 ring-accent"
                        : "border-gray-200 hover:border-accent/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Clock size={16} className={isSelected ? "text-accent" : "text-gray-400"} />
                      <span className="font-medium">{formatTimeSlot(slot.hour)}</span>
                    </div>
                    <span className={`font-bold ${isSelected ? "text-accent" : "text-gray-600"}`}>
                      {formatPrice(slot.price)}
                    </span>
                  </button>
                );
              })}
            </div>
            {data.selectedSlots.length > 0 && (
              <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-6">
                <div>
                  <p className="text-sm text-gray-600">
                    {data.selectedSlots.length}時間選択中
                  </p>
                  <p className="text-xl font-black text-primary">
                    合計 {formatPrice(totalPrice)}
                    <span className="text-sm font-normal text-gray-500 ml-1">（税込）</span>
                  </p>
                </div>
                <button
                  onClick={() => setStep("form")}
                  className="bg-accent hover:bg-accent-dark text-primary font-bold px-6 py-3 transition-colors flex items-center gap-2"
                >
                  次へ
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Information Form */}
        {step === "form" && (
          <div className="bg-white border border-gray-200 p-6 sm:p-8">
            <button
              onClick={() => setStep("slots")}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary mb-4 transition-colors"
            >
              <ChevronLeft size={16} />
              時間選択に戻る
            </button>
            <h2 className="text-lg font-bold text-primary mb-6">ご利用者情報</h2>
            <div className="space-y-6 max-w-lg">
              <div>
                <label htmlFor="res-name" className="flex items-center gap-2 text-sm font-bold text-primary mb-2">
                  <User size={16} />
                  お名前 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="res-name"
                  value={data.name}
                  onChange={(e) => setData((d) => ({ ...d, name: e.target.value }))}
                  required
                  className="w-full border border-gray-300 px-4 py-3 text-sm focus:border-accent focus:ring-1 focus:ring-accent outline-none"
                />
              </div>
              <div>
                <label htmlFor="res-email" className="flex items-center gap-2 text-sm font-bold text-primary mb-2">
                  <Mail size={16} />
                  メールアドレス <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="res-email"
                  value={data.email}
                  onChange={(e) => setData((d) => ({ ...d, email: e.target.value }))}
                  required
                  className="w-full border border-gray-300 px-4 py-3 text-sm focus:border-accent focus:ring-1 focus:ring-accent outline-none"
                />
              </div>
              <div>
                <label htmlFor="res-phone" className="flex items-center gap-2 text-sm font-bold text-primary mb-2">
                  <Phone size={16} />
                  電話番号 <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="res-phone"
                  value={data.phone}
                  onChange={(e) => setData((d) => ({ ...d, phone: e.target.value }))}
                  required
                  className="w-full border border-gray-300 px-4 py-3 text-sm focus:border-accent focus:ring-1 focus:ring-accent outline-none"
                />
              </div>
              <div>
                <label htmlFor="res-team" className="flex items-center gap-2 text-sm font-bold text-primary mb-2">
                  <Users size={16} />
                  チーム名・団体名
                </label>
                <input
                  type="text"
                  id="res-team"
                  value={data.teamName}
                  onChange={(e) => setData((d) => ({ ...d, teamName: e.target.value }))}
                  className="w-full border border-gray-300 px-4 py-3 text-sm focus:border-accent focus:ring-1 focus:ring-accent outline-none"
                />
              </div>
              <div>
                <label htmlFor="res-count" className="flex items-center gap-2 text-sm font-bold text-primary mb-2">
                  利用人数（目安）
                </label>
                <input
                  type="text"
                  id="res-count"
                  value={data.playerCount}
                  onChange={(e) => setData((d) => ({ ...d, playerCount: e.target.value }))}
                  placeholder="例：20名"
                  className="w-full border border-gray-300 px-4 py-3 text-sm focus:border-accent focus:ring-1 focus:ring-accent outline-none"
                />
              </div>
              <div>
                <label htmlFor="res-notes" className="text-sm font-bold text-primary mb-2 block">
                  備考
                </label>
                <textarea
                  id="res-notes"
                  value={data.notes}
                  onChange={(e) => setData((d) => ({ ...d, notes: e.target.value }))}
                  rows={3}
                  className="w-full border border-gray-300 px-4 py-3 text-sm focus:border-accent focus:ring-1 focus:ring-accent outline-none resize-vertical"
                />
              </div>
            </div>
            <div className="mt-8 flex justify-end">
              <button
                onClick={() => {
                  if (data.name && data.email && data.phone) {
                    setStep("confirm");
                  }
                }}
                disabled={!data.name || !data.email || !data.phone}
                className="bg-accent hover:bg-accent-dark text-primary font-bold px-6 py-3 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                確認へ
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Confirmation */}
        {step === "confirm" && data.date && (
          <div className="bg-white border border-gray-200 p-6 sm:p-8">
            <button
              onClick={() => setStep("form")}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary mb-4 transition-colors"
            >
              <ChevronLeft size={16} />
              情報入力に戻る
            </button>
            <h2 className="text-lg font-bold text-primary mb-6">予約内容の確認</h2>

            <div className="space-y-4 mb-8">
              <div className="bg-gray-50 p-4 space-y-3 text-sm">
                <h3 className="font-bold text-primary">予約情報</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-gray-500">日程</span>
                    <p className="font-medium">
                      {data.date.toLocaleDateString("ja-JP", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        weekday: "short",
                      })}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">時間</span>
                    <p className="font-medium">
                      {data.selectedSlots.map((h) => formatTimeSlot(h)).join("、")}
                    </p>
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">合計金額</span>
                  <p className="text-xl font-black text-primary">
                    {formatPrice(totalPrice)}
                    <span className="text-sm font-normal text-gray-500 ml-1">（税込）</span>
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 space-y-3 text-sm">
                <h3 className="font-bold text-primary">ご利用者情報</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-gray-500">お名前</span>
                    <p className="font-medium">{data.name}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">メールアドレス</span>
                    <p className="font-medium">{data.email}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">電話番号</span>
                    <p className="font-medium">{data.phone}</p>
                  </div>
                  {data.teamName && (
                    <div>
                      <span className="text-gray-500">チーム名</span>
                      <p className="font-medium">{data.teamName}</p>
                    </div>
                  )}
                  {data.playerCount && (
                    <div>
                      <span className="text-gray-500">利用人数</span>
                      <p className="font-medium">{data.playerCount}</p>
                    </div>
                  )}
                </div>
                {data.notes && (
                  <div>
                    <span className="text-gray-500">備考</span>
                    <p className="font-medium">{data.notes}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 p-4 mb-8 text-sm text-yellow-800">
              <p className="font-bold mb-1">キャンセルポリシー</p>
              <p>
                利用日の31日前までのキャンセルは無料。30日前から当日までは利用料金100%のキャンセル料がかかります。
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-gray-500">
                「予約を確定する」をクリックすると、利用規約に同意したものとみなされます。
              </p>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-accent hover:bg-accent-dark text-primary font-bold px-8 py-4 transition-colors flex items-center gap-2 disabled:opacity-50 w-full sm:w-auto justify-center"
              >
                {submitting ? (
                  "処理中..."
                ) : (
                  <>
                    <CreditCard size={18} />
                    予約を確定する
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
