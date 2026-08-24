-- Ferro Phase 1 schema: companies, roles, vehicles, bookings/service events, photos.
-- Run this in the Supabase SQL editor, or via `supabase db push`.

-- ============================================================
-- Extensions
-- ============================================================
create extension if not exists "pgcrypto";

-- ============================================================
-- Enums
-- ============================================================
create type user_role as enum ('owner', 'broker', 'employee');
create type vehicle_status as enum ('draft', 'published', 'archived');
create type booking_status as enum ('inquiry', 'confirmed', 'in_progress', 'completed', 'cancelled');
create type calendar_event_type as enum ('booking', 'service', 'detailing', 'inspection', 'blocked');
create type photo_category as enum ('listing_photo', 'id_doc', 'dec_page', 'other_doc');

-- ============================================================
-- companies
-- ============================================================
create table companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  logo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- profiles (1:1 with auth.users)
-- ============================================================
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  company_id uuid not null references companies(id) on delete cascade,
  role user_role not null default 'employee',
  full_name text,
  email text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_company_id_idx on profiles(company_id);

-- ============================================================
-- vehicles
-- ============================================================
create table vehicles (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  make text not null,
  model text not null,
  year int,
  color text,
  vin text,
  license_plate text,
  daily_rate numeric(10, 2),
  specs jsonb not null default '{}'::jsonb, -- horsepower, top_speed, seats, transmission, etc.
  description text,
  status vehicle_status not null default 'draft',
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index vehicles_company_id_idx on vehicles(company_id);
create index vehicles_status_idx on vehicles(status);

-- ============================================================
-- vehicle_photos (listing photos + ID/dec page docs)
-- ============================================================
create table vehicle_photos (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  vehicle_id uuid not null references vehicles(id) on delete cascade,
  category photo_category not null default 'listing_photo',
  storage_path text not null, -- path within the `vehicle-photos` storage bucket
  caption text,
  is_public boolean not null default false, -- only listing_photo rows are ever shown publicly
  uploaded_by uuid not null references profiles(id) on delete cascade,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index vehicle_photos_vehicle_id_idx on vehicle_photos(vehicle_id);
create index vehicle_photos_company_id_idx on vehicle_photos(company_id);
create index vehicle_photos_uploaded_by_idx on vehicle_photos(uploaded_by);

-- ============================================================
-- bookings (CRM)
-- ============================================================
create table bookings (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  vehicle_id uuid not null references vehicles(id) on delete cascade,
  customer_name text not null,
  customer_email text,
  customer_phone text,
  start_at timestamptz not null,
  end_at timestamptz not null,
  status booking_status not null default 'inquiry',
  total_price numeric(10, 2),
  notes text,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bookings_valid_range check (end_at > start_at)
);

create index bookings_company_id_idx on bookings(company_id);
create index bookings_vehicle_id_idx on bookings(vehicle_id);
create index bookings_start_at_idx on bookings(start_at);

-- ============================================================
-- calendar_events (service, detailing, inspection, manual blocks)
-- Bookings appear on the calendar too, joined in application code;
-- this table covers everything that isn't a customer booking.
-- ============================================================
create table calendar_events (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  vehicle_id uuid not null references vehicles(id) on delete cascade,
  type calendar_event_type not null default 'service',
  title text not null,
  start_at timestamptz not null,
  end_at timestamptz not null,
  notes text,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint calendar_events_valid_range check (end_at > start_at)
);

create index calendar_events_company_id_idx on calendar_events(company_id);
create index calendar_events_vehicle_id_idx on calendar_events(vehicle_id);
create index calendar_events_start_at_idx on calendar_events(start_at);

-- ============================================================
-- updated_at triggers
-- ============================================================
create function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger companies_set_updated_at before update on companies
  for each row execute function set_updated_at();
create trigger profiles_set_updated_at before update on profiles
  for each row execute function set_updated_at();
create trigger vehicles_set_updated_at before update on vehicles
  for each row execute function set_updated_at();
create trigger bookings_set_updated_at before update on bookings
  for each row execute function set_updated_at();
create trigger calendar_events_set_updated_at before update on calendar_events
  for each row execute function set_updated_at();
