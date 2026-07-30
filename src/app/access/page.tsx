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
          <div className="aspect-video mb-14 bg-gray-100 overflow-hidden rounded-sm">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-14">
            <div>
              <h2 className="text-xl font-black text-primary mb-6 section-title">基本情報</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 bg-primary/5 flex items-center justify-center shrink-0 rounded-sm">
                    <MapPin size={18} className="text-primary/70" />
                  </div>
                  <div>
                    <h3 className="font-bold text-primary text-sm mb-1">所在地</h3>
                    <p className="text-sm text-gray-600">
                      〒246-0035<br />神奈川県横浜市瀬谷区下瀬谷1丁目
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 bg-primary/5 flex items-center justify-center shrink-0 rounded-sm">
                    <Clock size={18} className="text-primary/70" />
                  </div>
                  <div>
                    <h3 className="font-bold text-primary text-sm mb-1">営業時間</h3>
                    <p className="text-sm text-gray-600">
                      平日：14:00〜21:00<br />土日祝：9:00〜21:00
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      ※平日午前はメンテナンス＋地域利用
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-black text-primary mb-6 section-title">交通案内</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 bg-primary/5 flex items-center justify-center shrink-0 rounded-sm">
                    <Car size={18} className="text-primary/70" />
                  </div>
                  <div>
                    <h3 className="font-bold text-primary text-sm mb-1">お車でお越しの場合</h3>
                    <p className="text-sm text-gray-600">
                      環状4号線沿い<br />駐車場：38台（砂利敷・無料）
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 bg-primary/5 flex items-center justify-center shrink-0 rounded-sm">
                    <Train size={18} className="text-primary/70" />
                  </div>
                  <div>
                    <h3 className="font-bold text-primary text-sm mb-1">電車でお越しの場合</h3>
                    <p className="text-sm text-gray-600">
                      相鉄線「瀬谷」駅より<br />バスまたはタクシーをご利用ください。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-14 bg-gray-50 p-6 sm:p-8 rounded-sm border border-gray-100">
            <h3 className="font-bold text-primary text-sm mb-4">ご来場時のお願い</h3>
            <ul className="space-y-2.5 text-[13px] text-gray-600">
              {[
                "近隣は住宅地です。お車でお越しの際は安全運転と静粛なご利用をお願いいたします。",
                "路上駐車は固くお断りいたします。必ず施設内駐車場をご利用ください。",
                "ゴミは各自お持ち帰りください。",
              ].map((text) => (
                <li key={text} className="flex items-start gap-2">
                  <span className="w-1 h-1 bg-accent rounded-full shrink-0 mt-2" />
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
