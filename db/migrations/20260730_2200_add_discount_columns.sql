-- クーポン/プロモーションコード使用情報を記録するカラム追加
ALTER TABLE ysbase_reservations
ADD COLUMN IF NOT EXISTS promotion_code text,
ADD COLUMN IF NOT EXISTS discount_amount integer NOT NULL DEFAULT 0;
