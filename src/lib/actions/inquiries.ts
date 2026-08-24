"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/actions/profile";
import { checkRateLimit } from "@/lib/rate-limit";
import { revalidatePath } from "next/cache";
import type { InquiryStatus } from "@/types/database";

export type InquiryFormState = { error: string | null; success?: boolean };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Public storefront contact form — no session, source is always web_form.
 * Bound to companyId/vehicleId from the page (`.bind(null, companyId, vehicleId)`).
 */
export async function submitInquiry(
  companyId: string,
  vehicleId: string | null,
  _prevState: InquiryFormState,
  formData: FormData
): Promise<InquiryFormState> {
  const rl = await checkRateLimit("public");
  if (!rl.ok) return { error: rl.error };

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!name) return { error: "Name is required." };
  if (!email || !EMAIL_RE.test(email)) {
    return { error: "Enter a valid email address." };
  }
  if (!message) return { error: "Message is required." };

  const supabase = await createClient();
  const { error } = await supabase.from("inquiries").insert({
    company_id: companyId,
    vehicle_id: vehicleId,
    source: "web_form",
    status: "new",
    customer_name: name,
    customer_email: email,
    customer_phone: phone || null,
    message,
  });

  if (error) {
    return { error: error.message };
  }

  return { error: null, success: true };
}

export async function updateInquiryStatus(inquiryId: string, status: InquiryStatus) {
  const profile = await getCurrentProfile();
  if (!profile) {
    throw new Error("Not authenticated.");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("inquiries")
    .update({ status })
    .eq("id", inquiryId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard/inquiries");
}
