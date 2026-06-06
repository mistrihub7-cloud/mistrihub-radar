-- MistriHub workers table repair.
-- Run this in Supabase SQL Editor for the project connected to Vercel.
-- Current app auth is disabled, so these public policies are required for worker registration/profile edit.

alter table if exists public.workers
add column if not exists user_id uuid,
add column if not exists category text,
add column if not exists category_slug text,
add column if not exists experience_years integer default 0,
add column if not exists rating numeric default 0,
add column if not exists review_count integer default 0,
add column if not exists location text,
add column if not exists city text,
add column if not exists latitude double precision,
add column if not exists longitude double precision,
add column if not exists email text,
add column if not exists phone text,
add column if not exists whatsapp text,
add column if not exists profile_photo text,
add column if not exists short_description text,
add column if not exists bio text,
add column if not exists service_details text[] default '{}',
add column if not exists available_today boolean default true,
add column if not exists service_radius integer default 10,
add column if not exists availability_status text default 'Available Today',
add column if not exists service_area text,
add column if not exists verified_status text default 'Not Submitted';

update public.workers
set whatsapp = coalesce(whatsapp, phone, '')
where whatsapp is null;

alter table if exists public.workers
alter column whatsapp set default '';

alter table if exists public.workers enable row level security;

drop policy if exists "mistrihub public read workers" on public.workers;
drop policy if exists "mistrihub public create workers" on public.workers;
drop policy if exists "mistrihub public update workers" on public.workers;

create policy "mistrihub public read workers"
on public.workers
for select
to anon, authenticated
using (true);

create policy "mistrihub public create workers"
on public.workers
for insert
to anon, authenticated
with check (true);

create policy "mistrihub public update workers"
on public.workers
for update
to anon, authenticated
using (true)
with check (true);

alter table if exists public.profiles
add column if not exists full_name text,
add column if not exists phone text,
add column if not exists email text,
add column if not exists role text default 'user';

alter table if exists public.profiles enable row level security;

drop policy if exists "mistrihub public read profiles" on public.profiles;
drop policy if exists "mistrihub public create profiles" on public.profiles;
drop policy if exists "mistrihub public update profiles" on public.profiles;

create policy "mistrihub public read profiles"
on public.profiles
for select
to anon, authenticated
using (true);

create policy "mistrihub public create profiles"
on public.profiles
for insert
to anon, authenticated
with check (true);

create policy "mistrihub public update profiles"
on public.profiles
for update
to anon, authenticated
using (true)
with check (true);
