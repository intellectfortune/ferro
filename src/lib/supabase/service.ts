import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Service-role client for trusted server-only contexts with no user
 * session to read cookies from (e.g. the Stripe webhook). Bypasses RLS —
 * never expose this to the client or use it to serve user requests.
 */
export function createServiceClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
