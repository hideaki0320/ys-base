import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "プライバシーポリシー",
  description: "YS-BASEのプライバシーポリシー。個人情報の取扱いについて。",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <h2 className="text-base font-bold text-primary mb-3">{title}</h2>
      <div className="text-[13px] text-gray-600 leading-[1.9] space-y-2">{children}</div>
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <>
      <PageHero title="プライバシーポリシー" subtitle="PRIVACY POLICY" />

      <section className="py-16 sm:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-gray-500 mb-10">
            Y.S.C.C.横浜（以下「当クラブ」）は、YS-BASE（以下「本施設」）のウェブサイトおよびサービスをご利用いただくにあたり、お客様の個人情報の保護に細心の注意を払い、以下のとおりプライバシーポリシーを定めます。
          </p>

          <Section title="1. 収集する個人情報">
            <p>当クラブは、以下の個人情報を収集することがあります。</p>
            <ul className="list-none space-y-1.5 mt-2">
              {[
                "氏名",
                "メールアドレス",
                "電話番号",
                "住所",
                "ご利用目的・ご要望等のお問い合わせ内容",
                "決済に関する情報（クレジットカード情報は決済代行会社 Stripe が管理し、当クラブでは保持しません）",
              ].map((text) => (
                <li key={text} className="flex items-start gap-2">
                  <span className="w-1 h-1 bg-accent rounded-full shrink-0 mt-2.5" />
                  {text}
                </li>
              ))}
            </ul>
          </Section>

          <Section title="2. 個人情報の利用目的">
            <p>収集した個人情報は、以下の目的で利用いたします。</p>
            <ul className="list-none space-y-1.5 mt-2">
              {[
                "施設の予約受付・確認・変更・キャンセルに関するご連絡",
                "利用料金の請求・決済処理",
                "お問い合わせへの回答",
                "施設の運営改善、サービス向上のための統計・分析（個人を特定しない形で利用）",
                "重要なお知らせ（施設メンテナンス・利用規約変更等）のご連絡",
              ].map((text) => (
                <li key={text} className="flex items-start gap-2">
                  <span className="w-1 h-1 bg-accent rounded-full shrink-0 mt-2.5" />
                  {text}
                </li>
              ))}
            </ul>
          </Section>

          <Section title="3. 個人情報の第三者提供">
            <p>当クラブは、以下の場合を除き、お客様の個人情報を第三者に提供いたしません。</p>
            <ul className="list-none space-y-1.5 mt-2">
              {[
                "お客様の同意がある場合",
                "法令に基づき開示が求められた場合",
                "人の生命・身体・財産の保護のために必要な場合",
                "決済処理のため、決済代行会社（Stripe, Inc.）に必要な範囲で提供する場合",
              ].map((text) => (
                <li key={text} className="flex items-start gap-2">
                  <span className="w-1 h-1 bg-accent rounded-full shrink-0 mt-2.5" />
                  {text}
                </li>
              ))}
            </ul>
          </Section>

          <Section title="4. 個人情報の管理">
            <p>当クラブは、個人情報の正確性を保ち、不正アクセス・紛失・漏洩等を防止するため、適切な安全管理措置を講じます。</p>
          </Section>

          <Section title="5. Cookie（クッキー）の使用">
            <p>当サイトでは、利便性向上のため Cookie を使用する場合があります。Cookie はお客様のブラウザ設定により無効にすることができますが、一部の機能がご利用いただけなくなる場合があります。</p>
          </Section>

          <Section title="6. 外部サービスの利用">
            <p>当サイトでは、以下の外部サービスを利用しています。各サービスのプライバシーポリシーもあわせてご確認ください。</p>
            <ul className="list-none space-y-1.5 mt-2">
              {[
                "Stripe（決済処理）",
                "Google Maps（地図表示）",
              ].map((text) => (
                <li key={text} className="flex items-start gap-2">
                  <span className="w-1 h-1 bg-accent rounded-full shrink-0 mt-2.5" />
                  {text}
                </li>
              ))}
            </ul>
          </Section>

          <Section title="7. 個人情報の開示・訂正・削除">
            <p>お客様ご自身の個人情報について、開示・訂正・削除をご希望の場合は、下記のお問い合わせ先までご連絡ください。ご本人確認のうえ、合理的な範囲で対応いたします。</p>
          </Section>

          <Section title="8. ポリシーの変更">
            <p>当クラブは、必要に応じて本ポリシーを改定することがあります。改定後のポリシーは、当サイトに掲載した時点で効力を生じるものとします。</p>
          </Section>

          <Section title="9. お問い合わせ先">
            <p>個人情報の取扱いに関するお問い合わせは、以下までご連絡ください。</p>
            <div className="bg-gray-50 p-5 rounded-sm border border-gray-100 mt-3">
              <p className="font-medium text-primary">Y.S.C.C.横浜（YS-BASE 運営事務局）</p>
              <p className="mt-1">メール：info@ys-base.jp</p>
              <p>電話：045-000-0000（平日 10:00〜17:00）</p>
            </div>
          </Section>

          <div className="border-t border-gray-100 pt-6 text-[13px] text-gray-400">
            <p>制定日：2026年7月30日</p>
            <p>Y.S.C.C.横浜</p>
          </div>
        </div>
      </section>
    </>
  );
}
