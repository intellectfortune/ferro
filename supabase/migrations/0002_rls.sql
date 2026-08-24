-- Row Level Security for Ferro.
--
-- Role scoping: owner and broker are the same permission set — the
-- distinction between them is business model (does this company own
-- its vehicles, or run bookings on vehicles it doesn't own), not
-- access level. Both get full access to their company's vehicles,
-- bookings, calendar, photos, billing, and member/role management.
--   owner/broker  full access to everything in their company.
--   employee      CRM/calendar only: can read vehicles, create/update
--                 bookings & calendar events, upload photos. Cannot
--                 create/edit/delete vehicle listings, cannot see
--                 billing or company settings, and can only see
--                 photos they uploaded themselves (not other
--                 employees' uploads).

-- ============================================================
-- Helper functions (security definer to avoid RLS recursion)
-- ============================================================
create function auth_company_id()
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select company_id from profiles where id = auth.uid();
$$;

create function auth_role()
returns user_role
language sql
security definer
set search_path = public
stable
as $$
  select role from profiles where id = auth.uid();
$$;

create function is_owner_or_broker()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select auth_role() in ('owner', 'broker');
$$;

-- ============================================================
-- companies
-- ============================================================
alter table companies enable row level security;

create policy "companies: members can read own company"
  on companies for select
  to authenticated
  using (id = auth_company_id());

create policy "companies: public can read minimal company info"
  on companies for select
  to anon
  using (true); -- storefront needs to resolve a company by slug

create policy "companies: owner/broker can update own company"
  on companies for update
  to authenticated
  using (id = auth_company_id() and is_owner_or_broker())
  with check (id = auth_company_id() and is_owner_or_broker());

-- Company creation happens via the `handle_new_company` RPC (security
-- definer), not direct inserts, so no insert policy is granted here.

-- ============================================================
-- profiles
-- ============================================================
alter table profiles enable row level security;

create policy "profiles: members can read company profiles"
  on profiles for select
  to authenticated
  using (company_id = auth_company_id());

create policy "profiles: user can update own profile"
  on profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid() and role = (select role from profiles where id = auth.uid()));

create policy "profiles: owner/broker can update company member roles"
  on profiles for update
  to authenticated
  using (company_id = auth_company_id() and is_owner_or_broker())
  with check (company_id = auth_company_id());

create policy "profiles: owner/broker can remove company members"
  on profiles for delete
  to authenticated
  using (company_id = auth_company_id() and is_owner_or_broker() and id <> auth.uid());

-- ============================================================
-- vehicles
-- ============================================================
alter table vehicles enable row level security;

create policy "vehicles: members can read company vehicles"
  on vehicles for select
  to authenticated
  using (company_id = auth_company_id());

create policy "vehicles: public can read published vehicles"
  on vehicles for select
  to anon
  using (status = 'published');

create policy "vehicles: owner/broker can insert"
  on vehicles for insert
  to authenticated
  with check (company_id = auth_company_id() and is_owner_or_broker());

create policy "vehicles: owner/broker can update"
  on vehicles for update
  to authenticated
  using (company_id = auth_company_id() and is_owner_or_broker())
  with check (company_id = auth_company_id() and is_owner_or_broker());

create policy "vehicles: owner/broker can delete"
  on vehicles for delete
  to authenticated
  using (company_id = auth_company_id() and is_owner_or_broker());

-- ============================================================
-- vehicle_photos
-- ============================================================
alter table vehicle_photos enable row level security;

create policy "vehicle_photos: owner/broker read all company photos"
  on vehicle_photos for select
  to authenticated
  using (company_id = auth_company_id() and is_owner_or_broker());

create policy "vehicle_photos: employee reads own uploads only"
  on vehicle_photos for select
  to authenticated
  using (
    company_id = auth_company_id()
    and auth_role() = 'employee'
    and uploaded_by = auth.uid()
  );

create policy "vehicle_photos: public can read public listing photos"
  on vehicle_photos for select
  to anon
  using (
    is_public = true
    and category = 'listing_photo'
    and exists (
      select 1 from vehicles
      where vehicles.id = vehicle_photos.vehicle_id
      and vehicles.status = 'published'
    )
  );

create policy "vehicle_photos: members can upload"
  on vehicle_photos for insert
  to authenticated
  with check (company_id = auth_company_id() and uploaded_by = auth.uid());

create policy "vehicle_photos: owner/broker can update any, employee own"
  on vehicle_photos for update
  to authenticated
  using (
    company_id = auth_company_id()
    and (is_owner_or_broker() or uploaded_by = auth.uid())
  )
  with check (
    company_id = auth_company_id()
    and (is_owner_or_broker() or uploaded_by = auth.uid())
  );

create policy "vehicle_photos: owner/broker can delete any, employee own"
  on vehicle_photos for delete
  to authenticated
  using (
    company_id = auth_company_id()
    and (is_owner_or_broker() or uploaded_by = auth.uid())
  );

-- ============================================================
-- bookings
-- ============================================================
alter table bookings enable row level security;

create policy "bookings: members can read company bookings"
  on bookings for select
  to authenticated
  using (company_id = auth_company_id());

create policy "bookings: members can insert"
  on bookings for insert
  to authenticated
  with check (company_id = auth_company_id());

create policy "bookings: members can update"
  on bookings for update
  to authenticated
  using (company_id = auth_company_id())
  with check (company_id = auth_company_id());

create policy "bookings: owner/broker can delete"
  on bookings for delete
  to authenticated
  using (company_id = auth_company_id() and is_owner_or_broker());

-- ============================================================
-- calendar_events
-- ============================================================
alter table calendar_events enable row level security;

create policy "calendar_events: members can read company events"
  on calendar_events for select
  to authenticated
  using (company_id = auth_company_id());

create policy "calendar_events: members can insert"
  on calendar_events for insert
  to authenticated
  with check (company_id = auth_company_id());

create policy "calendar_events: members can update"
  on calendar_events for update
  to authenticated
  using (company_id = auth_company_id())
  with check (company_id = auth_company_id());

create policy "calendar_events: owner/broker can delete"
  on calendar_events for delete
  to authenticated
  using (company_id = auth_company_id() and is_owner_or_broker());
