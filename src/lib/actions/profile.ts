import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types/database";

export async function getCurrentProfile() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, company_id, role, full_name, email")
    .eq("id", user.id)
    .single();

  return profile;
}

export function canManageVehicles(role: UserRole | undefined) {
  return role === "owner" || role === "broker";
}
