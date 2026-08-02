import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );
}

function authorize(request: Request): boolean {
  const authHeader = request.headers.get("authorization");
  const key = authHeader?.replace("Bearer ", "");
  return key === process.env.ADMIN_API_KEY;
}

export async function GET(request: Request) {
  if (!authorize(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await getSupabase()
    .from("ysbase_news")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data || []);
}

export async function POST(request: Request) {
  if (!authorize(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { title, slug, category, excerpt, body: newsBody, published } = body as {
    title: string;
    slug: string;
    category: string;
    excerpt?: string;
    body?: string;
    published: boolean;
  };

  if (!title || !slug) {
    return NextResponse.json({ error: "title and slug required" }, { status: 400 });
  }

  const row: Record<string, unknown> = {
    title,
    slug,
    category: category || "お知らせ",
    excerpt: excerpt || null,
    body: newsBody || null,
    published,
  };

  if (published) {
    row.published_at = new Date().toISOString();
  }

  const { data, error } = await getSupabase()
    .from("ysbase_news")
    .insert(row)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function PUT(request: Request) {
  if (!authorize(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { id, title, slug, category, excerpt, body: newsBody, published } = body as {
    id: string;
    title: string;
    slug: string;
    category: string;
    excerpt?: string;
    body?: string;
    published: boolean;
  };

  if (!id || !title || !slug) {
    return NextResponse.json({ error: "id, title and slug required" }, { status: 400 });
  }

  const supabase = getSupabase();

  const { data: existing } = await supabase
    .from("ysbase_news")
    .select("published, published_at")
    .eq("id", id)
    .single();

  const updates: Record<string, unknown> = {
    title,
    slug,
    category: category || "お知らせ",
    excerpt: excerpt || null,
    body: newsBody || null,
    published,
  };

  if (published && !existing?.published_at) {
    updates.published_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("ysbase_news")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
  if (!authorize(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const { error } = await getSupabase()
    .from("ysbase_news")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
