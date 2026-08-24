-- Security fix: handle_new_user() previously trusted company_id/role
-- straight out of raw_user_meta_data, which is fully client-controlled —
-- options.data on supabase.auth.signUp() lets ANY caller (with only the
-- public anon key) set arbitrary metadata. That meant anyone could grant
-- themselves 'owner' on any company_id they could obtain, without ever
-- being invited. pending_invites makes this server-authoritative instead:
-- only a row inviteTeamMember() actually wrote (behind an owner/broker
-- check, via the service role) can grant a profile on signup.

create table pending_invites (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  company_id uuid not null references companies(id) on delete cascade,
  role user_role not null,
  invited_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (email, company_id)
);

create index pending_invites_email_idx on pending_invites(email);

alter table pending_invites enable row level security;
-- No policies for anon/authenticated on purpose — service-role only,
-- same reasoning as company_connections.credentials.

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  invite pending_invites;
begin
  select * into invite
  from pending_invites
  where email = new.email
  order by created_at desc
  limit 1;

  if invite.id is not null then
    insert into profiles (id, company_id, role, email, full_name)
    values (
      new.id,
      invite.company_id,
      invite.role,
      new.email,
      new.raw_user_meta_data ->> 'full_name'
    );
    delete from pending_invites where id = invite.id;
  end if;

  return new;
end;
$$;
