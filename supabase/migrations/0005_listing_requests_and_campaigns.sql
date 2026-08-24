-- listing_requests: concierge flow for "Add to site" chat on the Vehicles tab.
-- A company member describes a car in plain language; today a Ferro admin
-- manually builds the public listing from the message and gets notified by
-- email. The shape (a free-text `message` plus `status`) is deliberately
-- generic so this can be swapped for AI auto-parsing later without a schema
-- change — an automated parser would just be another writer of `status`
-- and, eventually, a creator of the resulting `vehicles` row.
create type listing_request_status as enum ('pending', 'in_progress', 'completed', 'dismissed');

create table listing_requests (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  submitted_by uuid not null references profiles(id) on delete cascade,
  message text not null,
  status listing_request_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index listing_requests_company_id_idx on listing_requests(company_id);

create trigger listing_requests_set_updated_at before update on listing_requests
  for each row execute function set_updated_at();

alter table listing_requests enable row level security;

create policy "listing_requests: owner/broker read all company requests"
  on listing_requests for select
  to authenticated
  using (company_id = auth_company_id() and is_owner_or_broker());

create policy "listing_requests: employee reads own submissions"
  on listing_requests for select
  to authenticated
  using (
    company_id = auth_company_id()
    and auth_role() = 'employee'
    and submitted_by = auth.uid()
  );

create policy "listing_requests: members can submit"
  on listing_requests for insert
  to authenticated
  with check (company_id = auth_company_id() and submitted_by = auth.uid());

create policy "listing_requests: owner/broker can update status"
  on listing_requests for update
  to authenticated
  using (company_id = auth_company_id() and is_owner_or_broker())
  with check (company_id = auth_company_id());

-- ============================================================
-- campaigns: Phase 3 ads feature. Not built yet — this just reserves the
-- shape so campaigns aren't painted into a corner. `mode` is the key
-- decision captured now: whether the AI drafts and launches a campaign
-- unattended ('full_control') or drafts and waits for a human to approve
-- and click launch ('review').
-- ============================================================
create type campaign_mode as enum ('full_control', 'review');
create type campaign_status as enum ('draft', 'pending_review', 'active', 'paused', 'completed');

create table campaigns (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  vehicle_id uuid references vehicles(id) on delete set null,
  name text not null,
  platform text,
  mode campaign_mode not null default 'review',
  status campaign_status not null default 'draft',
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index campaigns_company_id_idx on campaigns(company_id);

create trigger campaigns_set_updated_at before update on campaigns
  for each row execute function set_updated_at();

alter table campaigns enable row level security;

-- Ads/billing-adjacent growth tooling: owner/broker only, same as billing.
create policy "campaigns: owner/broker full access"
  on campaigns for all
  to authenticated
  using (company_id = auth_company_id() and is_owner_or_broker())
  with check (company_id = auth_company_id() and is_owner_or_broker());
