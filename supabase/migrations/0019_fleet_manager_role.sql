-- New role: fleet_manager, ranked Owner > Fleet Manager > Broker > Employee.
-- Owner and Broker used to be one equal top tier ("is_owner_or_broker") —
-- Fleet Manager now occupies that full-access tier, and Broker is demoted
-- to a narrower operational role (bookings/calendar/vehicles/documents/
-- contracts, but no billing, company settings, team management, or
-- deletes beyond bookings they created themselves).

alter type user_role add value 'fleet_manager';

-- ============================================================
-- Rename + redefine the existing tier check
-- ============================================================
-- Renaming (not just replacing the body) means every existing policy that
-- referenced is_owner_or_broker() — Postgres compiles policies against the
-- function's OID, not its name — automatically and correctly becomes
-- Fleet-Manager-tier-restricted with no further changes needed: companies
-- update, profile role management, vehicle deletes, calendar event
-- deletes, contract deletes, invoices, listing_requests, campaigns,
-- inquiries deletes, and company_connection_statuses() all pick this up
-- for free. Only the places Broker explicitly keeps (below) need a new,
-- separate function.
alter function is_owner_or_broker() rename to is_fleet_manager_or_above();

create or replace function is_fleet_manager_or_above()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select auth_role() in ('owner', 'fleet_manager');
$$;

create function is_broker_or_above()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select auth_role() in ('owner', 'fleet_manager', 'broker');
$$;

-- ============================================================
-- vehicles: insert now open to everyone (Employees can add vehicles);
-- update stays broker-or-above (Broker keeps editing); delete already
-- correctly became fleet-manager-or-above via the rename above.
-- ============================================================
drop policy "vehicles: owner/broker can insert" on vehicles;
create policy "vehicles: members can insert"
  on vehicles for insert
  to authenticated
  with check (company_id = auth_company_id());

drop policy "vehicles: owner/broker can update" on vehicles;
create policy "vehicles: broker+ can update"
  on vehicles for update
  to authenticated
  using (company_id = auth_company_id() and is_broker_or_above())
  with check (company_id = auth_company_id() and is_broker_or_above());

-- ============================================================
-- vehicle_photos: Broker keeps managing the fleet's photos/documents,
-- same as today — explicitly broker-or-above rather than inheriting the
-- stricter fleet-manager-only tier from the rename.
-- ============================================================
drop policy "vehicle_photos: owner/broker read all company photos" on vehicle_photos;
create policy "vehicle_photos: broker+ read all company photos"
  on vehicle_photos for select
  to authenticated
  using (company_id = auth_company_id() and is_broker_or_above());

drop policy "vehicle_photos: owner/broker can update any, employee own" on vehicle_photos;
create policy "vehicle_photos: broker+ can update any, employee own"
  on vehicle_photos for update
  to authenticated
  using (
    company_id = auth_company_id()
    and (is_broker_or_above() or uploaded_by = auth.uid())
  )
  with check (
    company_id = auth_company_id()
    and (is_broker_or_above() or uploaded_by = auth.uid())
  );

drop policy "vehicle_photos: owner/broker can delete any, employee own" on vehicle_photos;
create policy "vehicle_photos: broker+ can delete any, employee own"
  on vehicle_photos for delete
  to authenticated
  using (
    company_id = auth_company_id()
    and (is_broker_or_above() or uploaded_by = auth.uid())
  );

-- ============================================================
-- bookings: delete becomes Fleet Manager+ for any booking, or Broker for
-- a booking they created themselves. Employees still can't delete at all.
-- ============================================================
drop policy "bookings: owner/broker can delete" on bookings;
create policy "bookings: fleet manager+ or broker-own can delete"
  on bookings for delete
  to authenticated
  using (
    company_id = auth_company_id()
    and (is_fleet_manager_or_above() or (auth_role() = 'broker' and created_by = auth.uid()))
  );

-- ============================================================
-- storage.objects: same broker-keeps-documents reasoning as vehicle_photos
-- above, for both buckets.
-- ============================================================
drop policy "vehicle-photos: owner/broker can upload" on storage.objects;
create policy "vehicle-photos: broker+ can upload"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'vehicle-photos'
    and (storage.foldername(name))[1] = auth_company_id()::text
    and is_broker_or_above()
  );

drop policy "vehicle-photos: owner/broker can update" on storage.objects;
create policy "vehicle-photos: broker+ can update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'vehicle-photos'
    and (storage.foldername(name))[1] = auth_company_id()::text
    and is_broker_or_above()
  );

drop policy "vehicle-photos: owner/broker can delete" on storage.objects;
create policy "vehicle-photos: broker+ can delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'vehicle-photos'
    and (storage.foldername(name))[1] = auth_company_id()::text
    and is_broker_or_above()
  );

drop policy "vehicle-docs: owner/broker can view all company docs" on storage.objects;
create policy "vehicle-docs: broker+ can view all company docs"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'vehicle-docs'
    and (storage.foldername(name))[1] = auth_company_id()::text
    and is_broker_or_above()
  );

drop policy "vehicle-docs: owner/broker can modify any, employee own" on storage.objects;
create policy "vehicle-docs: broker+ can modify any, employee own"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'vehicle-docs'
    and (storage.foldername(name))[1] = auth_company_id()::text
    and (is_broker_or_above() or owner = auth.uid())
  );

drop policy "vehicle-docs: owner/broker can delete any, employee own" on storage.objects;
create policy "vehicle-docs: broker+ can delete any, employee own"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'vehicle-docs'
    and (storage.foldername(name))[1] = auth_company_id()::text
    and (is_broker_or_above() or owner = auth.uid())
  );
