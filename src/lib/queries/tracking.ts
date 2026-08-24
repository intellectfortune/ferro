import { createClient } from "@/lib/supabase/server";

export async function listVehiclesForTracking() {
  const supabase = await createClient();
  const { data: vehicles } = await supabase
    .from("vehicles")
    .select("id, make, model, color, bouncie_imei")
    .order("make", { ascending: true });

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
