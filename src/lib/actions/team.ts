"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { getCurrentProfile, canManageVehicles } from "@/lib/actions/profile";
import { checkRateLimit } from "@/lib/rate-limit";
import { revalidatePath } from "next/cache";
import type { UserRole } from "@/types/database";

export type TeamActionState = { error: string | null; success?: boolean };

const INVITABLE_ROLES: UserRole[] = ["owner", "broker", "employee"];

export async function inviteTeamMember(
  _prevState: TeamActionState,
  formData: FormData
): Promise<TeamActionState> {
  const profile = await getCurrentProfile();
  if (!profile || !canManageVehicles(profile.role)) {
    return { error: "You don't have permission to invite team members." };
  }

  const rl = await checkRateLimit("sensitive", profile.id);
  if (!rl.ok) return { error: rl.error };

  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const role = String(formData.get("role") ?? "employee") as UserRole;

  if (!email) {
    return { error: "Enter an email address." };
  }
  if (!INVITABLE_ROLES.includes(role)) {
    return { error: "Choose a valid role." };
  }

  let service;
  try {
    service = createServiceClient();
  } catch {
    return { error: "Invites aren't configured yet." };
  }

  // Server-authoritative: handle_new_user() reads company_id/role from
  // this row, not from signup metadata (which a client could set to
  // anything). See migration 0016 for why.
  const { error: inviteRowError } = await service.from("pending_invites").upsert(
    {
      email,
      company_id: profile.company_id,
      role,
      invited_by: profile.id,
    },
    { onConflict: "email,company_id" }
  );
  if (inviteRowError) {
    return { error: inviteRowError.message };
  }

  const { error } = await service.auth.admin.inviteUserByEmail(email);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/team");
  return { error: null, success: true };
}

export async function updateMemberRole(
  memberId: string,
  _prevState: TeamActionState,
  formData: FormData
): Promise<TeamActionState> {
  const profile = await getCurrentProfile();
  if (!profile || !canManageVehicles(profile.role)) {
    return { error: "You don't have permission to change roles." };
  }

  const role = String(formData.get("role") ?? "") as UserRole;
  if (!INVITABLE_ROLES.includes(role)) {
    return { error: "Choose a valid role." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", memberId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/team");
  return { error: null, success: true };
}

export async function removeMember(memberId: string) {
  const profile = await getCurrentProfile();
  if (!profile || !canManageVehicles(profile.role)) {
    throw new Error("You don't have permission to remove team members.");
  }
  if (memberId === profile.id) {
    throw new Error("You can't remove yourself.");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("profiles").delete().eq("id", memberId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard/team");
}
