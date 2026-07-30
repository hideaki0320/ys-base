import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Info } from "lucide-react";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "料金表",
  description: "YS-BASEの利用料金。時間帯・曜日別の料金表。",
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
          <div className="max-w-3xl mx-auto text-center mb-12">
            <p className="text-gray-600">
              記載金額はすべて<strong>税込</strong>・<strong>1時間あたり</strong>の料金です。
            </p>
          </div>

          {/* 平日料金表 */}
          <div className="mb-16">
            <h2 className="text-2xl font-black text-primary mb-6 section-title">
              平日（月〜金）
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-primary text-white">
                    <th className="py-3 px-3 text-left font-bold">時間</th>
                    <th className="py-3 px-3 text-center font-bold">月</th>
                    <th className="py-3 px-3 text-center font-bold">火</th>
                    <th className="py-3 px-3 text-center font-bold">水</th>
                    <th className="py-3 px-3 text-center font-bold">木</th>
                    <th className="py-3 px-3 text-center font-bold">金</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {weekdayPrices.map((row) => (
                    <tr
                      key={row.time}
                      className={row.note ? "bg-green-field/5" : "hover:bg-gray-50"}
                    >
                      <td className="py-3 px-3 font-medium text-primary">{row.time}</td>
                      {row.note ? (
                        <td colSpan={5} className="py-3 px-3 text-center text-gray-500 italic">
                          {row.note}
                        </td>
                      ) : (
                        <>
                          <td className="py-3 px-3 text-center">{row.mon}</td>
                          <td className="py-3 px-3 text-center">{row.tue}</td>
                          <td className="py-3 px-3 text-center">{row.wed}</td>
                          <td className="py-3 px-3 text-center">{row.thu}</td>
                          <td className="py-3 px-3 text-center">{row.fri}</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex items-start gap-2 text-sm text-gray-600">
              <Info size={16} className="shrink-0 mt-0.5" />
              <p>
                平日午前（9:00〜14:00頃）はメンテナンス＋幼稚園・保育園・敬老会などの地域利用枠（3Hで10,000円）となります。
              </p>
            </div>
          </div>

          {/* 土日料金表 */}
          <div className="mb-16">
            <h2 className="text-2xl font-black text-primary mb-6 section-title">土日・祝日</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse max-w-lg">
                <thead>
                  <tr className="bg-primary text-white">
                    <th className="py-3 px-4 text-left font-bold">時間</th>
                    <th className="py-3 px-4 text-center font-bold">料金（税込）</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {weekendPrices.map((row) => (
                    <tr key={row.time} className="hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-primary">{row.time}</td>
                      <td className="py-3 px-4 text-center font-bold">{row.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 注意事項 */}
          <div className="bg-gray-50 p-6 sm:p-8">
            <h3 className="font-bold text-primary mb-4">料金に関する注意事項</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-accent font-bold shrink-0">・</span>
                上記料金はコート1面あたりの料金です。
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent font-bold shrink-0">・</span>
                ナイター利用（18:00〜21:00）は照明費を含む料金です。
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent font-bold shrink-0">・</span>
                連続利用の場合は割引がございます。詳しくはお問い合わせください。
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent font-bold shrink-0">・</span>
                料金は予告なく変更される場合がございます。
              </li>
            </ul>
          </div>

          {/* CTA */}
          <div className="mt-12 text-center">
            <Link
              href="/reserve"
              className="inline-flex items-center gap-2 bg-accent hover:bg-accent-dark text-primary font-bold px-8 py-4 text-base transition-colors"
            >
              コートを予約する
              <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
