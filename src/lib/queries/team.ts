import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function listTeamMembers() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, created_at")
    .order("created_at", { ascending: true });

  return data ?? [];
}

/**
 * company_join_codes has no RLS grants for authenticated/anon (see
 * migration 0021), so this goes through the service client. Callers must
 * gate on isFleetManagerOrAbove() themselves before calling this — it
 * doesn't check permissions itself, only scopes to the given company.
 */
export async function getCompanyJoinCode(companyId: string) {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("company_join_codes")
    .select("code")
    .eq("company_id", companyId)
    .maybeSingle();

  return data?.code ?? null;
}

/**
 * list_pending_join_requests() does its own auth_company_id() +
 * is_fleet_manager_or_above() scoping inside the function itself, so this
 * is safe to call through the regular per-user client.
 */
export async function listPendingJoinRequests() {
  const supabase = await createClient();
  const { data } = await supabase.rpc("list_pending_join_requests");
  return data ?? [];
}
