import Link from "next/link";
import { MapPin, Phone, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-primary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <div className="mb-4">
              <span className="font-black text-2xl tracking-wider">YS-BASE</span>
              <p className="text-accent text-xs tracking-widest mt-1">SPORTS PARK BY YSCC</p>
            </div>
            <div className="space-y-3 text-sm text-white/80">
              <div className="flex items-start gap-2">
                <MapPin size={16} className="mt-0.5 shrink-0" />
                <span>〒246-0035 神奈川県横浜市瀬谷区下瀬谷1丁目</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} className="shrink-0" />
                <a href="tel:045-000-0000" className="hover:text-accent transition-colors">
                  045-000-0000
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={16} className="shrink-0" />
                <a
                  href="mailto:info@ys-base.jp"
                  className="hover:text-accent transition-colors"
                >
                  info@ys-base.jp
                </a>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-accent mb-4 text-sm tracking-wider">MENU</h3>
            <ul className="space-y-2 text-sm text-white/80">
              <li>
                <Link href="/facility" className="hover:text-accent transition-colors">
                  施設概要
                </Link>
              </li>
              <li>
                <Link href="/reserve" className="hover:text-accent transition-colors">
                  予約方法
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-accent transition-colors">
                  料金表
                </Link>
              </li>
              <li>
                <Link href="/access" className="hover:text-accent transition-colors">
                  アクセス
                </Link>
              </li>
              <li>
                <Link href="/news" className="hover:text-accent transition-colors">
                  お知らせ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-accent transition-colors">
                  お問い合わせ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-accent mb-4 text-sm tracking-wider">ABOUT YSCC</h3>
            <p className="text-sm text-white/80 leading-relaxed">
              Y.S.C.C.横浜は横浜市を拠点とするサッカークラブです。
              YS-BASEはYSCCが運営するスポーツパークとして、
              地域の皆さまにご利用いただけるコートです。
            </p>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/60">
          <p>&copy; {new Date().getFullYear()} YS-BASE / Y.S.C.C.横浜</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-accent transition-colors">
              プライバシーポリシー
            </Link>
            <Link href="/terms" className="hover:text-accent transition-colors">
              利用規約
            </Link>
            <Link href="/tokushoho" className="hover:text-accent transition-colors">
              特定商取引法に基づく表記
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
