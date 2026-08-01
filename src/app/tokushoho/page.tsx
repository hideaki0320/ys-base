import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "特定商取引法に基づく表記",
  description: "YS-BASEの特定商取引法に基づく表記。事業者情報、支払方法、キャンセルポリシー等。",
};

const rows: [string, React.ReactNode][] = [
  ["事業者名", "Y.S.C.C.横浜（横浜スポーツ&カルチャークラブ）"],
  ["代表者", "吉野 次郎"],
  ["所在地", "〒246-0035 神奈川県横浜市瀬谷区下瀬谷1丁目41-4"],
  ["電話番号", "045-000-0000（受付時間：平日 10:00〜17:00）"],
  ["メールアドレス", "info@ys-base.jp"],
  [
    "販売価格",
    <>
      各サービスの料金は、当サイトの
      <a href="/pricing" className="text-accent hover:text-accent-dark underline underline-offset-2">
        料金表
      </a>
      に表示する金額（税込）とします。
    </>,
  ],
  ["販売価格以外の必要料金", "なし（ナイター照明費は利用料金に含まれます）"],
  ["支払方法", "クレジットカード決済（Visa、Mastercard、JCB、American Express、Diners Club）"],
  ["支払時期", "予約申込み時にお支払いいただきます。"],
  [
    "役務の提供時期",
    "予約された日時に、本施設のコートをご利用いただけます。",
  ],
  [
    "キャンセル・返金",
    <div key="cancel" className="space-y-1.5">
      <p>利用日の31日前まで：全額返金</p>
      <p>利用日の30日前〜当日：キャンセル料100%（返金不可）</p>
      <p>
        ※気象警報等により施設側の判断で利用を中止する場合は全額返金いたします。
      </p>
    </div>,
  ],
  [
    "返品・交換",
    "サービスの性質上、利用後の返品・交換はお受けできません。",
  ],
  [
    "動作環境",
    "当サイトはモダンブラウザ（Chrome、Safari、Firefox、Edge の最新版）での閲覧を推奨します。",
  ],
];

export default function TokushohoPage() {
  return (
    <>
      <PageHero title="特定商取引法に基づく表記" subtitle="LEGAL" />

      <section className="py-16 sm:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-gray-500 mb-10">
            「特定商取引に関する法律」第11条に基づき、以下のとおり表示いたします。
          </p>

          <div className="border border-gray-100 rounded-sm overflow-hidden">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-gray-100">
                {rows.map(([label, value]) => (
                  <tr key={typeof label === "string" ? label : ""}>
                    <th className="py-4 px-5 text-left font-bold text-primary bg-gray-50 w-40 sm:w-52 align-top text-[13px]">
                      {label}
                    </th>
                    <td className="py-4 px-5 text-gray-600 text-[13px] leading-[1.8]">
                      {value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-gray-100 pt-6 mt-10 text-[13px] text-gray-400">
            <p>最終更新日：2026年7月30日</p>
          </div>
        </div>
      </section>
    </>
  );
}
