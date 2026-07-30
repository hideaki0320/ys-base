import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "お知らせ",
  description: "YS-BASEからのお知らせ・ニュース一覧。予約受付情報、施設メンテナンス、イベント情報など。",
  openGraph: {
    title: "お知らせ | YS-BASE",
    description: "YS-BASEの最新情報。予約受付、施設メンテナンス、イベント情報。",
  },
};

const newsItems = [
  {
    date: "2026.07.30",
    category: "お知らせ",
    title: "YS-BASE ホームページを公開しました",
    slug: "website-launch",
    excerpt:
      "YS-BASE（ワイエスベース）の公式ホームページを公開いたしました。施設情報、予約方法、料金表など、ご利用に必要な情報をご確認いただけます。",
  },
  {
    date: "2026.07.25",
    category: "予約",
    title: "8月の予約受付を開始しました",
    slug: "august-reservations",
    excerpt:
      "8月分のコート予約受付を開始いたしました。ご利用をご希望の方は予約ページよりお申し込みください。",
  },
  {
    date: "2026.07.15",
    category: "お知らせ",
    title: "施設利用規約を更新しました",
    slug: "terms-update",
    excerpt:
      "施設利用規約の一部を更新いたしました。ご利用前に必ずご確認ください。",
  },
];

export default function NewsPage() {
  return (
    <>
      <PageHero title="お知らせ" subtitle="NEWS" />

      <section className="py-16 sm:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-0 divide-y divide-gray-100">
            {newsItems.map((item) => (
              <article key={item.slug} className="py-8 first:pt-0">
                <div className="flex items-center gap-3 mb-3">
                  <time className="text-xs text-gray-400 tabular-nums font-medium">{item.date}</time>
                  <span className="text-[10px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-sm">
                    {item.category}
                  </span>
                </div>
                <Link href={`/news/${item.slug}`} className="group">
                  <h2 className="text-base font-bold text-gray-800 group-hover:text-primary transition-colors mb-2">
                    {item.title}
                  </h2>
                  <p className="text-[13px] text-gray-500 leading-relaxed mb-3">{item.excerpt}</p>
                  <span className="inline-flex items-center gap-1 text-accent text-[13px] font-medium group-hover:gap-2 transition-all">
                    続きを読む
                    <ChevronRight size={14} />
                  </span>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
