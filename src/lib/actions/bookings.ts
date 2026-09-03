"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile, isFleetManagerOrAbove } from "@/lib/actions/profile";
import {
  createGoogleCalendarEvent,
  updateGoogleCalendarEvent,
  deleteGoogleCalendarEvent,
} from "@/lib/google-calendar";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { BookingStatus } from "@/types/database";

export type BookingActionState = { error: string | null };

type BookingFields = ReturnType<typeof bookingFieldsFromFormData>;

/**
 * Best-effort sync to the company's connected Google Calendar (a no-op if
 * nothing's connected — the underlying calls just return null/undefined).
 * Deliberately never throws: a calendar hiccup shouldn't fail the booking
 * itself, since the booking is the source of truth and Google Calendar is
 * just a mirror of it.
 */
async function syncBookingToGoogleCalendar(
  companyId: string,
  bookingId: string,
  fields: BookingFields,
  existingEventId: string | null
) {
  try {
    const supabase = await createClient();
    const { data: vehicle } = await supabase
      .from("vehicles")
      .select("make, model")
      .eq("id", fields.vehicle_id)
      .single();

    const details = {
      customerName: fields.customer_name,
      vehicleLabel: vehicle ? `${vehicle.make} ${vehicle.model}` : "Vehicle",
      startAt: fields.start_at,
      endAt: fields.end_at,
      notes: fields.notes,
    };

    if (existingEventId) {
      await updateGoogleCalendarEvent(companyId, existingEventId, details);
      return;
    }

    const newEventId = await createGoogleCalendarEvent(companyId, details);
    if (newEventId) {
      await supabase
        .from("bookings")
        .update({ google_calendar_event_id: newEventId })
        .eq("id", bookingId);
    }
  } catch (err) {
    console.error(`Failed to sync booking ${bookingId} to Google Calendar:`, err);
  }
}

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

  await syncBookingToGoogleCalendar(profile.company_id, data.id, fields, null);

  revalidatePath("/dashboard/bookings");
  revalidatePath("/dashboard/calendar");
  // ?new=1 lets the detail page offer a one-time "send an invoice now?"
  // prompt right after creation, regardless of which form created it.
  redirect(`/dashboard/bookings/${data.id}?new=1`);
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
  const { data, error } = await supabase
    .from("bookings")
    .update(fields)
    .eq("id", bookingId)
    .select("google_calendar_event_id")
    .single();

  if (error) {
    return { error: error.message };
  }

  await syncBookingToGoogleCalendar(
    profile.company_id,
    bookingId,
    fields,
    data.google_calendar_event_id
  );

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

  const { data: deleted, error } = await supabase
    .from("bookings")
    .delete()
    .eq("id", bookingId)
    .select("google_calendar_event_id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (deleted.google_calendar_event_id) {
    try {
      await deleteGoogleCalendarEvent(profile.company_id, deleted.google_calendar_event_id);
    } catch (err) {
      console.error(`Failed to delete Google Calendar event for booking ${bookingId}:`, err);
    }
  }

  revalidatePath("/dashboard/bookings");
  revalidatePath("/dashboard/calendar");
  redirect("/dashboard/bookings");
}
