-- MistriHub worker identity lock.
-- Run after removing old duplicate worker rows from public.workers.
-- This keeps one worker profile per mobile number and one worker profile per email.

alter table if exists public.workers
add column if not exists email text;

create unique index if not exists workers_unique_mobile_identity
on public.workers (
  regexp_replace(coalesce(phone, whatsapp, ''), '\D', '', 'g')
)
where regexp_replace(coalesce(phone, whatsapp, ''), '\D', '', 'g') <> '';

create unique index if not exists workers_unique_email_identity
on public.workers (lower(trim(email)))
where email is not null and trim(email) <> '';
