import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, CircleAlert } from "lucide-react";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "予約方法",
  description: "YS-BASEのコート予約方法。予約手順、注意事項、キャンセルポリシー。",
};

const steps = [
  {
    num: "1",
    title: "空き状況を確認",
    description: "予約状況カレンダーで空き状況をご確認ください。",
  },
  {
    num: "2",
    title: "予約フォームから申し込み",
    description: "ご希望の日時・利用内容を入力して予約をお申し込みください。",
  },
  {
    num: "3",
    title: "確認メールを受信",
    description: "予約番号が記された「予約確認メール」をお受け取りください。",
  },
  {
    num: "4",
    title: "利用料のお支払い",
    description: "メールの案内に沿って利用料をお支払いください（クレジットカード決済対応）。",
  },
  {
    num: "5",
    title: "利用確定",
    description: "お支払い確認後、「利用確定メール」が届きましたら予約完了です。",
  },
];

export default function ReservePage() {
  return (
    <>
      <PageHero title="予約方法" subtitle="RESERVE" />

      <section className="py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 予約の手順 */}
          <div className="mb-16">
            <h2 className="text-2xl sm:text-3xl font-black text-primary mb-8 section-title section-title-center text-center">
              予約の手順
            </h2>
            <div className="space-y-6">
              {steps.map((step) => (
                <div key={step.num} className="flex gap-4 sm:gap-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-accent text-primary font-black text-lg sm:text-xl flex items-center justify-center shrink-0">
                    {step.num}
                  </div>
                  <div className="pt-1 sm:pt-2">
                    <h3 className="font-bold text-primary text-lg mb-1">{step.title}</h3>
                    <p className="text-gray-700">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 予約フォームへのリンク */}
          <div className="bg-primary text-white p-8 sm:p-10 text-center mb-16">
            <h3 className="text-xl sm:text-2xl font-black mb-4">
              コートの予約お申し込みはこちら
            </h3>
            <p className="text-white/80 mb-6">
              ご希望の日時を選択して予約フォームにお進みください。
            </p>
            <Link
              href="/reserve/calendar"
              className="inline-flex items-center gap-2 bg-accent hover:bg-accent-dark text-primary font-bold px-8 py-4 text-base transition-colors"
            >
              予約カレンダーを見る
              <ChevronRight size={18} />
            </Link>
          </div>

          {/* 予約可能日時 */}
          <div className="mb-16">
            <h2 className="text-2xl font-black text-primary mb-6 section-title">予約可能日時</h2>
            <div className="space-y-4">
              <div className="bg-gray-50 p-6">
                <h3 className="font-bold text-primary mb-2">一般利用</h3>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>
                    ・平日：14:00〜21:00までの1時間単位
                  </li>
                  <li>・土日祝：9:00〜21:00までの1時間単位</li>
                  <li>・ご利用希望月の1ヶ月前の1日から申し込み可能</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 予約注意事項 */}
          <div className="mb-16">
            <h2 className="text-2xl font-black text-primary mb-6 section-title">予約注意事項</h2>
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-accent font-bold shrink-0">・</span>
                <span>
                  <strong>商用利用：</strong>
                  当施設の商用利用は禁じられております。判断については事務局で行いますので、ご不明な場合は事前にお問い合わせください。
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent font-bold shrink-0">・</span>
                <span>
                  <strong>ピッチ空き状況：</strong>
                  利用お申し込みいただいた時点で空きがあった場合でも、既に他の方の予約が入っている場合がございます。
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent font-bold shrink-0">・</span>
                <span>
                  <strong>天然芝の養生：</strong>
                  芝のコンディション維持のため、メンテナンス期間中はご利用いただけない場合がございます。
                </span>
              </li>
            </ul>
          </div>

          {/* キャンセルポリシー */}
          <div className="mb-16">
            <h2 className="text-2xl font-black text-primary mb-6 section-title">
              キャンセルポリシー
            </h2>
            <div className="bg-gray-50 p-6 sm:p-8">
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-start gap-2">
                  <CircleAlert size={16} className="text-accent shrink-0 mt-0.5" />
                  <span>利用日の31日前までのキャンセルは<strong>無料</strong>。</span>
                </div>
                <div className="flex items-start gap-2">
                  <CircleAlert size={16} className="text-accent shrink-0 mt-0.5" />
                  <span>
                    利用日の30日前から当日までは利用料金<strong>100%</strong>
                    のキャンセル料がかかります。
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CircleAlert size={16} className="text-accent shrink-0 mt-0.5" />
                  <span>
                    気象庁による警報・注意報、落雷の予兆等により、施設側の判断で利用を中止する場合があります。
                    この場合のキャンセル料はかかりません。
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 料金リンク */}
          <div className="text-center">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 text-accent hover:text-accent-dark font-bold transition-colors"
            >
              利用料金の詳細を見る
              <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
