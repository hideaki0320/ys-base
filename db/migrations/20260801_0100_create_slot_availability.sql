-- スロット開放管理テーブル
-- pricing.ts のデフォルト（利用可能）に対する「閉鎖」オーバーライドを保存する
-- 行が存在しない場合 = pricing.ts のデフォルトに従う
-- is_available = false の行がある場合 = そのスロットは閉鎖

CREATE TABLE IF NOT EXISTS ysbase_slot_availability (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  date        date NOT NULL,
  slot_hour   integer NOT NULL CHECK (slot_hour >= 9 AND slot_hour <= 20),
  is_available boolean NOT NULL DEFAULT true,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now(),
  UNIQUE (date, slot_hour)
);

ALTER TABLE ysbase_slot_availability ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE TRIGGER ysbase_slot_availability_updated_at
  BEFORE UPDATE ON ysbase_slot_availability
  FOR EACH ROW
  EXECUTE FUNCTION ysbase_update_updated_at();

CREATE INDEX IF NOT EXISTS idx_slot_availability_date
  ON ysbase_slot_availability (date);
