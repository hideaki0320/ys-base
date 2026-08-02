CREATE TABLE IF NOT EXISTS ysbase_news (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title       text NOT NULL,
  slug        text NOT NULL UNIQUE,
  category    text NOT NULL DEFAULT 'お知らせ',
  excerpt     text,
  body        text,
  published   boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

ALTER TABLE ysbase_news ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read published news"
  ON ysbase_news FOR SELECT
  USING (published = true);

CREATE OR REPLACE TRIGGER ysbase_news_updated_at
  BEFORE UPDATE ON ysbase_news
  FOR EACH ROW
  EXECUTE FUNCTION ysbase_update_updated_at();

CREATE INDEX IF NOT EXISTS idx_news_published_at
  ON ysbase_news (published_at DESC)
  WHERE published = true;
