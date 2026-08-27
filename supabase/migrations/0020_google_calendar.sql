-- Google Calendar integration: per-company OAuth connection (same shape as
-- Bouncie/DocuSign/PandaDoc via company_connections), plus the column
-- needed to track which Google event a booking is synced to, so an edit
-- or delete in Ferro updates/removes the right event instead of creating
-- duplicates.

alter type connection_provider add value 'google_calendar';

alter table bookings add column google_calendar_event_id text;
