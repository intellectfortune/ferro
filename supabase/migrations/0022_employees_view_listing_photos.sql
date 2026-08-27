-- Employees could only see vehicle_photos rows they'd uploaded themselves
-- (migration 0002's "employee reads own uploads only") — meaning they
-- couldn't see the fleet's own listing photos at all, since those are
-- usually uploaded by an owner/broker. Viewing the fleet's photos should
-- be open to every role; only upload/edit/delete stay role-scoped
-- (unchanged, via the broker+/fleet-manager+ policies from 0019).
--
-- Scoped to category = 'listing_photo' specifically, not the whole
-- table — vehicle_photos also holds id_doc/dec_page/other_doc rows, and
-- those must stay restricted to broker+ (all) / employee (own uploads
-- only), same as today. The underlying storage bucket for listing photos
-- ('vehicle-photos') is already public-readable, so this table-row policy
-- was the only actual blocker.
create policy "vehicle_photos: members can view listing photos"
  on vehicle_photos for select
  to authenticated
  using (company_id = auth_company_id() and category = 'listing_photo');
