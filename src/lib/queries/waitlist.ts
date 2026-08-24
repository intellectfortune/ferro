import { createClient } from "@/lib/supabase/server";

export async function getWaitlistCount() {
  const supabase = await createClient();
  const { data } = await supabase.rpc("waitlist_count");
  return data ?? 0;
}
