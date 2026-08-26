import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

/**
 * Creates a company + profile row for a user who signed up as an owner
 * (and therefore has company_name/company_slug in their auth metadata).
 * Call only when the caller has already confirmed the profile doesn't
 * exist yet — this used to re-check that itself (a second auth.getUser()
 * plus a second profile query on every single dashboard page load, on
 * top of the caller's own), which added real, always-paid latency to
 * every page for a check that's only ever relevant once, on a brand-new
 * owner's first visit. Invited brokers/employees get their profile from
 * the `handle_new_user` DB trigger instead, so this never runs for them.
 */
export async function ensureCompanyProvisioned(user: User) {
  const companyName = user.user_metadata?.company_name as string | undefined;
  const companySlug = user.user_metadata?.company_slug as string | undefined;

  if (!companyName || !companySlug) return;

  const supabase = await createClient();
  await supabase.rpc("create_company_and_owner", {
    company_name: companyName,
    company_slug: companySlug,
  });
}
