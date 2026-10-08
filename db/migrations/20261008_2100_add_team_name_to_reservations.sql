-- 予約フォームの「所属チーム名」（任意）
-- ▶ yscc-ticket (palwtkhsdladgvpmtkcv) の SQL Editor で実行
alter table ysbase_reservations add column if not exists team_name text;
