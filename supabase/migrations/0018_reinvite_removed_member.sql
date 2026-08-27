-- Removing a team member (team.ts removeMember()) only ever deleted their
-- profiles row — it never touched auth.users, and it shouldn't: that
-- account may be legitimately reused later, and deleting it outright is
-- irreversible. But handle_new_user() only fires on auth.users INSERT, so
-- re-inviting that email later hits an existing (not new) auth user, the
-- trigger never runs, and inviteUserByEmail() itself just fails with
-- "already registered" — no path forward.
--
-- This gives inviteTeamMember() a safe way to recover: look up the
-- auth.users id for an email ONLY if it currently has no profiles row
-- anywhere (i.e. it isn't an active member of any company right now).
-- Deliberately returns null rather than an id whenever a profile already
-- exists — this must never be usable to pull an actively-employed member
-- away from another company just by inviting their email.
create function find_reinvitable_user_id(target_email text)
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select u.id
  from auth.users u
  where u.email = target_email
    and not exists (select 1 from profiles p where p.id = u.id)
  limit 1;
$$;

grant execute on function find_reinvitable_user_id(text) to service_role;
