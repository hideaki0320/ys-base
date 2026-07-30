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
          <div className="mb-16">
            <h2 className="text-xl sm:text-2xl font-black text-primary mb-10 section-title section-title-center text-center">
              予約の手順
            </h2>
            <div className="space-y-5">
              {steps.map((step, i) => (
                <div key={step.num} className="flex gap-5">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 bg-accent text-primary-dark font-black text-lg flex items-center justify-center shrink-0 rounded-sm">
                      {step.num}
                    </div>
                    {i < steps.length - 1 && (
                      <div className="w-[1px] flex-1 bg-accent/20 mt-1" />
                    )}
                  </div>
                  <div className="pb-6">
                    <h3 className="font-bold text-primary text-base mb-1">{step.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-primary rounded-sm p-8 sm:p-10 text-center mb-16">
            <h3 className="text-xl sm:text-2xl font-black text-white mb-3">
              コートの予約お申し込みはこちら
            </h3>
            <p className="text-white/50 text-sm mb-6">
              ご希望の日時を選択して予約フォームにお進みください。
            </p>
            <Link
              href="/reserve/calendar"
              className="inline-flex items-center gap-2 bg-accent hover:bg-accent-dark text-primary-dark font-bold px-8 py-3.5 text-sm transition-all rounded-sm"
            >
              予約カレンダーを見る
              <ChevronRight size={16} strokeWidth={2.5} />
            </Link>
          </div>

          <div className="mb-16">
            <h2 className="text-xl font-black text-primary mb-6 section-title">予約可能日時</h2>
            <div className="bg-gray-50 p-6 rounded-sm border border-gray-100">
              <h3 className="font-bold text-primary text-sm mb-3">一般利用</h3>
              <ul className="space-y-1.5 text-[13px] text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 bg-accent rounded-full shrink-0 mt-2" />
                  平日：14:00〜21:00までの1時間単位
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 bg-accent rounded-full shrink-0 mt-2" />
                  土日祝：9:00〜21:00までの1時間単位
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 bg-accent rounded-full shrink-0 mt-2" />
                  ご利用希望月の1ヶ月前の1日から申し込み可能
                </li>
              </ul>
            </div>
          </div>

          <div className="mb-16">
            <h2 className="text-xl font-black text-primary mb-6 section-title">予約注意事項</h2>
            <ul className="space-y-4 text-[13px] text-gray-600">
              {[
                { label: "商用利用：", text: "当施設の商用利用は禁じられております。判断については事務局で行いますので、ご不明な場合は事前にお問い合わせください。" },
                { label: "ピッチ空き状況：", text: "利用お申し込みいただいた時点で空きがあった場合でも、既に他の方の予約が入っている場合がございます。" },
                { label: "天然芝の養生：", text: "芝のコンディション維持のため、メンテナンス期間中はご利用いただけない場合がございます。" },
              ].map((item) => (
                <li key={item.label} className="flex items-start gap-2">
                  <span className="w-1 h-1 bg-accent rounded-full shrink-0 mt-2" />
                  <span>
                    <strong className="text-primary">{item.label}</strong>
                    {item.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-16">
            <h2 className="text-xl font-black text-primary mb-6 section-title">
              キャンセルポリシー
            </h2>
            <div className="bg-gray-50 p-6 sm:p-8 rounded-sm border border-gray-100">
              <div className="space-y-3 text-[13px] text-gray-600">
                <div className="flex items-start gap-2.5">
                  <CircleAlert size={14} className="text-accent shrink-0 mt-0.5" />
                  <span>利用日の31日前までのキャンセルは<strong className="text-primary">無料</strong>。</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CircleAlert size={14} className="text-accent shrink-0 mt-0.5" />
                  <span>
                    利用日の30日前から当日までは利用料金<strong className="text-primary">100%</strong>のキャンセル料がかかります。
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CircleAlert size={14} className="text-accent shrink-0 mt-0.5" />
                  <span>
                    気象庁による警報・注意報、落雷の予兆等により施設側の判断で利用を中止する場合はキャンセル料はかかりません。
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1.5 text-accent hover:text-accent-dark text-sm font-bold transition-colors"
            >
              利用料金の詳細を見る
              <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
