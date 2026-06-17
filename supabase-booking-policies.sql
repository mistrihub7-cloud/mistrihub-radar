-- MistriHub public booking flow policies.
-- Run this once in Supabase SQL Editor for the project connected to Vercel.
-- These policies are intentionally permissive because the current app has auth disabled.

alter table if exists public.job_requests
add column if not exists customer_name text,
add column if not exists customer_phone text,
add column if not exists user_latitude double precision,
add column if not exists user_longitude double precision,
add column if not exists photo_url_2 text,
add column if not exists worker_question text,
add column if not exists quote_amount text,
add column if not exists quote_note text,
add column if not exists quote_eta text;

alter table if exists public.job_requests enable row level security;
alter table if exists public.job_status_history enable row level security;
alter table if exists public.notifications enable row level security;
alter table if exists public.request_messages enable row level security;

alter table if exists public.request_messages
add column if not exists sender_role text,
add column if not exists sender_name text,
add column if not exists worker_id text,
add column if not exists worker_name text;

create table if not exists public.worker_reviews (
  id uuid primary key default gen_random_uuid(),
  job_id text not null unique,
  worker_id text not null,
  customer_name text,
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

create table if not exists public.push_tokens (
  id uuid primary key default gen_random_uuid(),
  token text not null unique,
  user_id text,
  account_id text,
  role text not null default 'user',
  name text,
  phone text,
  service text,
  worker_id text,
  endpoint text,
  p256dh text,
  auth text,
  last_seen timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table if exists public.push_tokens
add column if not exists user_id text,
add column if not exists endpoint text,
add column if not exists p256dh text,
add column if not exists auth text,
add column if not exists last_seen timestamptz;

create table if not exists public.user_locations (
  id uuid primary key default gen_random_uuid(),
  account_id text not null,
  role text not null default 'user',
  phone text,
  label text,
  latitude double precision not null,
  longitude double precision not null,
  accuracy double precision,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (account_id, role)
);

create table if not exists public.notification_logs (
  id uuid primary key default gen_random_uuid(),
  request_id text,
  worker_id text,
  phone text,
  channel text not null,
  status text not null,
  twilio_sid text,
  error_message text,
  created_at timestamptz not null default now()
);

alter table if exists public.worker_reviews enable row level security;
alter table if exists public.push_tokens enable row level security;
alter table if exists public.user_locations enable row level security;
alter table if exists public.notification_logs enable row level security;

drop policy if exists "mistrihub public read job requests" on public.job_requests;
drop policy if exists "mistrihub public create job requests" on public.job_requests;
drop policy if exists "mistrihub public update job requests" on public.job_requests;

create policy "mistrihub public read job requests"
on public.job_requests
for select
to anon, authenticated
using (true);

create policy "mistrihub public create job requests"
on public.job_requests
for insert
to anon, authenticated
with check (true);

create policy "mistrihub public update job requests"
on public.job_requests
for update
to anon, authenticated
using (true)
with check (true);

drop policy if exists "mistrihub public read job history" on public.job_status_history;
drop policy if exists "mistrihub public create job history" on public.job_status_history;

create policy "mistrihub public read job history"
on public.job_status_history
for select
to anon, authenticated
using (true);

create policy "mistrihub public create job history"
on public.job_status_history
for insert
to anon, authenticated
with check (true);

drop policy if exists "mistrihub public read notifications" on public.notifications;
drop policy if exists "mistrihub public create notifications" on public.notifications;
drop policy if exists "mistrihub public update notifications" on public.notifications;

create policy "mistrihub public read notifications"
on public.notifications
for select
to anon, authenticated
using (true);

create policy "mistrihub public create notifications"
on public.notifications
for insert
to anon, authenticated
with check (true);

create policy "mistrihub public update notifications"
on public.notifications
for update
to anon, authenticated
using (true)
with check (true);

drop policy if exists "mistrihub public read request messages" on public.request_messages;
drop policy if exists "mistrihub public create request messages" on public.request_messages;

create policy "mistrihub public read request messages"
on public.request_messages
for select
to anon, authenticated
using (true);

create policy "mistrihub public create request messages"
on public.request_messages
for insert
to anon, authenticated
with check (true);

drop policy if exists "mistrihub public read worker reviews" on public.worker_reviews;
drop policy if exists "mistrihub public create worker reviews" on public.worker_reviews;
drop policy if exists "mistrihub public update worker reviews" on public.worker_reviews;

create policy "mistrihub public read worker reviews"
on public.worker_reviews
for select
to anon, authenticated
using (true);

create policy "mistrihub public create worker reviews"
on public.worker_reviews
for insert
to anon, authenticated
with check (true);

create policy "mistrihub public update worker reviews"
on public.worker_reviews
for update
to anon, authenticated
using (true)
with check (true);

drop policy if exists "mistrihub public create push tokens" on public.push_tokens;
drop policy if exists "mistrihub public update push tokens" on public.push_tokens;

create policy "mistrihub public create push tokens"
on public.push_tokens
for insert
to anon, authenticated
with check (true);

create policy "mistrihub public update push tokens"
on public.push_tokens
for update
to anon, authenticated
using (true)
with check (true);

drop policy if exists "mistrihub public read user locations" on public.user_locations;
drop policy if exists "mistrihub public create user locations" on public.user_locations;
drop policy if exists "mistrihub public update user locations" on public.user_locations;

create policy "mistrihub public read user locations"
on public.user_locations
for select
to anon, authenticated
using (true);

create policy "mistrihub public create user locations"
on public.user_locations
for insert
to anon, authenticated
with check (true);

create policy "mistrihub public update user locations"
on public.user_locations
for update
to anon, authenticated
using (true)
with check (true);

drop policy if exists "mistrihub public read notification logs" on public.notification_logs;
drop policy if exists "mistrihub public create notification logs" on public.notification_logs;

create policy "mistrihub public read notification logs"
on public.notification_logs
for select
to anon, authenticated
using (true);

create policy "mistrihub public create notification logs"
on public.notification_logs
for insert
to anon, authenticated
with check (true);
