import Image from "next/image";
import Link from "next/link";
import { ChevronRight, ChevronDown, MapPin, Clock, Car } from "lucide-react";

const menuCards = [
  {
    href: "/facility",
    title: "施設を知る",
    subtitle: "FACILITY",
    description: "天然芝コートの詳細と施設案内",
  },
  {
    href: "/reserve/calendar",
    title: "コートを予約する",
    subtitle: "RESERVE",
    description: "予約方法と空き状況の確認",
  },
  {
    href: "/pricing",
    title: "料金を確認する",
    subtitle: "PRICING",
    description: "時間帯・曜日別の利用料金",
  },
  {
    href: "/access",
    title: "アクセス",
    subtitle: "ACCESS",
    description: "駐車場・交通案内",
  },
];

const newsItems = [
  {
    date: "2026.07.30",
    category: "お知らせ",
    title: "YS-BASE ホームページを公開しました",
    slug: "website-launch",
  },
  {
    date: "2026.07.25",
    category: "予約",
    title: "8月の予約受付を開始しました",
    slug: "august-reservations",
  },
  {
    date: "2026.07.15",
    category: "お知らせ",
    title: "施設利用規約を更新しました",
    slug: "terms-update",
  },
];

export default function Home() {
  return (
    <>
      {/* ─── Hero ─── */}
      <section className="relative h-screen min-h-[600px] max-h-[960px]">
        <Image
          src="/images/hero_img.png"
          alt="YS-BASE サッカーコート"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 hero-gradient" />

        <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
          {/* YSCC emblem */}
          <div className="animate-fade-in-up mb-6">
            <Image
              src="/images/icon-512.png"
              alt="YSCC"
              width={72}
              height={72}
              className="w-14 h-14 sm:w-[72px] sm:h-[72px] opacity-90"
            />
          </div>

          <p className="animate-fade-in-up animate-delay-100 text-accent/90 text-xs sm:text-sm tracking-[0.4em] mb-4 font-medium uppercase">
            Sports Park by YSCC
          </p>

          <h1 className="animate-fade-in-up animate-delay-200 text-white text-5xl sm:text-7xl lg:text-8xl font-black tracking-wider mb-5">
            YS-BASE
          </h1>

          <div className="animate-fade-in-up animate-delay-200 w-12 h-[2px] bg-accent/60 mb-6" />

          <p className="animate-fade-in-up animate-delay-300 text-white/70 text-sm sm:text-base max-w-lg leading-relaxed mb-10">
            横浜市瀬谷区の天然芝サッカーコート。
            <br className="hidden sm:block" />
            Y.S.C.C.横浜が運営するスポーツパーク。
          </p>

          <div className="animate-fade-in-up animate-delay-400 flex flex-col sm:flex-row gap-3">
            <Link
              href="/reserve/calendar"
              className="bg-accent hover:bg-accent-dark text-primary-dark font-bold px-8 py-3.5 text-sm transition-all flex items-center justify-center gap-2 rounded-sm"
            >
              コートを予約する
              <ChevronRight size={16} strokeWidth={2.5} />
            </Link>
            <Link
              href="/facility"
              className="border border-white/30 hover:border-white/60 hover:bg-white/5 text-white font-medium px-8 py-3.5 text-sm transition-all flex items-center justify-center gap-2 rounded-sm"
            >
              施設概要を見る
              <ChevronRight size={16} />
            </Link>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="text-white/30 text-[10px] tracking-[0.3em] uppercase">Scroll</span>
          <ChevronDown size={16} className="text-white/30 animate-scroll-pulse" />
        </div>
      </section>

      {/* ─── Menu Cards ─── */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {menuCards.map((card) => (
                <Link
                  key={card.href}
                  href={card.href}
                  className="group bg-white p-7 border border-gray-100 hover:border-accent/30 card-hover rounded-sm"
                >
                  <p className="text-[10px] text-accent tracking-[0.2em] font-medium mb-1.5 uppercase">
                    {card.subtitle}
                  </p>
                  <h3 className="text-lg font-bold text-primary mb-2 group-hover:text-primary-light transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-[13px] text-gray-500 mb-4 leading-relaxed">{card.description}</p>
                  <div className="flex items-center text-accent text-[13px] font-medium">
                    <span>詳しく見る</span>
                    <ChevronRight
                      size={14}
                      className="ml-0.5 group-hover:translate-x-1 transition-transform"
                    />
                  </div>
                </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── About ─── */}
      <section className="py-20 sm:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div>
              <p className="text-accent text-[10px] tracking-[0.3em] font-medium mb-3 uppercase">About</p>
              <h2 className="text-2xl sm:text-3xl font-black text-primary mb-6 section-title">
                YS-BASEについて
              </h2>
              <p className="text-gray-600 leading-[1.9] text-[15px] mb-4">
                YS-BASE（ワイエスベース）は、Y.S.C.C.横浜が運営する横浜市瀬谷区のスポーツパークです。
                約6,100㎡の敷地に広がる天然芝のサッカーコートで、少年サッカーからシニアまで幅広い世代の方々にご利用いただけます。
              </p>
              <p className="text-gray-600 leading-[1.9] text-[15px] mb-8">
                メインコートとサブコートを備え、試合や練習、イベントなど、さまざまな用途でお使いいただけます。
                38台分の駐車場も完備しています。
              </p>
              <Link
                href="/facility"
                className="inline-flex items-center gap-1.5 text-accent hover:text-accent-dark text-sm font-bold transition-colors"
              >
                施設の詳細を見る
                <ChevronRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative aspect-[3/4] overflow-hidden rounded-sm">
                <Image
                  src="/images/image1.png"
                  alt="YS-BASE 天然芝でのサッカー練習風景"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="relative aspect-[3/4] overflow-hidden rounded-sm mt-8">
                <Image
                  src="/images/image2.png"
                  alt="YS-BASE ジュニア選手のプレー"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-accent text-[10px] tracking-[0.3em] font-medium mb-3 uppercase">Features</p>
            <h2 className="text-2xl sm:text-3xl font-black text-primary section-title section-title-center">
              YS-BASEの特徴
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="relative aspect-[16/10] overflow-hidden rounded-sm mb-6">
                <Image src="/images/natural_grass.png" alt="YS-BASE 天然芝フィールド全景" fill className="object-cover" />
              </div>
              <h3 className="text-lg font-bold text-primary mb-2">天然芝のフィールド</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                プロクラブが管理する天然芝で、足腰に優しい快適なプレーをお楽しみいただけます。
              </p>
            </div>
            <div className="text-center">
              <div className="relative aspect-[16/10] overflow-hidden rounded-sm mb-6 bg-white">
                <Image src="/images/Soccer_field_diagram.png" alt="YS-BASE 施設配置図" fill className="object-contain p-2" />
              </div>
              <h3 className="text-lg font-bold text-primary mb-2">充実した施設環境</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                約6,100㎡の広大な敷地に、メインコートとサブコートの2面を完備しています。
              </p>
            </div>
            <div className="text-center">
              <div className="relative aspect-[16/10] overflow-hidden rounded-sm mb-6">
                <Image src="/images/parking_img.png" alt="YS-BASE 無料駐車場" fill className="object-cover" />
              </div>
              <h3 className="text-lg font-bold text-primary mb-2">38台の無料駐車場</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                環状4号線沿いの好立地。大型車両も駐車可能な広い駐車スペースを無料でご利用いただけます。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── News ─── */}
      <section className="py-20 sm:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-accent text-[10px] tracking-[0.3em] font-medium mb-3 uppercase">News</p>
              <h2 className="text-2xl sm:text-3xl font-black text-primary section-title section-title-center">
                お知らせ
              </h2>
            </div>
            <div className="space-y-0 divide-y divide-gray-200">
              {newsItems.map((item) => (
                <Link
                  key={item.slug}
                  href={`/news/${item.slug}`}
                  className="flex items-start sm:items-center gap-3 sm:gap-5 py-5 group hover:bg-white px-5 -mx-5 transition-colors rounded-sm"
                >
                  <time className="text-xs text-gray-400 shrink-0 tabular-nums font-medium pt-0.5 sm:pt-0">
                    {item.date}
                  </time>
                  <span className="text-[10px] font-bold text-accent bg-accent/10 px-2 py-0.5 shrink-0 rounded-sm">
                    {item.category}
                  </span>
                  <span className="text-sm text-gray-700 group-hover:text-primary transition-colors">
                    {item.title}
                  </span>
                </Link>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link
                href="/news"
                className="inline-flex items-center gap-1.5 text-accent hover:text-accent-dark text-sm font-bold transition-colors"
              >
                お知らせ一覧
                <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Access ─── */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-accent text-[10px] tracking-[0.3em] font-medium mb-3 uppercase">Access</p>
            <h2 className="text-2xl sm:text-3xl font-black text-primary section-title section-title-center">
              アクセス
            </h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="aspect-video bg-gray-100 overflow-hidden rounded-sm">
              <iframe
                src="https://maps.google.com/maps?q=%E6%A8%AA%E6%B5%9C%E5%B8%82%E7%80%AC%E8%B0%B7%E5%8C%BA%E4%B8%8B%E7%80%AC%E8%B0%B71%E4%B8%81%E7%9B%AE&t=m&z=15&output=embed&hl=ja"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="YS-BASE 地図"
              />
            </div>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 bg-primary/5 flex items-center justify-center shrink-0 rounded-sm">
                  <MapPin size={18} className="text-primary/70" />
                </div>
                <div>
                  <h3 className="font-bold text-primary text-sm mb-1">所在地</h3>
                  <p className="text-sm text-gray-600">〒246-0035 神奈川県横浜市瀬谷区下瀬谷1丁目</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 bg-primary/5 flex items-center justify-center shrink-0 rounded-sm">
                  <Car size={18} className="text-primary/70" />
                </div>
                <div>
                  <h3 className="font-bold text-primary text-sm mb-1">駐車場</h3>
                  <p className="text-sm text-gray-600">38台（砂利敷・無料）</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 bg-primary/5 flex items-center justify-center shrink-0 rounded-sm">
                  <Clock size={18} className="text-primary/70" />
                </div>
                <div>
                  <h3 className="font-bold text-primary text-sm mb-1">営業時間</h3>
                  <p className="text-sm text-gray-600">
                    平日 14:00〜21:00 / 土日 9:00〜21:00
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    ※平日午前はメンテナンス＋地域利用
                  </p>
                </div>
              </div>
              <Link
                href="/access"
                className="inline-flex items-center gap-1.5 text-accent hover:text-accent-dark text-sm font-bold transition-colors mt-2"
              >
                アクセスの詳細
                <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
