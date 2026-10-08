-- 予約完了メール・雨天中止メールの送信記録
-- ▶ yscc-ticket (palwtkhsdladgvpmtkcv) の SQL Editor で実行

alter table ysbase_reservations add column if not exists confirmation_sent_at timestamptz;
alter table ysbase_reservations add column if not exists confirmation_error text;
alter table ysbase_reservations add column if not exists cancel_reason text;
alter table ysbase_reservations add column if not exists refund_id text;
alter table ysbase_reservations add column if not exists cancel_mail_id text;
alter table ysbase_reservations add column if not exists cancel_mail_scheduled_at timestamptz;
alter table ysbase_reservations add column if not exists cancel_mail_error text;

-- 二重予約防止の一意制約を「有効な予約（pending / confirmed）だけ」に限定する。
-- 旧制約 UNIQUE (reservation_date, slot_hour, status) では、同じ枠を2回キャンセルすると
-- 'cancelled' 同士が衝突し、返金後にキャンセル更新が失敗していた。
-- 先に新しい部分一意インデックスを作ってから旧制約を外す（二重予約防止が途切れないように）。
create unique index if not exists ysbase_reservations_active_slot_key
  on ysbase_reservations (reservation_date, slot_hour)
  where status in ('pending', 'confirmed');
alter table ysbase_reservations
  drop constraint if exists ysbase_reservations_reservation_date_slot_hour_status_key;
