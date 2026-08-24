-- team_messages channels: splits the single company-wide feed into named
-- channels (General/Bookings/Maintenance), matching the original design
-- reference. Fixed set for now rather than user-created channels — that's
-- a bigger feature than "give the chat some structure."

create type team_chat_channel as enum ('general', 'bookings', 'maintenance');

alter table team_messages
  add column channel team_chat_channel not null default 'general';

create index team_messages_company_id_channel_created_at_idx
  on team_messages(company_id, channel, created_at);
