import type { Metadata } from "next";
import Image from "next/image";
import {
  Check,
  X,
  Toilet,
  Droplets,
  Shirt,
  Car,
  Building2,
  Lightbulb,
  Sprout,
  Ruler,
  LandPlot,
  MapPin,
  Fence,
} from "lucide-react";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "施設概要",
  description:
    "YS-BASEの施設情報。約6,100㎡の敷地に天然芝のメインコート・サブコートの2面を完備。無料駐車場30台、トイレ・水道あり。横浜市瀬谷区、環状4号線沿い。",
  openGraph: {
    title: "施設概要 | YS-BASE",
    description:
      "約6,100㎡の天然芝サッカーコート。メインコート・サブコートの2面、無料駐車場30台、トイレ・水道完備。",
    images: [{ url: "/images/facility/pitch-wide.jpg" }],
  },
};

const stats = [
  { Icon: LandPlot, value: "約6,100", unit: "㎡", label: "敷地面積" },
  { Icon: Sprout, value: "天然芝", unit: "", label: "メイン + サブ 2面" },
  { Icon: Car, value: "30", unit: "台", label: "無料駐車場" },
  { Icon: Lightbulb, value: "ナイター", unit: "", label: "夜間照明あり" },
];

const gallery = [
  {
    src: "/images/facility/pitch-net.jpg",
    alt: "YS-BASE 天然芝コート全景。高さ10mの防球ネットに囲まれたフィールド",
    className: "col-span-2 row-span-2",
  },
  {
    src: "/images/facility/grass-closeup.jpg",
    alt: "YS-BASE きめ細かく手入れされた天然芝",
    className: "",
  },
  {
    src: "/images/facility/ball-1.jpg",
    alt: "YS-BASE 天然芝の上のサッカーボールとマーカーコーン",
    className: "",
  },
  {
    src: "/images/facility/play-1.jpg",
    alt: "YS-BASE 天然芝でのジュニアサッカーのプレー",
    className: "",
  },
  {
    src: "/images/facility/match.jpg",
    alt: "YS-BASE ゴール前でのトレーニング風景",
    className: "",
  },
];

const amenities = [
  {
    Icon: Toilet,
    label: "トイレ",
    available: true,
    note: "施設内に完備",
  },
  {
    Icon: Droplets,
    label: "水道",
    available: true,
    note: "コート脇に水道あり",
  },
  {
    Icon: Shirt,
    label: "更衣室",
    available: false,
    note: "着替えを済ませてお越しください",
  },
  {
    Icon: Car,
    label: "駐車場",
    available: true,
    note: "30台・無料",
  },
  {
    Icon: Building2,
    label: "事務所",
    available: true,
    note: "受付・お問い合わせ窓口",
  },
  {
    Icon: Lightbulb,
    label: "ナイター照明",
    available: true,
    note: "利用料金に照明費を含む",
  },
];

const specs = [
  { Icon: Ruler, label: "敷地面積", value: "約6,106㎡（約1,847坪）" },
  { Icon: Sprout, label: "芝種類", value: "天然芝" },
  { Icon: LandPlot, label: "コート数", value: "メインコート + サブコート" },
  { Icon: Car, label: "駐車場", value: "30台（砂利敷・無料）" },
  { Icon: Fence, label: "フェンス", value: "コンクリート支柱・ナイロンネット（H=10m）" },
  { Icon: MapPin, label: "所在地", value: "横浜市瀬谷区下瀬谷1丁目41-4（環状4号線沿い）" },
];

export default function FacilityPage() {
  return (
    <>
      <PageHero title="施設概要" subtitle="FACILITY" image="/images/facility/pitch-wide.jpg" />

      {/* ─── Intro + Stats ─── */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-14">
            <p className="text-accent text-[10px] tracking-[0.3em] font-medium mb-3 uppercase">About</p>
            <h2 className="text-2xl sm:text-3xl font-black text-primary mb-6 section-title section-title-center">
              空と芝がひろがる、まちなかのフィールド
            </h2>
            <p className="text-gray-600 leading-[1.9] text-[15px]">
              YS-BASEは、Y.S.C.C.横浜が運営する横浜市瀬谷区のスポーツパークです。
              プロクラブが手入れする天然芝のコートを、少年サッカーからシニアまで幅広い世代の方々にご利用いただけます。
              サッカーはもちろん、フットサル、各種球技、イベントなど多様な用途でお使いください。
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {stats.map(({ Icon, value, unit, label }) => (
              <div
                key={label}
                className="bg-gray-50 border border-gray-100 rounded-sm px-5 py-6 text-center card-hover"
              >
                <div className="w-10 h-10 mx-auto mb-3 bg-primary/5 rounded-sm flex items-center justify-center">
                  <Icon size={20} className="text-primary/70" />
                </div>
                <p className="text-2xl sm:text-3xl font-black text-primary leading-none">
                  {value}
                  {unit && <span className="text-sm font-bold ml-0.5">{unit}</span>}
                </p>
                <p className="text-xs text-gray-500 mt-2">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Gallery ─── */}
      <section className="pb-16 sm:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 grid-flow-dense gap-2 sm:gap-3">
            {gallery.map((g) => (
              <div
                key={g.src}
                className={`relative aspect-[4/3] overflow-hidden rounded-sm group ${g.className}`}
              >
                <Image
                  src={g.src}
                  alt={g.alt}
                  fill
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pitch ─── */}
      <section className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="relative">
              <div className="relative aspect-[4/3] overflow-hidden rounded-sm">
                <Image
                  src="/images/facility/pitch-sky.jpg"
                  alt="YS-BASE 青空の下に広がる天然芝のメインコート"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-3 sm:-right-6 w-2/5 aspect-[4/3] overflow-hidden rounded-sm border-4 border-white shadow-xl">
                <Image
                  src="/images/facility/play-2.jpg"
                  alt="YS-BASE 天然芝でボールを追う選手"
                  fill
                  sizes="30vw"
                  className="object-cover"
                />
              </div>
            </div>

            <div className="lg:pl-4 pt-6 lg:pt-0">
              <p className="text-accent text-[10px] tracking-[0.3em] font-medium mb-3 uppercase">Pitch</p>
              <h2 className="text-2xl sm:text-3xl font-black text-primary mb-6 section-title">
                天然芝コート
              </h2>
              <p className="text-gray-600 leading-[1.9] text-[15px] mb-8">
                メインコートとサブコートの2面を備えています。
                足腰にやさしい天然芝ならではの柔らかなプレー感と、高さ10mの防球ネットに囲まれた安心のフィールドで、
                試合や練習を思いきりお楽しみいただけます。
              </p>
              <div className="space-y-3">
                <div className="bg-white p-5 rounded-sm border border-gray-100">
                  <h3 className="font-bold text-primary text-sm mb-1.5">メインコート</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    少年サッカー（8人制）の試合が可能なサイズ。試合、練習、大会などにご利用いただけます。
                  </p>
                </div>
                <div className="bg-white p-5 rounded-sm border border-gray-100">
                  <h3 className="font-bold text-primary text-sm mb-1.5">サブコート</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    ウォーミングアップやトレーニングに最適なサブコートです。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Amenities ─── */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-accent text-[10px] tracking-[0.3em] font-medium mb-3 uppercase">Amenities</p>
            <h2 className="text-2xl sm:text-3xl font-black text-primary section-title section-title-center">
              設備・アメニティ
            </h2>
          </div>

          {/* 写真つき主要設備 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="group">
              <div className="relative aspect-[4/3] overflow-hidden rounded-sm mb-5">
                <Image
                  src="/images/facility/office.jpg"
                  alt="YS-BASE 事務所（受付）"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-primary/5 flex items-center justify-center shrink-0 rounded-sm">
                  <Building2 size={18} className="text-primary/70" />
                </div>
                <div>
                  <h3 className="font-bold text-primary mb-1">事務所</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    駐車場に隣接した事務所が受付窓口です。ご利用当日の受付やお問い合わせはこちらへお越しください。
                  </p>
                </div>
              </div>
            </div>

            <div className="group">
              <div className="relative aspect-[4/3] overflow-hidden rounded-sm mb-5">
                <Image
                  src="/images/facility/parking.jpg"
                  alt="YS-BASE 無料駐車場（30台・砂利敷）"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-primary/5 flex items-center justify-center shrink-0 rounded-sm">
                  <Car size={18} className="text-primary/70" />
                </div>
                <div>
                  <h3 className="font-bold text-primary mb-1">駐車場 30台（無料）</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    環状4号線沿いの好立地。コートのすぐ隣に30台分の無料駐車場を備え、チームでの来場や送迎にも便利です。
                  </p>
                </div>
              </div>
            </div>

            <div className="group">
              <div className="grid grid-cols-2 gap-2 mb-5">
                <div className="relative aspect-[2/3] overflow-hidden rounded-sm">
                  <Image
                    src="/images/facility/toilet.jpg"
                    alt="YS-BASE 施設内トイレ（洋式・温水洗浄便座）"
                    fill
                    sizes="(max-width: 768px) 50vw, 17vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="relative aspect-[2/3] overflow-hidden rounded-sm">
                  <Image
                    src="/images/facility/water.jpg"
                    alt="YS-BASE コート脇の水道"
                    fill
                    sizes="(max-width: 768px) 50vw, 17vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-primary/5 flex items-center justify-center shrink-0 rounded-sm">
                  <Droplets size={18} className="text-primary/70" />
                </div>
                <div>
                  <h3 className="font-bold text-primary mb-1">トイレ・水道</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    施設内にトイレを完備。コート脇には水道もあり、給水やスパイクの泥落としにご利用いただけます。
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 設備一覧 */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {amenities.map(({ Icon, label, available, note }) => (
              <div
                key={label}
                className={`rounded-sm border p-4 text-center ${
                  available
                    ? "bg-white border-gray-100"
                    : "bg-gray-50 border-gray-200 border-dashed"
                }`}
              >
                <div className="relative w-11 h-11 mx-auto mb-3">
                  <div
                    className={`w-11 h-11 rounded-sm flex items-center justify-center ${
                      available ? "bg-primary/5" : "bg-gray-200/60"
                    }`}
                  >
                    <Icon size={20} className={available ? "text-primary/70" : "text-gray-400"} />
                  </div>
                  <span
                    className={`absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center border-2 border-white ${
                      available ? "bg-green-field" : "bg-gray-400"
                    }`}
                  >
                    {available ? (
                      <Check size={11} strokeWidth={3} className="text-white" />
                    ) : (
                      <X size={11} strokeWidth={3} className="text-white" />
                    )}
                  </span>
                </div>
                <p className={`text-sm font-bold ${available ? "text-primary" : "text-gray-500"}`}>
                  {label}
                </p>
                <p className="text-[11px] text-gray-500 mt-1 leading-snug">{note}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-gray-500 text-center">
            ※更衣室はございません。着替えを済ませてお越しいただくか、車内等でお着替えください。
          </p>
        </div>
      </section>

      {/* ─── Specs + Site plan ─── */}
      <section className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-14">
            <div className="lg:col-span-2">
              <p className="text-accent text-[10px] tracking-[0.3em] font-medium mb-3 uppercase">Specs</p>
              <h2 className="text-2xl font-black text-primary mb-6 section-title">施設情報</h2>
              <div className="bg-white border border-gray-100 rounded-sm divide-y divide-gray-100">
                {specs.map(({ Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-4 px-5 py-4">
                    <Icon size={16} className="text-accent shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-gray-400 tracking-wide">{label}</p>
                      <p className="text-sm text-gray-700 mt-0.5">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-3">
              <p className="text-accent text-[10px] tracking-[0.3em] font-medium mb-3 uppercase">Site plan</p>
              <h2 className="text-2xl font-black text-primary mb-6 section-title">配置図</h2>
              <div className="relative aspect-[16/11] overflow-hidden border border-gray-100 rounded-sm bg-white">
                <Image
                  src="/images/site-plan.jpg"
                  alt="YS-BASE 配置図"
                  fill
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

    </>
  );
}
