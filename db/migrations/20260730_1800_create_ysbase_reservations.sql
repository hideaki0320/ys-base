-- YS-BASE 予約テーブル
-- ▶ yscc-ticket (palwtkhsdladgvpmtkcv) の SQL Editor で実行

create table if not exists ysbase_reservations (
  id uuid default gen_random_uuid() primary key,
  reservation_date date not null,
  slot_hour integer not null check (slot_hour >= 9 and slot_hour <= 20),
  total_price integer not null,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  address text,
  purpose text,
  notes text,
  stripe_session_id text,
  stripe_payment_intent_id text,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled', 'completed')),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  unique (reservation_date, slot_hour, status)
);

-- updated_at 自動更新トリガー
create or replace function ysbase_update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_updated_at on ysbase_reservations;
create trigger set_updated_at
  before update on ysbase_reservations
  for each row
  execute function ysbase_update_updated_at();

-- RLS: service_role でのみアクセス（API Route 経由のみ）
alter table ysbase_reservations enable row level security;

-- インデックス
create index if not exists idx_ysbase_reservations_date on ysbase_reservations (reservation_date);
create index if not exists idx_ysbase_reservations_status on ysbase_reservations (status);
create index if not exists idx_ysbase_reservations_email on ysbase_reservations (customer_email);
