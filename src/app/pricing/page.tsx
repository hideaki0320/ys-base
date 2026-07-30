import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Info } from "lucide-react";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "料金表",
  description: "YS-BASEの利用料金一覧（税込）。平日¥5,500〜¥16,500、土日祝¥13,200〜¥16,500。時間帯・曜日別の詳細料金表。",
  openGraph: {
    title: "料金表 | YS-BASE",
    description: "平日¥5,500〜、土日祝¥13,200〜。時間帯・曜日別の利用料金をご確認いただけます。",
  },
};

const weekdayPrices = [
  { time: "9:00〜10:00", mon: "—", tue: "—", wed: "—", thu: "—", fri: "—", note: "メンテナンス" },
  { time: "10:00〜11:00", mon: "—", tue: "—", wed: "—", thu: "—", fri: "—", note: "メンテナンス" },
  { time: "11:00〜12:00", mon: "—", tue: "—", wed: "—", thu: "—", fri: "—", note: "地域利用" },
  { time: "12:00〜13:00", mon: "—", tue: "—", wed: "—", thu: "—", fri: "—", note: "地域利用" },
  { time: "13:00〜14:00", mon: "—", tue: "—", wed: "—", thu: "—", fri: "—", note: "地域利用" },
  { time: "14:00〜15:00", mon: "¥8,800", tue: "¥8,800", wed: "¥8,800", thu: "¥8,800", fri: "¥8,800" },
  { time: "15:00〜16:00", mon: "¥8,800", tue: "¥8,800", wed: "¥8,800", thu: "¥8,800", fri: "¥8,800" },
  { time: "16:00〜17:00", mon: "¥5,500", tue: "¥8,800", wed: "¥8,800", thu: "¥8,800", fri: "¥5,500" },
  { time: "17:00〜18:00", mon: "—", tue: "¥8,800", wed: "¥8,800", thu: "¥8,800", fri: "—" },
  { time: "18:00〜19:00", mon: "¥16,500", tue: "¥16,500", wed: "¥16,500", thu: "¥16,500", fri: "¥16,500" },
  { time: "19:00〜20:00", mon: "¥16,500", tue: "¥16,500", wed: "¥16,500", thu: "¥16,500", fri: "¥16,500" },
  { time: "20:00〜21:00", mon: "¥16,500", tue: "¥16,500", wed: "¥16,500", thu: "¥16,500", fri: "¥16,500" },
];

const weekendPrices = [
  { time: "9:00〜10:00", price: "¥13,200" },
  { time: "10:00〜11:00", price: "¥13,200" },
  { time: "11:00〜12:00", price: "¥13,200" },
  { time: "12:00〜13:00", price: "¥13,200" },
  { time: "13:00〜14:00", price: "¥13,200" },
  { time: "14:00〜15:00", price: "¥13,200" },
  { time: "15:00〜16:00", price: "¥13,200" },
  { time: "16:00〜17:00", price: "¥13,200" },
  { time: "17:00〜18:00", price: "¥13,200" },
  { time: "18:00〜19:00", price: "¥16,500" },
  { time: "19:00〜20:00", price: "¥16,500" },
  { time: "20:00〜21:00", price: "¥16,500" },
];

export default function PricingPage() {
  return (
    <>
      <PageHero title="料金表" subtitle="PRICING" />

      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-14">
            <p className="text-gray-500 text-[15px]">
              記載金額はすべて<strong className="text-primary">税込</strong>・<strong className="text-primary">1時間あたり</strong>の料金です。
            </p>
          </div>

          <div className="mb-16">
            <h2 className="text-xl sm:text-2xl font-black text-primary mb-6 section-title">
              平日（月〜金）
            </h2>
            <div className="overflow-x-auto rounded-sm border border-gray-100">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-primary text-white">
                    <th className="py-3 px-3 text-left font-bold text-[13px]">時間</th>
                    <th className="py-3 px-3 text-center font-bold text-[13px]">月</th>
                    <th className="py-3 px-3 text-center font-bold text-[13px]">火</th>
                    <th className="py-3 px-3 text-center font-bold text-[13px]">水</th>
                    <th className="py-3 px-3 text-center font-bold text-[13px]">木</th>
                    <th className="py-3 px-3 text-center font-bold text-[13px]">金</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {weekdayPrices.map((row) => (
                    <tr
                      key={row.time}
                      className={row.note ? "bg-gray-50" : "hover:bg-gray-50/50 transition-colors"}
                    >
                      <td className="py-3 px-3 font-medium text-primary text-[13px]">{row.time}</td>
                      {row.note ? (
                        <td colSpan={5} className="py-3 px-3 text-center text-gray-400 text-[13px]">
                          {row.note}
                        </td>
                      ) : (
                        <>
                          <td className="py-3 px-3 text-center text-[13px] tabular-nums">{row.mon}</td>
                          <td className="py-3 px-3 text-center text-[13px] tabular-nums">{row.tue}</td>
                          <td className="py-3 px-3 text-center text-[13px] tabular-nums">{row.wed}</td>
                          <td className="py-3 px-3 text-center text-[13px] tabular-nums">{row.thu}</td>
                          <td className="py-3 px-3 text-center text-[13px] tabular-nums">{row.fri}</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex items-start gap-2 text-[13px] text-gray-500">
              <Info size={14} className="shrink-0 mt-0.5 text-accent" />
              <p>
                平日午前（9:00〜14:00頃）はメンテナンス＋幼稚園・保育園・敬老会などの地域利用枠（3Hで10,000円）となります。
              </p>
            </div>
          </div>

          <div className="mb-16">
            <h2 className="text-xl sm:text-2xl font-black text-primary mb-6 section-title">
              土日・祝日
            </h2>
            <div className="overflow-x-auto rounded-sm border border-gray-100 max-w-lg">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-primary text-white">
                    <th className="py-3 px-4 text-left font-bold text-[13px]">時間</th>
                    <th className="py-3 px-4 text-center font-bold text-[13px]">料金（税込）</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {weekendPrices.map((row) => (
                    <tr key={row.time} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-4 font-medium text-primary text-[13px]">{row.time}</td>
                      <td className="py-3 px-4 text-center font-bold text-[13px] tabular-nums">{row.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-gray-50 p-6 sm:p-8 rounded-sm border border-gray-100">
            <h3 className="font-bold text-primary mb-4 text-sm">料金に関する注意事項</h3>
            <ul className="space-y-2.5 text-[13px] text-gray-600">
              {[
                "上記料金はコート1面あたりの料金です。",
                "ナイター利用（18:00〜21:00）は照明費を含む料金です。",
                "連続利用の場合は割引がございます。詳しくはお問い合わせください。",
                "料金は予告なく変更される場合がございます。",
              ].map((text) => (
                <li key={text} className="flex items-start gap-2">
                  <span className="w-1 h-1 bg-accent rounded-full shrink-0 mt-2" />
                  {text}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-14 text-center">
            <Link
              href="/reserve/calendar"
              className="inline-flex items-center gap-2 bg-accent hover:bg-accent-dark text-primary-dark font-bold px-8 py-3.5 text-sm transition-all rounded-sm"
            >
              コートを予約する
              <ChevronRight size={16} strokeWidth={2.5} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
