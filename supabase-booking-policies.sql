-- MistriHub public booking flow policies.
-- Run this once in Supabase SQL Editor for the project connected to Vercel.
-- These policies are intentionally permissive because the current app has auth disabled.

alter table if exists public.job_requests
add column if not exists customer_name text,
add column if not exists customer_phone text,
add column if not exists user_latitude double precision,
add column if not exists user_longitude double precision,
add column if not exists worker_question text,
add column if not exists quote_amount text,
add column if not exists quote_note text,
add column if not exists quote_eta text;

alter table if exists public.job_requests enable row level security;
alter table if exists public.job_status_history enable row level security;
alter table if exists public.notifications enable row level security;
alter table if exists public.request_messages enable row level security;

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
