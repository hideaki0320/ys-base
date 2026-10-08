import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "お問い合わせ",
  description: "YS-BASE（横浜市瀬谷区の天然芝サッカーコート）へのお問い合わせ。予約・施設・イベント利用についてフォームからお気軽にご連絡ください。",
  alternates: { canonical: "/contact" },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
