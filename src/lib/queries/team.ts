import { createClient } from "@/lib/supabase/server";

export async function listTeamMembers() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, created_at")
    .order("created_at", { ascending: true });

  return data ?? [];
}
