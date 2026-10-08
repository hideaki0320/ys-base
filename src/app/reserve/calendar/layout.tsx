import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "空き状況・コート予約",
  description: "YS-BASE（横浜市瀬谷区の天然芝サッカーコート）の空き状況カレンダー。1時間単位でオンライン予約・決済（クレジットカード・PayPay）ができます。",
  alternates: { canonical: "/reserve/calendar" },
};

export default function ReserveCalendarLayout({ children }: { children: React.ReactNode }) {
  return children;
}
