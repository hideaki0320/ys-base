import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "利用規約",
  description: "YS-BASE施設利用規約。ご利用前に必ずお読みください。",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <h2 className="text-base font-bold text-primary mb-3">{title}</h2>
      <div className="text-[13px] text-gray-600 leading-[1.9] space-y-2">{children}</div>
    </div>
  );
}

export default function TermsPage() {
  return (
    <>
      <PageHero title="利用規約" subtitle="TERMS OF SERVICE" />

      <section className="py-16 sm:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-gray-500 mb-10">
            本利用規約（以下「本規約」）は、Y.S.C.C.横浜（以下「当クラブ」）が運営するスポーツ施設「YS-BASE」（以下「本施設」）のご利用に関する条件を定めるものです。本施設をご利用いただく場合は、本規約に同意いただいたものとみなします。
          </p>

          <Section title="第1条（適用範囲）">
            <p>本規約は、本施設のコート予約およびご利用に関するすべてのサービス（以下「本サービス」）に適用されます。</p>
          </Section>

          <Section title="第2条（利用申込み）">
            <p>1. 本施設の利用を希望される方（以下「利用者」）は、当サイトの予約フォームまたはお問い合わせフォームから利用申込みを行うものとします。</p>
            <p>2. 利用者は、申込み時に正確な情報を提供するものとし、虚偽の情報を提供した場合、予約を取り消すことがあります。</p>
            <p>3. 当クラブが利用申込みを承認し、利用料金の支払いが完了した時点で利用契約が成立するものとします。</p>
          </Section>

          <Section title="第3条（利用料金・支払い）">
            <p>1. 利用料金は、当サイトの料金表に掲載する金額（税込）とします。</p>
            <p>2. お支払いはクレジットカード決済とし、予約時にお支払いいただきます。</p>
            <p>3. 料金は予告なく改定する場合があります。改定前に成立した予約には、申込時点の料金が適用されます。</p>
          </Section>

          <Section title="第4条（キャンセル・変更）">
            <p>1. 利用日の31日前までのキャンセルは、利用料金の全額を返金いたします。</p>
            <p>2. 利用日の30日前から当日までのキャンセルは、利用料金の100%をキャンセル料として申し受けます。</p>
            <p>3. 予約日時の変更は、一度キャンセルのうえ再度ご予約ください。変更時にもキャンセルポリシーが適用されます。</p>
            <p>4. 気象庁による警報・注意報の発令、落雷の予兆等により当クラブの判断で利用を中止する場合は、キャンセル料はかかりません。</p>
          </Section>

          <Section title="第5条（施設利用上の注意）">
            <p>利用者は、以下の事項を遵守するものとします。</p>
            <ul className="list-none space-y-1.5 mt-2">
              {[
                "天然芝の養生のため、スパイクシューズでのご利用はお控えください。トレーニングシューズをご使用ください。",
                "施設内は禁煙です。",
                "ゴミは各自お持ち帰りください。",
                "近隣は住宅地です。騒音や大声にご注意ください。",
                "利用時間を厳守してください。後片付けの時間を含めて利用時間内に完了してください。",
                "施設内の設備・備品を破損した場合は、速やかに当クラブにご連絡ください。",
                "ペットの同伴はご遠慮ください。",
                "駐車場は施設内の指定場所をご利用ください。路上駐車は禁止です。",
              ].map((text) => (
                <li key={text} className="flex items-start gap-2">
                  <span className="w-1 h-1 bg-accent rounded-full shrink-0 mt-2.5" />
                  {text}
                </li>
              ))}
            </ul>
          </Section>

          <Section title="第6条（禁止事項）">
            <p>利用者は、以下の行為を行ってはなりません。</p>
            <ul className="list-none space-y-1.5 mt-2">
              {[
                "当クラブの許可なく施設を商用利用すること",
                "施設内での物品販売、勧誘行為",
                "他の利用者や近隣住民に迷惑を及ぼす行為",
                "施設・設備を故意に破損する行為",
                "危険物の持込み",
                "その他、当クラブが不適切と判断する行為",
              ].map((text) => (
                <li key={text} className="flex items-start gap-2">
                  <span className="w-1 h-1 bg-accent rounded-full shrink-0 mt-2.5" />
                  {text}
                </li>
              ))}
            </ul>
          </Section>

          <Section title="第7条（免責事項）">
            <p>1. 本施設の利用中に生じた事故・怪我・盗難等について、当クラブの故意または重大な過失による場合を除き、当クラブは一切の責任を負いません。</p>
            <p>2. 利用者は、自己の責任において安全に十分配慮して施設をご利用ください。</p>
            <p>3. 天候、芝の状態、設備の故障等により、予告なく施設の利用を制限または中止する場合があります。</p>
          </Section>

          <Section title="第8条（損害賠償）">
            <p>利用者が本施設の設備・芝等を破損した場合、その修繕費用を負担していただきます。</p>
          </Section>

          <Section title="第9条（個人情報の取扱い）">
            <p>予約時にご提供いただいた個人情報は、当クラブのプライバシーポリシーに基づき適切に管理・利用いたします。</p>
          </Section>

          <Section title="第10条（規約の変更）">
            <p>当クラブは、必要に応じて本規約を変更できるものとします。変更後の規約は、当サイトに掲載した時点で効力を生じるものとします。</p>
          </Section>

          <Section title="第11条（準拠法・管轄裁判所）">
            <p>1. 本規約は日本法に準拠するものとします。</p>
            <p>2. 本規約に関する紛争については、横浜地方裁判所を第一審の専属的合意管轄裁判所とします。</p>
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
