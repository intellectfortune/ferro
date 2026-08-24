-- company_connections: third-party integrations per company (Stripe,
-- Instagram, Bouncie GPS, Google/Meta ads, ...). Not surfaced in the app
-- yet — this just reserves the shape so Settings > Connections and
-- feature-gating logic can build on top of it later without a schema
-- rework.
--
-- Security note: `credentials` holds encrypted tokens/secrets. This table
-- is deliberately NOT readable or writable by the anon/authenticated
-- roles at all (no RLS policies granted to them below) — only
-- `service_role` (i.e. server-only code using the service role key) can
-- touch it directly. UI code and feature-gating checks must go through
-- the `company_connection_statuses()` function instead, which exposes
-- connected/disconnected status only, never the credentials column.

create type connection_provider as enum (
  'stripe',
  'instagram',
  'bouncie',
  'google_ads',
  'meta_ads'
);
create type connection_status as enum ('connected', 'disconnected');

create table company_connections (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  provider connection_provider not null,
  status connection_status not null default 'disconnected',
  credentials jsonb,
  connected_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, provider)
);

create index company_connections_company_id_idx on company_connections(company_id);

create trigger company_connections_set_updated_at before update on company_connections
  for each row execute function set_updated_at();

alter table company_connections enable row level security;
-- No policies granted to anon/authenticated on purpose — see note above.

-- Safe accessor for the UI: status + timestamp only, scoped to the
-- caller's own company, owner/broker only. Never returns `credentials`.
create function company_connection_statuses()
returns table (
  provider connection_provider,
  status connection_status,
  connected_at timestamptz
)
language sql
security definer
set search_path = public
stable
as $$
  select cc.provider, cc.status, cc.connected_at
  from company_connections cc
  where cc.company_id = auth_company_id() and is_owner_or_broker();
$$;

grant execute on function company_connection_statuses() to authenticated;
