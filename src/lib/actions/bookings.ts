"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile, isFleetManagerOrAbove } from "@/lib/actions/profile";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { BookingStatus } from "@/types/database";

export type BookingActionState = { error: string | null };

function bookingFieldsFromFormData(formData: FormData) {
  const totalPrice = formData.get("total_price");
  const startAt = String(formData.get("start_at") ?? "");
  const endAt = String(formData.get("end_at") ?? "");

  return {
    vehicle_id: String(formData.get("vehicle_id") ?? ""),
    customer_name: String(formData.get("customer_name") ?? "").trim(),
    customer_email: String(formData.get("customer_email") ?? "").trim() || null,
    customer_phone: String(formData.get("customer_phone") ?? "").trim() || null,
    start_at: startAt ? new Date(startAt).toISOString() : "",
    end_at: endAt ? new Date(endAt).toISOString() : "",
    status: String(formData.get("status") ?? "inquiry") as BookingStatus,
    total_price:
      totalPrice && String(totalPrice).trim() !== "" ? Number(totalPrice) : null,
    notes: String(formData.get("notes") ?? "").trim() || null,
  };
}

export async function createBooking(
  _prevState: BookingActionState,
  formData: FormData
): Promise<BookingActionState> {
  const profile = await getCurrentProfile();
  if (!profile) {
    return { error: "You must be signed in." };
  }

  const fields = bookingFieldsFromFormData(formData);
  if (!fields.vehicle_id || !fields.customer_name) {
    return { error: "Vehicle and customer name are required." };
  }
  if (!fields.start_at || !fields.end_at) {
    return { error: "Start and end dates are required." };
  }
  if (new Date(fields.end_at) <= new Date(fields.start_at)) {
    return { error: "End date must be after the start date." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bookings")
    .insert({
      ...fields,
      company_id: profile.company_id,
      created_by: profile.id,
    })
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/bookings");
  revalidatePath("/dashboard/calendar");
  redirect(`/dashboard/bookings/${data.id}`);
}

export async function updateBooking(
  bookingId: string,
  _prevState: BookingActionState,
  formData: FormData
): Promise<BookingActionState> {
  const profile = await getCurrentProfile();
  if (!profile) {
    return { error: "You must be signed in." };
  }

  const fields = bookingFieldsFromFormData(formData);
  if (!fields.vehicle_id || !fields.customer_name) {
    return { error: "Vehicle and customer name are required." };
  }
  if (!fields.start_at || !fields.end_at) {
    return { error: "Start and end dates are required." };
  }
  if (new Date(fields.end_at) <= new Date(fields.start_at)) {
    return { error: "End date must be after the start date." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("bookings")
    .update(fields)
    .eq("id", bookingId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/bookings");
  revalidatePath(`/dashboard/bookings/${bookingId}`);
  revalidatePath("/dashboard/calendar");
  return { error: null };
}

export async function deleteBooking(bookingId: string) {
  const profile = await getCurrentProfile();
  if (!profile) {
    throw new Error("You must be signed in.");
  }

  const supabase = await createClient();

  if (!isFleetManagerOrAbove(profile.role)) {
    // Broker can delete a booking it created itself; anyone else (or a
    // Broker deleting someone else's booking) is denied here with a clear
    // message rather than relying on RLS to silently delete 0 rows.
    const { data: booking } = await supabase
      .from("bookings")
      .select("created_by")
      .eq("id", bookingId)
      .single();

    const ownedByBroker =
      profile.role === "broker" && booking?.created_by === profile.id;
    if (!ownedByBroker) {
      throw new Error("You don't have permission to delete this booking.");
    }
  }

  const { error } = await supabase.from("bookings").delete().eq("id", bookingId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard/bookings");
  revalidatePath("/dashboard/calendar");
  redirect("/dashboard/bookings");
}
