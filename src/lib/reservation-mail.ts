/**
 * 予約関連メールの文面
 * 管理画面（雨天中止のプレビュー）からも使うため、サーバー専用の処理は置かない
 */
import { formatPrice, formatTimeSlot } from "@/lib/pricing";
import { CANCEL_POLICY, CONTACT_PHONE, EXIT_NOTICE, RAIN_CANCEL_NOTICE } from "@/lib/booking-notice";

export const CANCEL_POLICY_LINES = [
  ...CANCEL_POLICY.map((p) => `・${p.period}：${p.fee}`),
  `・${RAIN_CANCEL_NOTICE}`,
];

const SIGNATURE = [
  "――――――――――――――――――――",
  "YS-BASE（Y.S.C.C.横浜 天然芝スポーツパーク）",
  "〒246-0035 神奈川県横浜市瀬谷区下瀬谷1丁目41-4",
  `TEL: ${CONTACT_PHONE}`,
  "https://ys-base.yscc1986.net",
  "――――――――――――――――――――",
].join("\n");

export function formatDateLongJP(dateKey: string): string {
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(new Date(`${dateKey}T00:00:00+09:00`));
}

export interface MailReservationRow {
  reservation_date: string;
  slot_hour: number;
  total_price: number;
  discount_amount?: number | null;
  customer_name: string;
}

function slotLines(rows: MailReservationRow[]): string[] {
  return [...rows]
    .sort((a, b) => a.slot_hour - b.slot_hour)
    .map((r) => `　${formatTimeSlot(r.slot_hour)}`);
}

function paidAmount(rows: MailReservationRow[]): number {
  return rows.reduce((sum, r) => sum + r.total_price - (r.discount_amount || 0), 0);
}

/** 予約完了（支払い確定）メール */
export function buildConfirmationMail(rows: MailReservationRow[]): { subject: string; text: string } {
  const first = rows[0];
  const date = formatDateLongJP(first.reservation_date);
  const subtotal = rows.reduce((s, r) => s + r.total_price, 0);
  const discount = rows.reduce((s, r) => s + (r.discount_amount || 0), 0);

  const lines = [
    `${first.customer_name} 様`,
    "",
    "YS-BASE をご予約いただきありがとうございます。",
    "お支払いを確認し、ご予約が確定しました。",
    "",
    "■ ご予約内容",
    `日程: ${date}`,
    "時間:",
    ...slotLines(rows),
    `利用料金: ${formatPrice(subtotal)}（税込）`,
    ...(discount > 0 ? [`割引: -${formatPrice(discount)}`, `お支払い金額: ${formatPrice(paidAmount(rows))}（税込）`] : []),
    "",
    "■ ご利用にあたってのお願い",
    EXIT_NOTICE,
    "",
    "■ キャンセルポリシー",
    ...CANCEL_POLICY_LINES,
    `キャンセル・変更をご希望の場合は、お電話（${CONTACT_PHONE}）またはこのメールへの返信でご連絡ください。`,
    "",
    "当日のご来場をお待ちしております。",
    "",
    SIGNATURE,
  ];
  return { subject: `【YS-BASE】ご予約確定のお知らせ（${date}）`, text: lines.join("\n") };
}

export interface AdminMailReservationRow extends MailReservationRow {
  customer_email: string;
  customer_phone: string;
  address?: string | null;
  purpose?: string | null;
  notes?: string | null;
  promotion_code?: string | null;
}

/** 運営宛て「新規予約のお知らせ」 */
export function buildAdminBookingMail(rows: AdminMailReservationRow[]): { subject: string; text: string } {
  const first = rows[0];
  const sorted = [...rows].sort((a, b) => a.slot_hour - b.slot_hour);
  const shortDate = new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    month: "numeric",
    day: "numeric",
    weekday: "short",
  }).format(new Date(`${first.reservation_date}T00:00:00+09:00`));
  const discount = rows.reduce((s, r) => s + (r.discount_amount || 0), 0);

  const lines = [
    "YS-BASE に新しい予約が入りました（お支払い済み・予約確定）。",
    "このメールに返信すると、予約者に直接届きます。",
    "",
    "■ 予約内容",
    `日程: ${formatDateLongJP(first.reservation_date)}`,
    "時間:",
    ...slotLines(rows),
    `お支払い金額: ${formatPrice(paidAmount(rows))}（税込）`,
    ...(discount > 0 ? [`割引: -${formatPrice(discount)}（コード: ${first.promotion_code || "-"}）`] : []),
    "",
    "■ 予約者",
    `お名前: ${first.customer_name}`,
    `電話番号: ${first.customer_phone || "-"}`,
    `メールアドレス: ${first.customer_email || "-"}`,
    `住所: ${first.address || "-"}`,
    `利用目的: ${first.purpose || "-"}`,
    "その他:",
    first.notes || "-",
    "",
    "管理画面: https://ys-base.yscc1986.net/admin",
  ];
  return {
    subject: `[YS-BASE 新規予約] ${shortDate} ${formatTimeSlot(sorted[0].slot_hour).split("〜")[0]}〜 ${first.customer_name} 様`,
    text: lines.join("\n"),
  };
}

/** 雨天中止メールの初期文面。管理画面で編集してから送る */
export function rainCancelTemplate(): { subject: string; body: string } {
  return {
    subject: "【YS-BASE】雨天による利用中止と返金のお知らせ（{日程}）",
    body: [
      "{お名前} 様",
      "",
      "YS-BASE をご予約いただきありがとうございます。",
      "誠に申し訳ございませんが、雨天によりコートのコンディションが確保できないため、",
      "下記のご予約の利用を中止させていただくこととなりました。",
      "",
      "■ 中止となったご予約",
      "日程: {日程}",
      "時間:",
      "{時間}",
      "",
      "■ 返金について",
      "お支払いいただいた利用料金 {返金額} を全額返金いたしました。",
      "返金が反映されるまでの期間は、お支払い方法（クレジットカード・PayPay）やカード会社により異なります。",
      "",
      "キャンセル料はかかりません。",
      "またのご利用を心よりお待ちしております。",
      "",
      SIGNATURE,
    ].join("\n"),
  };
}

/** {お名前} {日程} {時間} {返金額} を差し込む */
export function fillRainTemplate(template: string, rows: MailReservationRow[]): string {
  const first = rows[0];
  return template
    .replaceAll("{お名前}", first.customer_name)
    .replaceAll("{日程}", formatDateLongJP(first.reservation_date))
    .replaceAll("{時間}", slotLines(rows).join("\n"))
    .replaceAll("{返金額}", formatPrice(paidAmount(rows)));
}
