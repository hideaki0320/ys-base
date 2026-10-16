/**
 * 予約可能期間: 今日（日本時間）から 1 ヶ月後の同じ日まで（当日を含む）
 * 例: 10/8 → 11/8 まで。1/31 → 2/28（月末に丸める）
 * クライアント（カレンダー）とサーバー（checkout）の両方で使う。
 */

export const BOOKING_WINDOW_LABEL = "1ヶ月先（同じ日付）まで";

/**
 * 予約受付の最終日（プレオープン期間の終わり）。
 * 設定中は「1ヶ月先まで」の制限を使わず、この日まで予約できる。この日より後は選べない・予約できない。
 * 受付を通常運用に戻すときは null にする（1ヶ月先までの制限に戻る）。
 */
export const BOOKING_LAST_DATE: string | null = "2026-11-20";

/** 芝生メンテナンスで利用できない曜日（until の日まで）。0=日 … 6=土 */
export const MAINTENANCE_CLOSURE = {
  until: "2026-11-20",
  weekdays: [2, 5], // 火・金
  note: "11月20日までの火曜日・金曜日は、芝生のメンテナンスのためご利用いただけません。",
} as const;

/** YYYY-MM-DD が芝生メンテナンスの休業日か */
export function isMaintenanceDay(dateKey: string): boolean {
  if (dateKey > MAINTENANCE_CLOSURE.until) return false;
  const [y, m, d] = dateKey.split("-").map(Number);
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return (MAINTENANCE_CLOSURE.weekdays as readonly number[]).includes(dow);
}

/** カレンダー・予約方法ページに出す注記 */
export function bookingNotes(now: Date = new Date()): string[] {
  const notes: string[] = [];
  if (BOOKING_LAST_DATE) {
    const [, m, d] = BOOKING_LAST_DATE.split("-").map(Number);
    notes.push(`プレオープン期間中は、${m}月${d}日までのご予約を受け付けています。`);
  } else {
    notes.push(`${BOOKING_WINDOW_LABEL}予約できます。`);
  }
  if (todayKeyJST(now) <= MAINTENANCE_CLOSURE.until) notes.push(MAINTENANCE_CLOSURE.note);
  return notes;
}


/** 日本時間の今日を YYYY-MM-DD で返す（サーバーの TZ 設定に依存しない） */
export function todayKeyJST(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** 予約できる最終日を YYYY-MM-DD で返す */
export function maxDateKeyJST(now: Date = new Date()): string {
  if (BOOKING_LAST_DATE) return BOOKING_LAST_DATE;
  const [y, m, d] = todayKeyJST(now).split("-").map(Number);
  const ny = m === 12 ? y + 1 : y;
  const nm = m === 12 ? 1 : m + 1;
  const lastDay = new Date(ny, nm, 0).getDate();
  const nd = Math.min(d, lastDay);
  return `${ny}-${String(nm).padStart(2, "0")}-${String(nd).padStart(2, "0")}`;
}

/** YYYY-MM-DD が予約可能期間内か */
export function isWithinBookingWindow(dateKey: string, now: Date = new Date()): boolean {
  return dateKey >= todayKeyJST(now) && dateKey <= maxDateKeyJST(now) && !isMaintenanceDay(dateKey);
}
