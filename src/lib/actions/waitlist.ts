"use server";

import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { revalidatePath } from "next/cache";

export type WaitlistActionState = { error: string | null; success?: boolean };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function joinWaitlist(
  _prevState: WaitlistActionState,
  formData: FormData
): Promise<WaitlistActionState> {
  const rl = await checkRateLimit("public");
  if (!rl.ok) return { error: rl.error };

  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  if (!EMAIL_RE.test(email)) {
    return { error: "Enter a valid email address." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("waitlist_signups").insert({ email });

  if (error && error.code !== "23505") {
    return { error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/waitlist");
  return { error: null, success: true };
}
