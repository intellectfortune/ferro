-- Bouncie GPS tracking: links a vehicle to its Bouncie device (IMEI).
-- The account-level OAuth connection status already fits the existing
-- company_connections table (provider = 'bouncie', migration 0006) — this
-- just adds the per-vehicle device mapping on top of that.
alter table vehicles add column bouncie_imei text;
