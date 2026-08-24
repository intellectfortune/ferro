-- team_messages: a single company-wide internal chat feed. No channels/DMs
-- yet — just one stream per company, which is all "Team Chat" needs to be
-- useful today. Realtime is enabled so the feed updates live for everyone
-- looking at it.

create table team_messages (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  author_id uuid not null references profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 4000),
  created_at timestamptz not null default now()
);

create index team_messages_company_id_created_at_idx
  on team_messages(company_id, created_at);

alter table team_messages enable row level security;

create policy "team_messages: members can read company messages"
  on team_messages for select
  to authenticated
  using (company_id = auth_company_id());

create policy "team_messages: members can send messages"
  on team_messages for insert
  to authenticated
  with check (company_id = auth_company_id() and author_id = auth.uid());

create policy "team_messages: author can delete own message"
  on team_messages for delete
  to authenticated
  using (company_id = auth_company_id() and author_id = auth.uid());

alter publication supabase_realtime add table team_messages;
