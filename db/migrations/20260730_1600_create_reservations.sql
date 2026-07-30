-- YS-BASE 予約テーブル
-- ▶ YS-BASE Supabase プロジェクトの SQL Editor で実行

create table if not exists reservations (
  id uuid default gen_random_uuid() primary key,
  reservation_date date not null,
  slot_hour integer not null check (slot_hour >= 9 and slot_hour <= 20),
  total_price integer not null,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  team_name text,
  player_count text,
  notes text,
  stripe_session_id text,
  stripe_payment_intent_id text,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled', 'completed')),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  -- 同じ日の同じ時間帯に重複予約を防ぐ
  unique (reservation_date, slot_hour, status)
);

-- updated_at 自動更新トリガー
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_updated_at on reservations;
create trigger set_updated_at
  before update on reservations
  for each row
  execute function update_updated_at_column();

-- RLS: service_role でのみアクセス（API Route 経由のみ）
alter table reservations enable row level security;

-- インデックス
create index if not exists idx_reservations_date on reservations (reservation_date);
create index if not exists idx_reservations_status on reservations (status);
create index if not exists idx_reservations_email on reservations (customer_email);
