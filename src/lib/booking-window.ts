/**
 * 予約可能期間: 今日（日本時間）から 1 ヶ月後の同じ日まで（当日を含む）
 * 例: 10/8 → 11/8 まで。1/31 → 2/28（月末に丸める）
 * クライアント（カレンダー）とサーバー（checkout）の両方で使う。
 */

export const BOOKING_WINDOW_LABEL = "1ヶ月先（同じ日付）まで";

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
  const [y, m, d] = todayKeyJST(now).split("-").map(Number);
  const ny = m === 12 ? y + 1 : y;
  const nm = m === 12 ? 1 : m + 1;
  const lastDay = new Date(ny, nm, 0).getDate();
  const nd = Math.min(d, lastDay);
  return `${ny}-${String(nm).padStart(2, "0")}-${String(nd).padStart(2, "0")}`;
}

/** YYYY-MM-DD が予約可能期間内か */
export function isWithinBookingWindow(dateKey: string, now: Date = new Date()): boolean {
  return dateKey >= todayKeyJST(now) && dateKey <= maxDateKeyJST(now);
}
