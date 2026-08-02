import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { createClient } from "@supabase/supabase-js";

export const metadata: Metadata = {
  title: "お知らせ",
  description: "YS-BASEからのお知らせ・ニュース一覧。予約受付情報、施設メンテナンス、イベント情報など。",
  openGraph: {
    title: "お知らせ | YS-BASE",
    description: "YS-BASEの最新情報。予約受付、施設メンテナンス、イベント情報。",
  },
};

export const dynamic = "force-dynamic";

interface NewsItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string | null;
  published_at: string;
}

async function getNews(): Promise<NewsItem[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );

  const { data, error } = await supabase
    .from("ysbase_news")
    .select("id, title, slug, category, excerpt, published_at")
    .eq("published", true)
    .order("published_at", { ascending: false });

  if (error) {
    console.error("[news] fetch error:", error.message);
    return [];
  }

  return data || [];
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

export default async function NewsPage() {
  const items = await getNews();

  return (
    <>
      <PageHero title="お知らせ" subtitle="NEWS" />

      <section className="py-16 sm:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {items.length === 0 ? (
            <p className="text-center text-gray-500 py-12">お知らせはまだありません。</p>
          ) : (
            <div className="space-y-0 divide-y divide-gray-100">
              {items.map((item) => (
                <article key={item.id} className="py-8 first:pt-0">
                  <div className="flex items-center gap-3 mb-3">
                    <time className="text-xs text-gray-400 tabular-nums font-medium">
                      {formatDate(item.published_at)}
                    </time>
                    <span className="text-[10px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-sm">
                      {item.category}
                    </span>
                  </div>
                  <Link href={`/news/${item.slug}`} className="group">
                    <h2 className="text-base font-bold text-gray-800 group-hover:text-primary transition-colors mb-2">
                      {item.title}
                    </h2>
                    {item.excerpt && (
                      <p className="text-[13px] text-gray-500 leading-relaxed mb-3">{item.excerpt}</p>
                    )}
                    <span className="inline-flex items-center gap-1 text-accent text-[13px] font-medium group-hover:gap-2 transition-all">
                      続きを読む
                      <ChevronRight size={14} />
                    </span>
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
