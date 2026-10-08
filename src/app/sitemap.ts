import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { SITE_URL } from "@/lib/site";

// お知らせの追加を反映するため、1時間ごとに作り直す
export const revalidate = 3600;

async function getNewsEntries(): Promise<MetadataRoute.Sitemap> {
  try {
    return await fetchNewsEntries();
  } catch (e) {
    // 取得に失敗しても固定ページだけの sitemap は返す
    console.error("[sitemap] news fetch threw:", e);
    return [];
  }
}

async function fetchNewsEntries(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
  const { data, error } = await supabase
    .from("ysbase_news")
    .select("slug, published_at, updated_at")
    .eq("published", true);
  if (error) {
    console.error("[sitemap] news fetch error:", error.message);
    return [];
  }
  return (data || []).map((n) => ({
    url: `${SITE_URL}/news/${encodeURIComponent(n.slug)}`,
    lastModified: new Date(n.updated_at || n.published_at),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const pages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${SITE_URL}/facility`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/reserve`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/reserve/calendar`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/access`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/news`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: `${SITE_URL}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/tokushoho`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];
  return [...pages, ...(await getNewsEntries())];
}
