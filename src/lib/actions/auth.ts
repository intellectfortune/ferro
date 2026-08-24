"use server";

import { createClient } from "@/lib/supabase/server";
import { ensureCompanyProvisioned } from "@/lib/actions/provision";
import { checkRateLimit } from "@/lib/rate-limit";
import { redirect } from "next/navigation";

export type AuthActionState = { error: string | null };

export async function signIn(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const rl = await checkRateLimit("auth");
  if (!rl.ok) return { error: rl.error };

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/dashboard");
}

export async function signUpOwner(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const rl = await checkRateLimit("auth");
  if (!rl.ok) return { error: rl.error };

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("full_name") ?? "");
  const companyName = String(formData.get("company_name") ?? "");
  const companySlug = slugify(String(formData.get("company_slug") ?? ""));

  if (!companyName || !companySlug) {
    return { error: "Company name and slug are required." };
  }

  const supabase = await createClient();

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp(
    {
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          company_name: companyName,
          company_slug: companySlug,
        },
      },
    }
  );

  if (signUpError) {
    return { error: signUpError.message };
  }

  // If email confirmation is required, there is no session yet — the
  // company gets created on first login instead (ensureCompanyProvisioned
  // reads company_name/company_slug back out of the auth metadata set above).
  if (!signUpData.session) {
    return { error: null };
  }

  await ensureCompanyProvisioned();

  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
