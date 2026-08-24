import { createClient } from "@/lib/supabase/server";

/**
 * Ensures a signed-in user who signed up as an owner (and therefore has
 * company_name/company_slug in their auth metadata) has a company +
 * profile row. Safe to call on every dashboard load — a no-op once the
 * profile exists. Invited brokers/employees get their profile from the
 * `handle_new_user` DB trigger instead, so this never runs for them.
 */
export async function ensureCompanyProvisioned() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (profile) return;

  const companyName = user.user_metadata?.company_name as string | undefined;
  const companySlug = user.user_metadata?.company_slug as string | undefined;

  if (!companyName || !companySlug) return;

  await supabase.rpc("create_company_and_owner", {
    company_name: companyName,
    company_slug: companySlug,
  });
}
