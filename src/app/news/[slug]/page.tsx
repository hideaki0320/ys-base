import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string | null;
  body: string | null;
  published_at: string;
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );
}

async function getArticle(slug: string): Promise<NewsArticle | null> {
  const { data, error } = await getSupabase()
    .from("ysbase_news")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (error || !data) return null;
  return data;
}

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return { title: "お知らせ" };

  return {
    title: article.title,
    description: article.excerpt || `${article.title} - YS-BASEからのお知らせ`,
    openGraph: {
      title: `${article.title} | YS-BASE`,
      description: article.excerpt || `${article.title} - YS-BASEからのお知らせ`,
    },
  };
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

export default async function NewsArticlePage({ params }: { params: Params }) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) notFound();

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <Link
          href="/news"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary mb-8 transition-colors"
        >
          <ChevronLeft size={16} />
          お知らせ一覧に戻る
        </Link>

        <article>
          <div className="flex items-center gap-3 mb-4">
            <time className="text-sm text-gray-400 tabular-nums font-medium">
              {formatDate(article.published_at)}
            </time>
            <span className="text-xs font-bold text-accent bg-accent/10 px-2.5 py-0.5 rounded-sm">
              {article.category}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-primary mb-8 leading-tight">
            {article.title}
          </h1>

          <div className="bg-white border border-gray-200 p-6 sm:p-10">
            {article.body ? (
              <div
                className="prose prose-sm max-w-none prose-headings:text-primary prose-a:text-accent"
                dangerouslySetInnerHTML={{ __html: article.body.replace(/\n/g, "<br />") }}
              />
            ) : article.excerpt ? (
              <p className="text-gray-700 leading-relaxed">{article.excerpt}</p>
            ) : (
              <p className="text-gray-500">内容はありません。</p>
            )}
          </div>
        </article>

        <div className="mt-12 text-center">
          <Link
            href="/news"
            className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-accent transition-colors"
          >
            <ChevronLeft size={16} />
            お知らせ一覧に戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
