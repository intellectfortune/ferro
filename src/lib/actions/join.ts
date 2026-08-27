"use server";

import { randomInt } from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { getCurrentProfile, isFleetManagerOrAbove } from "@/lib/actions/profile";
import { checkRateLimit } from "@/lib/rate-limit";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { UserRole } from "@/types/database";

export type JoinActionState = { error: string | null; success?: boolean };

// Excludes 0/O/1/I/L — ambiguous when read aloud or typed by hand.
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 8;
const CODE_GENERATION_ATTEMPTS = 5;

function generateCode() {
  return Array.from({ length: CODE_LENGTH }, () => CODE_ALPHABET[randomInt(CODE_ALPHABET.length)]).join(
    ""
  );
}

/**
 * (Re)generates the company's join code. company_join_codes has no RLS
 * grants for authenticated/anon (migration 0021), so this writes through
 * the service client — permission is enforced here in the action, not by
 * the database.
 */
export async function regenerateJoinCode(): Promise<{ error: string | null; code?: string }> {
  const profile = await getCurrentProfile();
  if (!profile || !isFleetManagerOrAbove(profile.role)) {
    return { error: "You don't have permission to manage the join code." };
  }

  const service = createServiceClient();

  for (let attempt = 1; attempt <= CODE_GENERATION_ATTEMPTS; attempt++) {
    const code = generateCode();
    const { error } = await service.from("company_join_codes").upsert(
      { company_id: profile.company_id, code, regenerated_at: new Date().toISOString() },
      { onConflict: "company_id" }
    );

    if (!error) {
      revalidatePath("/dashboard/team");
      return { error: null, code };
    }

    // Extremely unlikely at this code space, but a unique-constraint hit
    // on `code` (not company_id) just means try another random one.
    if (!error.message.includes("duplicate")) {
      return { error: error.message };
    }
  }

  return { error: "Couldn't generate a unique join code — try again." };
}

/**
 * Public-facing: called from the /join page before the visitor has an
 * account. Creates a real auth user, then a company_join_requests row —
 * deliberately never a profiles row, which is the only thing that grants
 * real access (see migration 0021's comment). company_id comes only from
 * resolve_join_code()'s own lookup, never trusted from client input
 * directly, so a forged company_id in the form can't grant a request
 * against a company the code doesn't actually belong to.
 */
export async function submitJoinRequest(
  _prevState: JoinActionState,
  formData: FormData
): Promise<JoinActionState> {
  const rl = await checkRateLimit("auth");
  if (!rl.ok) return { error: rl.error };

  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const joinCode = String(formData.get("join_code") ?? "")
    .trim()
    .toUpperCase();

  if (!fullName || !email || !password || !joinCode) {
    return { error: "All fields are required." };
  }

  const supabase = await createClient();
  const { data: resolved, error: resolveError } = await supabase.rpc("resolve_join_code", {
    input_code: joinCode,
  });

  if (resolveError || !resolved || resolved.length === 0) {
    return { error: "That join code isn't valid. Double-check it with your company admin." };
  }

  const { company_id: companyId } = resolved[0];

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });

  if (signUpError) {
    return { error: signUpError.message };
  }
  if (!signUpData.user) {
    return { error: "Couldn't create your account. Try again." };
  }

  const service = createServiceClient();
  const { error: requestError } = await service.from("company_join_requests").upsert(
    {
      company_id: companyId,
      user_id: signUpData.user.id,
      email,
      full_name: fullName,
      // Explicit, not just the default: if this ever hits the conflict
      // path, it should reopen a previously denied/approved request
      // rather than silently leaving its old status in place.
      status: "pending",
      decided_at: null,
      decided_by: null,
    },
    { onConflict: "user_id,company_id" }
  );

  if (requestError) {
    return { error: requestError.message };
  }

  redirect("/join/pending");
}

/**
 * Used by the dashboard layout to tell "no profile because pending
 * approval" apart from "no profile at all" — the latter goes to /signup,
 * the former should land somewhere that explains they're waiting, not a
 * page inviting them to create a whole new company.
 */
export async function hasPendingJoinRequest(userId: string) {
  const service = createServiceClient();
  const { count } = await service
    .from("company_join_requests")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "pending");

  return (count ?? 0) > 0;
}

const APPROVABLE_ROLES: UserRole[] = ["fleet_manager", "broker", "employee"];

/**
 * Approve/deny both re-check the request's company_id against the
 * caller's own company — list_pending_join_requests() already scopes
 * what shows up in the UI, but a request id could in principle be guessed,
 * so this is the real enforcement point, not the UI.
 */
export async function approveJoinRequest(
  requestId: string,
  _prevState: JoinActionState,
  formData: FormData
): Promise<JoinActionState> {
  const profile = await getCurrentProfile();
  if (!profile || !isFleetManagerOrAbove(profile.role)) {
    return { error: "You don't have permission to approve join requests." };
  }

  const role = String(formData.get("role") ?? "") as UserRole;
  if (!APPROVABLE_ROLES.includes(role)) {
    return { error: "Choose a valid role." };
  }

  const service = createServiceClient();
  const { data: request, error: fetchError } = await service
    .from("company_join_requests")
    .select("id, company_id, user_id, email, full_name, status")
    .eq("id", requestId)
    .single();

  if (fetchError || !request) {
    return { error: "Join request not found." };
  }
  if (request.company_id !== profile.company_id) {
    return { error: "That request doesn't belong to your company." };
  }
  if (request.status !== "pending") {
    return { error: "That request has already been decided." };
  }

  const { error: profileError } = await service.from("profiles").insert({
    id: request.user_id,
    company_id: request.company_id,
    role,
    email: request.email,
    full_name: request.full_name,
  });
  if (profileError) {
    return { error: profileError.message };
  }

  await service
    .from("company_join_requests")
    .update({ status: "approved", decided_at: new Date().toISOString(), decided_by: profile.id })
    .eq("id", requestId);

  revalidatePath("/dashboard/team");
  return { error: null, success: true };
}

export async function denyJoinRequest(requestId: string) {
  const profile = await getCurrentProfile();
  if (!profile || !isFleetManagerOrAbove(profile.role)) {
    throw new Error("You don't have permission to deny join requests.");
  }

  const service = createServiceClient();
  const { data: request, error: fetchError } = await service
    .from("company_join_requests")
    .select("id, company_id, status")
    .eq("id", requestId)
    .single();

  if (fetchError || !request) {
    throw new Error("Join request not found.");
  }
  if (request.company_id !== profile.company_id) {
    throw new Error("That request doesn't belong to your company.");
  }
  if (request.status !== "pending") {
    throw new Error("That request has already been decided.");
  }

  await service
    .from("company_join_requests")
    .update({ status: "denied", decided_at: new Date().toISOString(), decided_by: profile.id })
    .eq("id", requestId);

  revalidatePath("/dashboard/team");
}
