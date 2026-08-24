import { createClient } from "@/lib/supabase/server";

export async function countVehiclesAddedThisMonth() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const supabase = await createClient();
  const { count } = await supabase
    .from("vehicles")
    .select("id", { count: "exact", head: true })
    .gte("created_at", monthStart);

  return count ?? 0;
}

export async function listVehiclesWithCoverPhoto(limit?: number) {
  const supabase = await createClient();

  let query = supabase
    .from("vehicles")
    .select("id, make, model, color, status, daily_rate, created_at")
    .order("created_at", { ascending: false });

  if (limit) query = query.limit(limit);

  const { data: vehicles } = await query;
  if (!vehicles || vehicles.length === 0) return [];

  const { data: photos } = await supabase
    .from("vehicle_photos")
    .select("vehicle_id, storage_path, sort_order")
    .in(
      "vehicle_id",
      vehicles.map((v) => v.id)
    )
    .eq("category", "listing_photo")
    .order("sort_order", { ascending: true });

  const coverByVehicle = new Map<string, string>();
  for (const photo of photos ?? []) {
    if (!coverByVehicle.has(photo.vehicle_id)) {
      coverByVehicle.set(
        photo.vehicle_id,
        supabase.storage.from("vehicle-photos").getPublicUrl(photo.storage_path)
          .data.publicUrl
      );
    }
  }

  return vehicles.map((vehicle) => ({
    ...vehicle,
    photoUrl: coverByVehicle.get(vehicle.id) ?? null,
  }));
}
