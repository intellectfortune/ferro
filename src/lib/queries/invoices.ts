import { createClient } from "@/lib/supabase/server";

export async function listInvoices() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("invoices")
    .select(
      "id, amount, status, hosted_invoice_url, due_date, created_at, bookings(customer_name, vehicles(make, model))"
    )
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function sumRevenueThisMonth() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const supabase = await createClient();
  const { data } = await supabase
    .from("invoices")
    .select("amount")
    .eq("status", "paid")
    .gte("created_at", monthStart);

  return (data ?? []).reduce((sum, row) => sum + Number(row.amount), 0);
}

export async function sumRevenueLastMonth() {
  const now = new Date();
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const supabase = await createClient();
  const { data } = await supabase
    .from("invoices")
    .select("amount")
    .eq("status", "paid")
    .gte("created_at", lastMonthStart)
    .lt("created_at", thisMonthStart);

  return (data ?? []).reduce((sum, row) => sum + Number(row.amount), 0);
}

export async function countInvoicesByStatusThisMonth() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const supabase = await createClient();
  const { data } = await supabase
    .from("invoices")
    .select("status")
    .gte("created_at", monthStart);

  let paid = 0;
  let outstanding = 0;
  for (const row of data ?? []) {
    if (row.status === "paid") paid += 1;
    else if (row.status === "open" || row.status === "draft") outstanding += 1;
  }
  return { paid, outstanding };
}

export async function listInvoiceableBookings() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("bookings")
    .select("id, customer_name, customer_email, total_price, status")
    .in("status", ["confirmed", "in_progress", "completed"])
    .order("start_at", { ascending: false });

  return data ?? [];
}

export type RevenueRange = "30d" | "90d" | "monthly";

export async function getRevenueSeries(range: RevenueRange) {
  const supabase = await createClient();
  const now = new Date();

  if (range === "monthly") {
    const rangeStart = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    const { data } = await supabase
      .from("invoices")
      .select("amount, created_at")
      .eq("status", "paid")
      .gte("created_at", rangeStart.toISOString());

    const buckets = new Map<string, number>();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.set(`${d.getFullYear()}-${d.getMonth()}`, 0);
    }
    for (const row of data ?? []) {
      const d = new Date(row.created_at);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (buckets.has(key)) {
        buckets.set(key, (buckets.get(key) ?? 0) + Number(row.amount));
      }
    }
    return Array.from(buckets.entries()).map(([key, amount]) => {
      const [year, month] = key.split("-").map(Number);
      const d = new Date(year, month, 1);
      return {
        label: new Intl.DateTimeFormat("en-US", { month: "short" }).format(d),
        amount,
      };
    });
  }

  const days = range === "30d" ? 30 : 90;
  const rangeStart = new Date(now);
  rangeStart.setDate(rangeStart.getDate() - (days - 1));
  rangeStart.setHours(0, 0, 0, 0);

  const { data } = await supabase
    .from("invoices")
    .select("amount, created_at")
    .eq("status", "paid")
    .gte("created_at", rangeStart.toISOString());

  const buckets = new Map<string, number>();
  for (let i = 0; i < days; i++) {
    const d = new Date(rangeStart);
    d.setDate(d.getDate() + i);
    buckets.set(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`, 0);
  }
  for (const row of data ?? []) {
    const d = new Date(row.created_at);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    if (buckets.has(key)) {
      buckets.set(key, (buckets.get(key) ?? 0) + Number(row.amount));
    }
  }
  return Array.from(buckets.entries()).map(([key, amount]) => {
    const [year, month, day] = key.split("-").map(Number);
    const d = new Date(year, month, day);
    return {
      label: new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(d),
      amount,
    };
  });
}

export async function getOutstandingVsPaid() {
  const supabase = await createClient();
  const { data } = await supabase.from("invoices").select("amount, status");

  let paid = 0;
  let outstanding = 0;
  for (const row of data ?? []) {
    if (row.status === "paid") paid += Number(row.amount);
    else if (row.status === "open" || row.status === "draft") {
      outstanding += Number(row.amount);
    }
  }
  return { paid, outstanding };
}

export async function getUpcomingPayments(limit: number) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("invoices")
    .select(
      "id, amount, due_date, hosted_invoice_url, bookings(customer_name, vehicles(make, model))"
    )
    .eq("status", "open")
    .not("due_date", "is", null)
    .order("due_date", { ascending: true })
    .limit(limit);

  return data ?? [];
}

export async function getTopVehiclesByRevenue(limit: number) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("invoices")
    .select("amount, bookings(vehicles(id, make, model))")
    .eq("status", "paid");

  const totals = new Map<string, { label: string; amount: number }>();
  for (const row of data ?? []) {
    const booking = row.bookings as unknown as {
      vehicles: { id: string; make: string; model: string } | null;
    } | null;
    const vehicle = booking?.vehicles;
    if (!vehicle) continue;
    const existing = totals.get(vehicle.id);
    const label = `${vehicle.make} ${vehicle.model}`;
    totals.set(vehicle.id, {
      label,
      amount: (existing?.amount ?? 0) + Number(row.amount),
    });
  }

  return Array.from(totals.values())
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit);
}
