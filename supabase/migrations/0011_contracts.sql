-- contracts: rental agreements sent for e-signature via DocuSign, one
-- per booking. Status mirrors DocuSign's own envelope status vocabulary
-- (sent/delivered/completed/declined/voided) plus a local 'draft' for
-- before it's been sent, so a Connect webhook update is a straight
-- passthrough — same approach as `invoices` and Stripe.

alter type connection_provider add value 'docusign';

create type contract_status as enum (
  'draft',
  'sent',
  'delivered',
  'completed',
  'declined',
  'voided'
);

create table contracts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  booking_id uuid not null references bookings(id) on delete cascade,
  docusign_envelope_id text,
  status contract_status not null default 'draft',
  customer_name text not null,
  customer_email text not null,
  sent_at timestamptz,
  completed_at timestamptz,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index contracts_company_id_idx on contracts(company_id);
create index contracts_booking_id_idx on contracts(booking_id);
-- Partial + unique: most rows start out envelope-less (draft), but once
-- sent the envelope id is how the Connect webhook finds the row.
create unique index contracts_envelope_id_idx on contracts(docusign_envelope_id)
  where docusign_envelope_id is not null;

create trigger contracts_set_updated_at before update on contracts
  for each row execute function set_updated_at();

alter table contracts enable row level security;

-- Same access shape as bookings: contracts are CRM territory (employees
-- send and track them day to day), not billing.
create policy "contracts: members can read company contracts"
  on contracts for select
  to authenticated
  using (company_id = auth_company_id());

create policy "contracts: members can insert"
  on contracts for insert
  to authenticated
  with check (company_id = auth_company_id());

create policy "contracts: members can update"
  on contracts for update
  to authenticated
  using (company_id = auth_company_id())
  with check (company_id = auth_company_id());

create policy "contracts: owner/broker can delete"
  on contracts for delete
  to authenticated
  using (company_id = auth_company_id() and is_owner_or_broker());
