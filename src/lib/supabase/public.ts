import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Anon-key client for public, unauthenticated reads with no cookies to
 * read. Unlike `server.ts`'s client, this doesn't call `cookies()`, so
 * pages that only need public data (e.g. the marketing homepage's
 * waitlist count) can be statically rendered at build time instead of
 * being forced into per-request dynamic rendering. Still subject to RLS,
 * unlike the service-role client.
 */
export function createPublicClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
