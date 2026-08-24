-- waitlist_signups: email capture for the marketing site, ahead of
-- general availability. No read access is granted on the table itself —
-- the public page shows a live count via `waitlist_count()` instead, so
-- no visitor can ever pull the email list.

create table waitlist_signups (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);

alter table waitlist_signups enable row level security;

create policy "waitlist_signups: anyone can join"
  on waitlist_signups for insert
  to anon, authenticated
  with check (true);

create function waitlist_count()
returns bigint
language sql
security definer
set search_path = public
stable
as $$
  select count(*) from waitlist_signups;
$$;

grant execute on function waitlist_count() to anon, authenticated;
