-- inquiries: a unified hub for incoming customer interest, regardless of
-- where it came from. `source` is the extension point — web_form ships
-- now, call (RingCentral) and instagram_dm slot in later without a schema
-- rework, same idea as `company_connections.provider`. Source-specific
-- extras (call duration, missed/answered, raw sync payload) live in
-- `metadata` rather than as sparse nullable columns, since each source
-- will want different extras and the set isn't fixed yet.

create type inquiry_source as enum ('web_form', 'call', 'instagram_dm');
create type inquiry_status as enum ('new', 'contacted', 'closed');

create table inquiries (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  vehicle_id uuid references vehicles(id) on delete set null,
  source inquiry_source not null,
  status inquiry_status not null default 'new',
  customer_name text,
  customer_email text,
  customer_phone text,
  message text,
  -- When the interaction actually happened (call time, DM time, form
  -- submit time) — distinct from created_at, which is when Ferro learned
  -- about it (may lag behind for synced sources like call log imports).
  occurred_at timestamptz not null default now(),
  -- Dedup key for synced sources (RingCentral call id, IG message id).
  -- Null for web form submissions, which can't repeat.
  external_ref text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index inquiries_company_id_occurred_at_idx
  on inquiries(company_id, occurred_at desc);
create index inquiries_vehicle_id_idx on inquiries(vehicle_id);
create unique index inquiries_source_external_ref_idx
  on inquiries(source, external_ref)
  where external_ref is not null;

create trigger inquiries_set_updated_at before update on inquiries
  for each row execute function set_updated_at();

alter table inquiries enable row level security;

create policy "inquiries: members can read company inquiries"
  on inquiries for select
  to authenticated
  using (company_id = auth_company_id());

create policy "inquiries: members can insert"
  on inquiries for insert
  to authenticated
  with check (company_id = auth_company_id());

-- Storefront visitors aren't authenticated — this is the only way an
-- inquiry reaches the table without a Ferro session. Restricted to
-- web_form so a public request can't masquerade as a call or DM.
create policy "inquiries: public can submit web form inquiries"
  on inquiries for insert
  to anon
  with check (source = 'web_form' and status = 'new');

create policy "inquiries: members can update"
  on inquiries for update
  to authenticated
  using (company_id = auth_company_id())
  with check (company_id = auth_company_id());

create policy "inquiries: owner/broker can delete"
  on inquiries for delete
  to authenticated
  using (company_id = auth_company_id() and is_owner_or_broker());
