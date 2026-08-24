-- invoices: real Stripe invoicing for rental bookings. Statuses mirror
-- Stripe's own invoice status vocabulary directly (draft/open/paid/void/
-- uncollectible) so webhook updates are a straight passthrough rather than
-- a remapping layer.
create type invoice_status as enum ('draft', 'open', 'paid', 'void', 'uncollectible');

create table invoices (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  booking_id uuid not null references bookings(id) on delete cascade,
  stripe_invoice_id text not null unique,
  stripe_customer_id text not null,
  amount numeric(10, 2) not null,
  status invoice_status not null default 'draft',
  hosted_invoice_url text,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index invoices_company_id_idx on invoices(company_id);
create index invoices_booking_id_idx on invoices(booking_id);

create trigger invoices_set_updated_at before update on invoices
  for each row execute function set_updated_at();

alter table invoices enable row level security;

-- Billing is owner/broker territory, same as campaigns — employees don't
-- see or manage invoices.
create policy "invoices: owner/broker full access"
  on invoices for all
  to authenticated
  using (company_id = auth_company_id() and is_owner_or_broker())
  with check (company_id = auth_company_id() and is_owner_or_broker());
