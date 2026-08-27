import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types/database";

/**
 * auth.getUser() is a real round-trip to Supabase's Auth server (it
 * validates the token server-side, unlike decoding a session locally) —
 * not a cheap local check. getCurrentProfile() is called independently
 * from the dashboard layout and from nearly every page/action, so
 * without this, a single page view could trigger it many times over.
 * cache() memoizes per request (React's request-scoped dedup for Server
 * Components), so every caller within the same render shares one call.
 *
 * Deliberately NOT extended to cache the profile row itself: the
 * dashboard layout re-queries the profile after provisioning a
 * brand-new owner's company on their first visit, and a cached profile
 * fetch would keep returning the pre-provisioning null within that same
 * request.
 */
export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

export async function getCurrentProfile() {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, company_id, role, full_name, email")
    .eq("id", user.id)
    .single();

  return profile;
}

/**
 * Owner > Fleet Manager > Broker > Employee. Owner/Fleet Manager have full
 * access (billing, company settings, team management, all deletes).
 * Broker is operational (vehicles/bookings/calendar/documents/contracts,
 * but no billing/settings/team, and can only delete bookings it created).
 * Employee has the same day-to-day operational access as Broker minus
 * vehicle edits and any delete rights.
 */
export function isFleetManagerOrAbove(role: UserRole | undefined) {
  return role === "owner" || role === "fleet_manager";
}

export function isBrokerOrAbove(role: UserRole | undefined) {
  return role === "owner" || role === "fleet_manager" || role === "broker";
}
