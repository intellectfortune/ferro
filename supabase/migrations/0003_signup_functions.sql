-- Signup / invite flow.
--
-- Two ways a profile row gets created:
--
-- 1. Self-serve owner signup: client calls supabase.auth.signUp(), then
--    (once logged in) calls the `create_company_and_owner` RPC below to
--    create the company and become its owner.
--
-- 2. Invited broker/employee: an owner/broker calls a server-side route
--    that uses the Supabase service role to call
--    `auth.admin.inviteUserByEmail(email, { data: { company_id, role } })`.
--    When that invited user's auth.users row is created, the
--    `handle_new_user` trigger below reads company_id/role out of
--    raw_user_meta_data and creates their profile automatically.

-- ============================================================
-- create_company_and_owner: self-serve signup path
-- ============================================================
create function create_company_and_owner(company_name text, company_slug text)
returns companies
language plpgsql
security definer
set search_path = public
as $$
declare
  new_company companies;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if exists (select 1 from profiles where id = auth.uid()) then
    raise exception 'User already belongs to a company';
  end if;

  insert into companies (name, slug)
  values (company_name, company_slug)
  returning * into new_company;

  insert into profiles (id, company_id, role, email, full_name)
  values (
    auth.uid(),
    new_company.id,
    'owner',
    (select email from auth.users where id = auth.uid()),
    (select raw_user_meta_data ->> 'full_name' from auth.users where id = auth.uid())
  );

  return new_company;
end;
$$;

grant execute on function create_company_and_owner(text, text) to authenticated;

-- ============================================================
-- handle_new_user: invited broker/employee signup path
-- ============================================================
create function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.raw_user_meta_data ? 'company_id' and new.raw_user_meta_data ? 'role' then
    insert into profiles (id, company_id, role, email, full_name)
    values (
      new.id,
      (new.raw_user_meta_data ->> 'company_id')::uuid,
      (new.raw_user_meta_data ->> 'role')::user_role,
      new.email,
      new.raw_user_meta_data ->> 'full_name'
    );
  end if;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
