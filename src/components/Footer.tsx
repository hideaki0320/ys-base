import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Mail, ChevronRight } from "lucide-react";

const menuLinks = [
  { href: "/facility", label: "施設概要" },
  { href: "/reserve", label: "予約方法" },
  { href: "/pricing", label: "料金表" },
  { href: "/access", label: "アクセス" },
  { href: "/news", label: "お知らせ" },
  { href: "/contact", label: "お問い合わせ" },
];

export function Footer() {
  return (
    <footer className="bg-primary-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* CTA Band */}
        <div className="py-12 sm:py-16 border-b border-white/10 text-center">
          <p className="text-accent text-xs tracking-[0.3em] font-medium mb-3">RESERVATION</p>
          <h3 className="text-2xl sm:text-3xl font-black mb-4">コートを予約する</h3>
          <p className="text-white/60 text-sm mb-6 max-w-md mx-auto">
            ご希望の日時を選んでオンラインでご予約いただけます
          </p>
          <Link
            href="/reserve/calendar"
            className="inline-flex items-center gap-2 bg-accent hover:bg-accent-dark text-primary-dark font-bold px-8 py-3 text-sm transition-all rounded-sm"
          >
            予約カレンダーを開く
            <ChevronRight size={16} strokeWidth={2.5} />
          </Link>
        </div>

        {/* Main Footer */}
        <div className="py-12 sm:py-16 grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Brand */}
          <div className="md:col-span-5">
            <Link href="/" className="inline-flex items-center gap-3 mb-5">
              <Image
                src="/images/icon-512.png"
                alt="YSCC"
                width={48}
                height={48}
                className="w-11 h-11"
              />
              <div className="leading-tight">
                <span className="font-black text-xl tracking-wider block">YS-BASE</span>
                <span className="text-accent/70 text-[10px] tracking-[0.2em] font-medium">
                  SPORTS PARK BY YSCC
                </span>
              </div>
            </Link>
            <p className="text-sm text-white/50 leading-relaxed mb-6 max-w-sm">
              Y.S.C.C.横浜が運営する横浜市瀬谷区のスポーツパーク。
              天然芝のサッカーコートで少年サッカーからシニアまで幅広くご利用いただけます。
            </p>
            <div className="space-y-2.5 text-sm text-white/60">
              <div className="flex items-start gap-2.5">
                <MapPin size={14} className="mt-0.5 shrink-0 text-accent/60" />
                <span>〒246-0035 神奈川県横浜市瀬谷区下瀬谷1丁目</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone size={14} className="shrink-0 text-accent/60" />
                <a href="tel:045-000-0000" className="hover:text-white transition-colors">
                  045-000-0000
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail size={14} className="shrink-0 text-accent/60" />
                <a href="mailto:info@ys-base.jp" className="hover:text-white transition-colors">
                  info@ys-base.jp
                </a>
              </div>
            </div>
          </div>

          {/* Menu */}
          <div className="md:col-span-3 md:col-start-7">
            <h4 className="text-[11px] font-bold text-white/40 tracking-[0.2em] mb-5 uppercase">
              Menu
            </h4>
            <ul className="space-y-2.5">
              {menuLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-white/60 hover:text-white transition-colors inline-flex items-center gap-1"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div className="md:col-span-4">
            <h4 className="text-[11px] font-bold text-white/40 tracking-[0.2em] mb-5 uppercase">
              Information
            </h4>
            <div className="space-y-4 text-sm text-white/60">
              <div>
                <p className="text-white/80 font-medium mb-1">営業時間</p>
                <p>平日 14:00〜21:00</p>
                <p>土日祝 9:00〜21:00</p>
              </div>
              <div>
                <p className="text-white/80 font-medium mb-1">駐車場</p>
                <p>38台（砂利敷・無料）</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/5 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-white/30">
          <p>&copy; {new Date().getFullYear()} YS-BASE / Y.S.C.C.横浜</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-white/60 transition-colors">
              プライバシーポリシー
            </Link>
            <Link href="/terms" className="hover:text-white/60 transition-colors">
              利用規約
            </Link>
            <Link href="/tokushoho" className="hover:text-white/60 transition-colors">
              特定商取引法
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
