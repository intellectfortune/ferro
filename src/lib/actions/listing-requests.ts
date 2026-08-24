"use server";

import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/actions/profile";
import { checkRateLimit } from "@/lib/rate-limit";

export type ListingRequestActionState = { error: string | null; success?: boolean };

export async function submitListingRequest(
  _prevState: ListingRequestActionState,
  formData: FormData
): Promise<ListingRequestActionState> {
  const profile = await getCurrentProfile();
  if (!profile) {
    return { error: "You must be signed in to submit a listing request." };
  }

  const rl = await checkRateLimit("sensitive", profile.id);
  if (!rl.ok) return { error: rl.error };

  const message = String(formData.get("message") ?? "").trim();
  if (!message) {
    return { error: "Describe the car before submitting." };
  }
  if (message.length > 4000) {
    return { error: "That's a lot of detail — keep it under 4000 characters." };
  }

  const supabase = await createClient();
  const { data: company } = await supabase
    .from("companies")
    .select("name")
    .eq("id", profile.company_id)
    .single();

  const { error } = await supabase.from("listing_requests").insert({
    company_id: profile.company_id,
    submitted_by: profile.id,
    message,
  });

  if (error) {
    return { error: error.message };
  }

  await notifyAdminOfListingRequest({
    companyName: company?.name ?? "Unknown company",
    submitterName: profile.full_name ?? profile.email,
    submitterEmail: profile.email,
    message,
  });

  return { error: null, success: true };
}

async function notifyAdminOfListingRequest(details: {
  companyName: string;
  submitterName: string;
  submitterEmail: string;
  message: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const adminEmail = process.env.FERRO_ADMIN_EMAIL;
  const fromEmail = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !adminEmail || !fromEmail) {
    console.warn(
      "Skipping listing request email: RESEND_API_KEY, FERRO_ADMIN_EMAIL, or RESEND_FROM_EMAIL is not set."
    );
    return;
  }

  const resend = new Resend(apiKey);

  await resend.emails.send({
    from: fromEmail,
    to: adminEmail,
    subject: `New listing request — ${details.companyName}`,
    text: `${details.companyName} (${details.submitterName} <${details.submitterEmail}>) wants a new listing built:\n\n${details.message}`,
  });
}
