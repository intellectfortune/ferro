"use server";

import { type EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { ensureCompanyProvisioned } from "@/lib/actions/provision";
import { redirect } from "next/navigation";

export type ConfirmActionState = { error: string | null };

export async function confirmEmail(
  tokenHash: string,
  type: EmailOtpType,
  next: string
): Promise<ConfirmActionState> {
  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    type,
    token_hash: tokenHash,
  });

  if (error) {
    return { error: error.message };
  }

  await ensureCompanyProvisioned();
  redirect(next);
}
