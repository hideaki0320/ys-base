-- YS-BASE お問い合わせテーブル
-- ▶ yscc-ticket (palwtkhsdladgvpmtkcv) の SQL Editor で実行

create table if not exists ysbase_inquiries (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  org text,
  email text not null,
  phone text,
  category text not null check (category in ('reservation', 'facility', 'event', 'other')),
  message text not null,
  status text not null default 'new' check (status in ('new', 'done')),
  notified_at timestamptz,
  notify_error text,
  ip text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

drop trigger if exists set_updated_at on ysbase_inquiries;
create trigger set_updated_at
  before update on ysbase_inquiries
  for each row
  execute function ysbase_update_updated_at();

-- RLS: service_role でのみアクセス（API Route 経由のみ）
-- SELECT / INSERT / UPDATE / DELETE: anon・authenticated からは禁止（ポリシーを作らない）
alter table ysbase_inquiries enable row level security;

create index if not exists idx_ysbase_inquiries_created_at on ysbase_inquiries (created_at desc);
create index if not exists idx_ysbase_inquiries_status on ysbase_inquiries (status);
create index if not exists idx_ysbase_inquiries_ip_created_at on ysbase_inquiries (ip, created_at desc);
