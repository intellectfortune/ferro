-- PandaDoc as a second e-signature option alongside DocuSign. Companies
-- pick either or both — company_connections already supports multiple
-- simultaneous providers per company, so no new "which one" concept is
-- needed there, just a new provider value.
--
-- contracts gets a generic esign_provider + pandadoc_document_id rather
-- than renaming docusign_envelope_id, so the existing DocuSign flow
-- (and any contracts already sent through it) is untouched.

alter type connection_provider add value 'pandadoc';

alter table contracts add column esign_provider connection_provider;
alter table contracts add column pandadoc_document_id text;

-- Backfill: every existing contract with an envelope id was sent via
-- DocuSign (the only provider that existed before this migration).
update contracts set esign_provider = 'docusign' where docusign_envelope_id is not null;

create unique index contracts_pandadoc_document_id_idx on contracts(pandadoc_document_id)
  where pandadoc_document_id is not null;
