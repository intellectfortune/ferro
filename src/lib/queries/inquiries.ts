import { createClient } from "@/lib/supabase/server";

export async function listInquiries() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("inquiries")
    .select(
      "id, source, status, customer_name, customer_email, customer_phone, message, occurred_at, metadata, vehicles(make, model)"
    )
    .order("occurred_at", { ascending: false });

  return data ?? [];
}

export async function countNewInquiries() {
  const supabase = await createClient();
  const { count } = await supabase
    .from("inquiries")
    .select("id", { count: "exact", head: true })
    .eq("status", "new");

  return count ?? 0;
}
