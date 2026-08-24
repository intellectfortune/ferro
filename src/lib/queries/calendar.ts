import { createClient } from "@/lib/supabase/server";

export type CalendarItem = {
  id: string;
  kind: "booking" | "event";
  eventType?: string;
  title: string;
  startAt: string;
  endAt: string;
  vehicleLabel: string;
  href: string;
};

export async function listCalendarItems(rangeStart: Date, rangeEnd: Date) {
  const supabase = await createClient();
  const startIso = rangeStart.toISOString();
  const endIso = rangeEnd.toISOString();

  const [{ data: bookings }, { data: events }] = await Promise.all([
    supabase
      .from("bookings")
      .select("id, customer_name, start_at, end_at, status, vehicles(make, model)")
      .lt("start_at", endIso)
      .gt("end_at", startIso),
    supabase
      .from("calendar_events")
      .select("id, title, type, start_at, end_at, vehicles(make, model)")
      .lt("start_at", endIso)
      .gt("end_at", startIso),
  ]);

  const items: CalendarItem[] = [];

  for (const booking of bookings ?? []) {
    const vehicle = booking.vehicles as unknown as {
      make: string;
      model: string;
    } | null;
    items.push({
      id: booking.id,
      kind: "booking",
      title: booking.customer_name,
      startAt: booking.start_at,
      endAt: booking.end_at,
      vehicleLabel: vehicle ? `${vehicle.make} ${vehicle.model}` : "",
      href: `/dashboard/bookings/${booking.id}`,
    });
  }

  for (const event of events ?? []) {
    const vehicle = event.vehicles as unknown as {
      make: string;
      model: string;
    } | null;
    items.push({
      id: event.id,
      kind: "event",
      eventType: event.type,
      title: event.title,
      startAt: event.start_at,
      endAt: event.end_at,
      vehicleLabel: vehicle ? `${vehicle.make} ${vehicle.model}` : "",
      href: "",
    });
  }

  return items.sort(
    (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
  );
}
