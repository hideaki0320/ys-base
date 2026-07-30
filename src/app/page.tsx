import Image from "next/image";
import Link from "next/link";
import { ChevronRight, MapPin, Clock, Car } from "lucide-react";

const menuCards = [
  {
    href: "/facility",
    title: "施設を知る",
    subtitle: "FACILITY",
    description: "天然芝コートの詳細と施設案内",
  },
  {
    href: "/reserve",
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
    date: "2026/7/30",
    title: "YS-BASE ホームページを公開しました",
    slug: "website-launch",
  },
  {
    date: "2026/7/25",
    title: "8月の予約受付を開始しました",
    slug: "august-reservations",
  },
  {
    date: "2026/7/15",
    title: "施設利用規約を更新しました",
    slug: "terms-update",
  },
];

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative h-screen min-h-[600px] max-h-[900px]">
        <Image
          src="/images/court-4.jpg"
          alt="YS-BASE サッカーコート"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 hero-gradient" />
        <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
          <p className="text-accent text-sm sm:text-base tracking-[0.3em] mb-4 font-medium">
            SPORTS PARK BY YSCC
          </p>
          <h1 className="text-white text-5xl sm:text-7xl lg:text-8xl font-black tracking-wider mb-6">
            YS-BASE
          </h1>
          <p className="text-white/90 text-base sm:text-lg max-w-xl leading-relaxed mb-10">
            横浜市瀬谷区の天然芝サッカーコート。
            <br className="hidden sm:block" />
            Y.S.C.C.横浜が運営するスポーツパーク。
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/reserve"
              className="bg-accent hover:bg-accent-dark text-primary font-bold px-8 py-4 text-base transition-colors flex items-center justify-center gap-2"
            >
              コートを予約する
              <ChevronRight size={18} />
            </Link>
            <Link
              href="/facility"
              className="border-2 border-white/80 hover:border-accent hover:text-accent text-white font-bold px-8 py-4 text-base transition-colors flex items-center justify-center gap-2"
            >
              施設概要を見る
              <ChevronRight size={18} />
            </Link>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60 text-xs tracking-widest animate-bounce">
          SCROLL
        </div>
      </section>

      {/* Menu Cards */}
      <section className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-accent text-sm tracking-[0.3em] font-medium mb-2">MAIN MENU</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {menuCards.map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className="group bg-white p-8 border border-gray-200 hover:border-accent hover:shadow-lg transition-all"
              >
                <p className="text-accent text-xs tracking-widest font-medium mb-2">
                  {card.subtitle}
                </p>
                <h3 className="text-lg font-bold text-primary mb-3 group-hover:text-primary-light transition-colors">
                  {card.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4">{card.description}</p>
                <div className="flex items-center text-accent text-sm font-medium">
                  <span>詳しく見る</span>
                  <ChevronRight
                    size={16}
                    className="ml-1 group-hover:translate-x-1 transition-transform"
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-accent text-sm tracking-[0.3em] font-medium mb-2">ABOUT</p>
              <h2 className="text-3xl sm:text-4xl font-black text-primary mb-6 section-title">
                YS-BASEについて
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                YS-BASE（ワイエスベース）は、Y.S.C.C.横浜が運営する横浜市瀬谷区のスポーツパークです。
                約6,100㎡の敷地に広がる天然芝のサッカーコートで、少年サッカーからシニアまで、
                幅広い世代の方々にご利用いただけます。
              </p>
              <p className="text-gray-700 leading-relaxed mb-6">
                メインコートとサブコートを備え、試合や練習、イベントなど、
                さまざまな用途でお使いいただけます。
                38台分の駐車場も完備しています。
              </p>
              <Link
                href="/facility"
                className="inline-flex items-center gap-2 text-accent hover:text-accent-dark font-bold transition-colors"
              >
                施設の詳細を見る
                <ChevronRight size={18} />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="relative aspect-[3/4] overflow-hidden">
                <Image
                  src="/images/court-1.jpg"
                  alt="YS-BASE コート写真1"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="relative aspect-[3/4] overflow-hidden mt-8">
                <Image
                  src="/images/court-3.jpg"
                  alt="YS-BASE コート写真2"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* News Section */}
      <section className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-accent text-sm tracking-[0.3em] font-medium mb-2">NEWS</p>
            <h2 className="text-3xl font-black text-primary section-title section-title-center">
              お知らせ
            </h2>
          </div>
          <div className="max-w-3xl mx-auto space-y-0 divide-y divide-gray-200">
            {newsItems.map((item) => (
              <Link
                key={item.slug}
                href={`/news/${item.slug}`}
                className="flex items-start gap-4 py-5 group hover:bg-white px-4 -mx-4 transition-colors"
              >
                <time className="text-sm text-gray-500 shrink-0 pt-0.5">{item.date}</time>
                <span className="text-gray-800 group-hover:text-primary transition-colors">
                  {item.title}
                </span>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              href="/news"
              className="inline-flex items-center gap-2 text-accent hover:text-accent-dark font-bold transition-colors"
            >
              お知らせ一覧
              <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Access Section */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-accent text-sm tracking-[0.3em] font-medium mb-2">ACCESS</p>
            <h2 className="text-3xl font-black text-primary section-title section-title-center">
              アクセス
            </h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="aspect-video bg-gray-200 overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3254.5!2d139.483!3d35.463!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z5qiq5rWc5biC54Cs6LC35Yy65LiL54Cs6LCy!5e0!3m2!1sja!2sjp!4v1"
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
                <div className="w-10 h-10 bg-primary/10 flex items-center justify-center shrink-0">
                  <MapPin size={20} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-primary mb-1">所在地</h3>
                  <p className="text-gray-700">〒246-0035 神奈川県横浜市瀬谷区下瀬谷1丁目</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary/10 flex items-center justify-center shrink-0">
                  <Car size={20} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-primary mb-1">駐車場</h3>
                  <p className="text-gray-700">38台（砂利敷）</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary/10 flex items-center justify-center shrink-0">
                  <Clock size={20} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-primary mb-1">営業時間</h3>
                  <p className="text-gray-700">
                    平日 14:00〜21:00 / 土日 9:00〜21:00
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    ※平日午前はメンテナンス＋地域利用
                  </p>
                </div>
              </div>
              <Link
                href="/access"
                className="inline-flex items-center gap-2 text-accent hover:text-accent-dark font-bold transition-colors mt-4"
              >
                アクセスの詳細
                <ChevronRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
