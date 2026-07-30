import type { Metadata } from "next";
import { MapPin, Car, Clock, Train } from "lucide-react";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "アクセス",
  description: "YS-BASEへのアクセス方法。駐車場38台完備。環状4号線沿い。",
};

export default function AccessPage() {
  return (
    <>
      <PageHero title="アクセス" subtitle="ACCESS" />

      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 地図 */}
          <div className="aspect-video mb-12 bg-gray-200 overflow-hidden">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* 基本情報 */}
            <div className="space-y-8">
              <h2 className="text-2xl font-black text-primary section-title">基本情報</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 flex items-center justify-center shrink-0">
                    <MapPin size={20} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-primary mb-1">所在地</h3>
                    <p className="text-gray-700">
                      〒246-0035
                      <br />
                      神奈川県横浜市瀬谷区下瀬谷1丁目
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 flex items-center justify-center shrink-0">
                    <Clock size={20} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-primary mb-1">営業時間</h3>
                    <p className="text-gray-700">
                      平日：14:00〜21:00
                      <br />
                      土日祝：9:00〜21:00
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      ※平日午前はメンテナンス＋地域利用
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 交通手段 */}
            <div className="space-y-8">
              <h2 className="text-2xl font-black text-primary section-title">交通案内</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 flex items-center justify-center shrink-0">
                    <Car size={20} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-primary mb-1">お車でお越しの場合</h3>
                    <p className="text-gray-700">
                      環状4号線沿い
                      <br />
                      駐車場：38台（砂利敷・無料）
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 flex items-center justify-center shrink-0">
                    <Train size={20} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-primary mb-1">電車でお越しの場合</h3>
                    <p className="text-gray-700">
                      相鉄線「瀬谷」駅より
                      <br />
                      バスまたはタクシーをご利用ください。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 注意事項 */}
          <div className="mt-12 bg-gray-50 p-6 sm:p-8">
            <h3 className="font-bold text-primary mb-4">ご来場時のお願い</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-accent font-bold shrink-0">・</span>
                近隣は住宅地です。お車でお越しの際は安全運転と静粛なご利用をお願いいたします。
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent font-bold shrink-0">・</span>
                路上駐車は固くお断りいたします。必ず施設内駐車場をご利用ください。
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent font-bold shrink-0">・</span>
                ゴミは各自お持ち帰りください。
              </li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
