-- Storage buckets for vehicle media.
--
-- Two buckets, split by sensitivity:
--   vehicle-photos  public bucket  — listing photos shown on the public site.
--   vehicle-docs    private bucket — ID/dec page docs (owner sees all,
--                                    employees see only their own uploads).
--
-- Object path convention for both buckets: {company_id}/{vehicle_id}/{filename}
-- Supabase Storage automatically sets `owner` = auth.uid() of the uploader,
-- which we use for the "employee sees only their own uploads" rule.

insert into storage.buckets (id, name, public)
values
  ('vehicle-photos', 'vehicle-photos', true),
  ('vehicle-docs', 'vehicle-docs', false)
on conflict (id) do nothing;

-- ============================================================
-- vehicle-photos (public listing photos)
-- ============================================================
create policy "vehicle-photos: public can view"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'vehicle-photos');

create policy "vehicle-photos: owner/broker can upload"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'vehicle-photos'
    and (storage.foldername(name))[1] = auth_company_id()::text
    and is_owner_or_broker()
  );

create policy "vehicle-photos: owner/broker can update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'vehicle-photos'
    and (storage.foldername(name))[1] = auth_company_id()::text
    and is_owner_or_broker()
  );

create policy "vehicle-photos: owner/broker can delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'vehicle-photos'
    and (storage.foldername(name))[1] = auth_company_id()::text
    and is_owner_or_broker()
  );

-- ============================================================
-- vehicle-docs (private ID / dec page docs)
-- ============================================================
create policy "vehicle-docs: owner/broker can view all company docs"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'vehicle-docs'
    and (storage.foldername(name))[1] = auth_company_id()::text
    and is_owner_or_broker()
  );

create policy "vehicle-docs: employee can view own uploads"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'vehicle-docs'
    and (storage.foldername(name))[1] = auth_company_id()::text
    and auth_role() = 'employee'
    and owner = auth.uid()
  );

create policy "vehicle-docs: members can upload"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'vehicle-docs'
    and (storage.foldername(name))[1] = auth_company_id()::text
  );

create policy "vehicle-docs: owner/broker can modify any, employee own"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'vehicle-docs'
    and (storage.foldername(name))[1] = auth_company_id()::text
    and (is_owner_or_broker() or owner = auth.uid())
  );

create policy "vehicle-docs: owner/broker can delete any, employee own"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'vehicle-docs'
    and (storage.foldername(name))[1] = auth_company_id()::text
    and (is_owner_or_broker() or owner = auth.uid())
  );
