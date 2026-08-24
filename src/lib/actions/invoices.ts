"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile, canManageVehicles } from "@/lib/actions/profile";
import { checkRateLimit } from "@/lib/rate-limit";
import { getStripe } from "@/lib/stripe";
import { revalidatePath } from "next/cache";
import type { InvoiceStatus } from "@/types/database";
import { getRevenueSeries, type RevenueRange } from "@/lib/queries/invoices";

export type InvoiceActionState = { error: string | null; success?: boolean };

export async function fetchRevenueSeries(range: RevenueRange) {
  const profile = await getCurrentProfile();
  if (!profile || !canManageVehicles(profile.role)) return [];
  return getRevenueSeries(range);
}

export async function createInvoiceForBooking(
  _prevState: InvoiceActionState,
  formData: FormData
): Promise<InvoiceActionState> {
  const profile = await getCurrentProfile();
  if (!profile || !canManageVehicles(profile.role)) {
    return { error: "You don't have permission to create invoices." };
  }

  const rl = await checkRateLimit("sensitive", profile.id);
  if (!rl.ok) return { error: rl.error };

  const bookingId = String(formData.get("booking_id") ?? "");
  if (!bookingId) {
    return { error: "Choose a booking." };
  }

  const amountInput = formData.get("amount");
  const supabase = await createClient();

  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .select("id, customer_name, customer_email, total_price")
    .eq("id", bookingId)
    .single();

  if (bookingError || !booking) {
    return { error: "Booking not found." };
  }
  if (!booking.customer_email) {
    return { error: "This booking has no customer email on file." };
  }

  const amount =
    amountInput && String(amountInput).trim() !== ""
      ? Number(amountInput)
      : booking.total_price;
  if (!amount || amount <= 0) {
    return { error: "Enter a valid invoice amount." };
  }

  let stripe;
  try {
    stripe = getStripe();
  } catch {
    return { error: "Stripe is not configured yet." };
  }

  try {
    const existingCustomers = await stripe.customers.list({
      email: booking.customer_email,
      limit: 1,
    });
    const customer =
      existingCustomers.data[0] ??
      (await stripe.customers.create({
        email: booking.customer_email,
        name: booking.customer_name,
      }));

    await stripe.invoiceItems.create({
      customer: customer.id,
      amount: Math.round(amount * 100),
      currency: "usd",
      description: `Rental — ${booking.customer_name}`,
    });

    const invoice = await stripe.invoices.create({
      customer: customer.id,
      collection_method: "send_invoice",
      days_until_due: 7,
      auto_advance: true,
      pending_invoice_items_behavior: "include",
    });

    const finalized = await stripe.invoices.finalizeInvoice(invoice.id!);

    const { error: insertError } = await supabase.from("invoices").insert({
      company_id: profile.company_id,
      booking_id: bookingId,
      stripe_invoice_id: finalized.id!,
      stripe_customer_id: customer.id,
      amount,
      status: (finalized.status ?? "draft") as InvoiceStatus,
      hosted_invoice_url: finalized.hosted_invoice_url,
      due_date: finalized.due_date
        ? new Date(finalized.due_date * 1000).toISOString()
        : null,
      created_by: profile.id,
    });

    if (insertError) {
      return { error: insertError.message };
    }
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Failed to create invoice.",
    };
  }

  revalidatePath("/dashboard/billing");
  return { error: null, success: true };
}
