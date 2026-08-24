import { createPublicClient } from "@/lib/supabase/public";

export async function getWaitlistCount() {
  const supabase = createPublicClient();
  const { data } = await supabase.rpc("waitlist_count");
  return data ?? 0;
}
