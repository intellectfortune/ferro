import { createClient } from "@/lib/supabase/server";

export async function listVehiclesForTracking() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("vehicles")
    .select("id, make, model, color, bouncie_imei")
    .order("make", { ascending: true });

  return data ?? [];
}
