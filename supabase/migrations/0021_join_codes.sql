-- Company join codes: a self-serve alternative to the per-email invite
-- flow. Someone with a valid code creates a real account but gets no
-- company access until an owner/broker/fleet-manager approves the request
-- and picks their role — mirrors the invite flow's "profile only gets
-- created on explicit admin action" security model (migration 0016), just
-- initiated by the joiner instead of the admin.
--
-- The join code itself lives in its own table, not as a column on
-- `companies` — companies already has "public can read minimal company
-- info" for anon (`using (true)`), and RLS is row-level, not column-level,
-- so a plain column would let anyone query it straight off the anon key.
-- Same reasoning as company_connections.credentials and pending_invites:
-- no anon/authenticated policies at all, access only through a
-- security-definer function that returns the minimum needed.

create table company_join_codes (
  company_id uuid primary key references companies(id) on delete cascade,
  code text not null unique,
  regenerated_at timestamptz not null default now()
);

alter table company_join_codes enable row level security;
-- No policies for anon/authenticated on purpose.

-- Looks up a code pre-signup (no session exists yet), so this has to be
-- callable by anon. Returns zero or one row — never distinguishes "no such
-- code" from "wrong code" in a way that would help enumerate codes.
create function resolve_join_code(input_code text)
returns table (company_id uuid, company_name text)
language sql
security definer
set search_path = public
stable
as $$
  select c.id, c.name
  from company_join_codes jc
  join companies c on c.id = jc.company_id
  where jc.code = input_code;
$$;

grant execute on function resolve_join_code(text) to anon, authenticated;

create type join_request_status as enum ('pending', 'approved', 'denied');

create table company_join_requests (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  status join_request_status not null default 'pending',
  requested_at timestamptz not null default now(),
  decided_at timestamptz,
  decided_by uuid references profiles(id) on delete set null,
  unique (user_id, company_id)
);

create index company_join_requests_company_id_idx on company_join_requests(company_id);

alter table company_join_requests enable row level security;
-- No anon/authenticated policies — writes go through service-role server
-- actions (join.ts), same as pending_invites. Reads for the Team page go
-- through the function below instead of a SELECT policy, so a caller can
-- only ever see their own company's requests, never by forging company_id.

create function list_pending_join_requests()
returns table (
  id uuid,
  email text,
  full_name text,
  requested_at timestamptz
)
language sql
security definer
set search_path = public
stable
as $$
  select r.id, r.email, r.full_name, r.requested_at
  from company_join_requests r
  where r.company_id = auth_company_id()
    and r.status = 'pending'
    and is_fleet_manager_or_above()
  order by r.requested_at asc;
$$;

grant execute on function list_pending_join_requests() to authenticated;
