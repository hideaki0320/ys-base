import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "施設概要",
  description: "YS-BASEの施設情報。天然芝のメインコート・サブコート、駐車場38台完備。",
};

export default function FacilityPage() {
  return (
    <>
      <PageHero title="施設概要" subtitle="FACILITY" />

      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-2xl sm:text-3xl font-black text-primary mb-6 section-title section-title-center">
              施設案内
            </h2>
            <p className="text-gray-600 leading-[1.9] text-[15px]">
              YS-BASEは、Y.S.C.C.横浜が運営する横浜市瀬谷区のスポーツパークです。
              天然芝のサッカーコートを中心に、少年サッカーからシニアまで幅広い世代の方々にご利用いただけます。
              サッカー以外にも、フットサル、各種球技、イベントなど多様な用途でお使いいただけます。
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-16">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="relative aspect-[4/3] overflow-hidden rounded-sm group">
                <Image
                  src={`/images/court-${i}.jpg`}
                  alt={`YS-BASE コート写真${i}`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14">
            <div>
              <h3 className="text-xl font-bold text-primary mb-5 section-title">天然芝コート</h3>
              <p className="text-gray-600 leading-[1.9] text-[15px] mb-6">
                メインコートとサブコートの2面を備えています。
                天然芝ならではの柔らかなプレー感と美しいフィールドで、試合や練習をお楽しみいただけます。
              </p>
              <div className="space-y-3">
                <div className="bg-gray-50 p-5 rounded-sm border border-gray-100">
                  <h4 className="font-bold text-primary text-sm mb-1.5">メインコート</h4>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    少年サッカー（8人制）の試合が可能なサイズ。試合、練習、大会などにご利用いただけます。
                  </p>
                </div>
                <div className="bg-gray-50 p-5 rounded-sm border border-gray-100">
                  <h4 className="font-bold text-primary text-sm mb-1.5">サブコート</h4>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    ウォーミングアップやトレーニングに最適なサブコートです。
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-primary mb-5 section-title">施設情報</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-gray-100">
                    {[
                      ["敷地面積", "約6,106㎡（約1,847坪）"],
                      ["芝種類", "天然芝"],
                      ["コート数", "メインコート + サブコート"],
                      ["駐車場", "38台（砂利敷・無料）"],
                      ["フェンス", "コンクリート支柱・ナイロンネット（H=10m）"],
                      ["所在地", "横浜市瀬谷区下瀬谷1丁目（環状4号線沿い）"],
                    ].map(([label, value]) => (
                      <tr key={label}>
                        <th className="py-3.5 pr-4 text-left font-bold text-primary w-28">{label}</th>
                        <td className="py-3.5 text-gray-600">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="mt-20">
            <h3 className="text-xl font-bold text-primary mb-6 section-title section-title-center text-center">
              配置図
            </h3>
            <div className="max-w-4xl mx-auto">
              <div className="relative aspect-[16/11] overflow-hidden border border-gray-100 rounded-sm">
                <Image
                  src="/images/site-plan.jpg"
                  alt="YS-BASE 配置図"
                  fill
                  className="object-contain bg-white"
                />
              </div>
            </div>
          </div>

          <div className="mt-16 text-center">
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
