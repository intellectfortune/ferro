import { createClient } from "@/lib/supabase/server";

export async function listBookings() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("bookings")
    .select("id, customer_name, status, start_at, end_at, total_price, vehicles(make, model)")
    .order("start_at", { ascending: false });

  return data ?? [];
}

export async function getBookingWithVehicle(bookingId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", bookingId)
    .single();

  return data;
}

export async function countUpcomingBookings() {
  const supabase = await createClient();
  const { count } = await supabase
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .gte("start_at", new Date().toISOString())
    .not("status", "eq", "cancelled");

  return count ?? 0;
}

export async function listRecentBookings(limit: number) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("bookings")
    .select("id, customer_name, status, start_at, end_at, created_at, vehicles(make, model)")
    .order("created_at", { ascending: false })
    .limit(limit);

  return data ?? [];
}

export async function countBookingsStartingThisWeek() {
  const now = new Date();
  const weekOut = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const supabase = await createClient();
  const { count } = await supabase
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .gte("start_at", now.toISOString())
    .lte("start_at", weekOut.toISOString())
    .not("status", "eq", "cancelled");

  return count ?? 0;
}

export async function listVehiclesForSelect() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("vehicles")
    .select("id, make, model")
    .order("make", { ascending: true });

  return data ?? [];
}
