-- Needed for the Billing page's "upcoming payments" list.
alter table invoices add column due_date timestamptz;
