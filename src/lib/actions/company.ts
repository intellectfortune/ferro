"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile, canManageVehicles } from "@/lib/actions/profile";
import { revalidatePath } from "next/cache";

export type CompanyActionState = { error: string | null; success?: boolean };

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function updateCompanyProfile(
  _prevState: CompanyActionState,
  formData: FormData
): Promise<CompanyActionState> {
  const profile = await getCurrentProfile();
  if (!profile || !canManageVehicles(profile.role)) {
    return { error: "You don't have permission to edit company settings." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const slug = slugify(String(formData.get("slug") ?? ""));

  if (!name || !slug) {
    return { error: "Company name and public URL slug are required." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("companies")
    .update({ name, slug })
    .eq("id", profile.company_id);

  if (error) {
    return {
      error: error.message.includes("duplicate")
        ? "That URL slug is already taken."
        : error.message,
    };
  }

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");
  return { error: null, success: true };
}
