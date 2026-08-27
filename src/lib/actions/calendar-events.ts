"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile, isFleetManagerOrAbove } from "@/lib/actions/profile";
import { revalidatePath } from "next/cache";
import type { CalendarEventType } from "@/types/database";

export type CalendarEventActionState = { error: string | null; success?: boolean };

function eventFieldsFromFormData(formData: FormData) {
  const startAt = String(formData.get("start_at") ?? "");
  const endAt = String(formData.get("end_at") ?? "");

  return {
    vehicle_id: String(formData.get("vehicle_id") ?? ""),
    type: String(formData.get("type") ?? "service") as CalendarEventType,
    title: String(formData.get("title") ?? "").trim(),
    start_at: startAt ? new Date(startAt).toISOString() : "",
    end_at: endAt ? new Date(endAt).toISOString() : "",
    notes: String(formData.get("notes") ?? "").trim() || null,
  };
}

export async function createCalendarEvent(
  _prevState: CalendarEventActionState,
  formData: FormData
): Promise<CalendarEventActionState> {
  const profile = await getCurrentProfile();
  if (!profile) {
    return { error: "You must be signed in." };
  }

  const fields = eventFieldsFromFormData(formData);
  if (!fields.vehicle_id || !fields.title) {
    return { error: "Vehicle and title are required." };
  }
  if (!fields.start_at || !fields.end_at) {
    return { error: "Start and end times are required." };
  }
  if (new Date(fields.end_at) <= new Date(fields.start_at)) {
    return { error: "End time must be after the start time." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("calendar_events").insert({
    ...fields,
    company_id: profile.company_id,
    created_by: profile.id,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/calendar");
  return { error: null, success: true };
}

export async function deleteCalendarEvent(eventId: string) {
  const profile = await getCurrentProfile();
  if (!profile || !isFleetManagerOrAbove(profile.role)) {
    throw new Error("You don't have permission to delete calendar events.");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("calendar_events")
    .delete()
    .eq("id", eventId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard/calendar");
}
