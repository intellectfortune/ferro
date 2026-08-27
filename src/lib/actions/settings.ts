"use server";

import { createServiceClient } from "@/lib/supabase/service";
import { getCurrentProfile, isFleetManagerOrAbove } from "@/lib/actions/profile";
import { revalidatePath } from "next/cache";
import type { ConnectionProvider } from "@/types/database";

/**
 * company_connections has no RLS policies for authenticated/anon (see
 * migration 0006) — only service-role code can touch it, so this goes
 * through the service client rather than the per-user one.
 */
export async function disconnectConnection(provider: ConnectionProvider) {
  const profile = await getCurrentProfile();
  if (!profile || !isFleetManagerOrAbove(profile.role)) {
    throw new Error("You don't have permission to manage connections.");
  }

  const service = createServiceClient();
  const { error } = await service
    .from("company_connections")
    .update({ status: "disconnected", credentials: null, connected_at: null })
    .eq("company_id", profile.company_id)
    .eq("provider", provider);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard/tracking");
  revalidatePath("/dashboard/vehicles");
  revalidatePath("/dashboard/contracts");
}
