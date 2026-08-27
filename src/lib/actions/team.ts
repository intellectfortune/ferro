"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { getCurrentProfile, canManageVehicles } from "@/lib/actions/profile";
import { checkRateLimit } from "@/lib/rate-limit";
import { revalidatePath } from "next/cache";
import type { UserRole } from "@/types/database";

export type TeamActionState = { error: string | null; success?: boolean; message?: string };

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
    // A previously-removed member's auth.users row still exists — removing
    // them only ever deleted their profile, deliberately, since the account
    // itself may be legitimately reused later. inviteUserByEmail() can't
    // create a second account for the same email, and handle_new_user()
    // only fires on brand-new accounts, so re-inviting that email would
    // otherwise dead-end here. If they have no profile anywhere right now,
    // link them to this company directly instead.
    const alreadyRegistered =
      error.code === "email_exists" ||
      error.code === "user_already_exists" ||
      /already.*registered/i.test(error.message);

    if (alreadyRegistered) {
      const { data: reinviteId, error: lookupError } = await service.rpc(
        "find_reinvitable_user_id",
        { target_email: email }
      );

      if (!lookupError && reinviteId) {
        const { error: profileError } = await service.from("profiles").insert({
          id: reinviteId,
          company_id: profile.company_id,
          role,
          email,
        });

        if (profileError) {
          return { error: profileError.message };
        }

        await service
          .from("pending_invites")
          .delete()
          .eq("email", email)
          .eq("company_id", profile.company_id);

        revalidatePath("/dashboard/team");
        return {
          error: null,
          success: true,
          message:
            "This person already has a Ferro account — added them directly. They can log in with their existing credentials.",
        };
      }

      return {
        error:
          "This email is already associated with an active Ferro account and can't be invited here.",
      };
    }

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
