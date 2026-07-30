-- ▶ yscc-ticket (palwtkhsdladgvpmtkcv) の SQL Editor で実行
-- Stripe Webhook の重複処理防止テーブル（yscc-ticket と共有）
-- このテーブルが既に存在する場合はスキップされる

create table if not exists processed_stripe_events (
  event_id text primary key,
  processed_at timestamptz default now()
);

alter table processed_stripe_events enable row level security;
