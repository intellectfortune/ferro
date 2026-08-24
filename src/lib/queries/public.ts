import { createClient } from "@/lib/supabase/server";

/** All public storefronts + their published vehicles, for the sitemap. */
export async function listAllStorefrontsForSitemap() {
  const supabase = await createClient();

  const { data: companies } = await supabase.from("companies").select("id, slug, updated_at");
  if (!companies || companies.length === 0) return [];

  const { data: vehicles } = await supabase
    .from("vehicles")
    .select("id, company_id, updated_at")
    .eq("status", "published");

  const vehiclesByCompany = new Map<string, { id: string; updated_at: string }[]>();
  for (const vehicle of vehicles ?? []) {
    const list = vehiclesByCompany.get(vehicle.company_id) ?? [];
    list.push({ id: vehicle.id, updated_at: vehicle.updated_at });
    vehiclesByCompany.set(vehicle.company_id, list);
  }

  return companies.map((company) => ({
    slug: company.slug,
    updatedAt: company.updated_at,
    vehicles: vehiclesByCompany.get(company.id) ?? [],
  }));
}

export async function getCompanyBySlug(slug: string) {
  const supabase = await createClient();
  const { data: company } = await supabase
    .from("companies")
    .select("id, name, slug, logo_url")
    .eq("slug", slug)
    .single();

  return company;
}

export async function listPublishedVehicles(companyId: string) {
  const supabase = await createClient();

  const { data: vehicles } = await supabase
    .from("vehicles")
    .select("id, make, model, year, color, daily_rate, specs, description")
    .eq("company_id", companyId)
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (!vehicles || vehicles.length === 0) return [];

  const { data: photos } = await supabase
    .from("vehicle_photos")
    .select("vehicle_id, storage_path, sort_order")
    .in(
      "vehicle_id",
      vehicles.map((v) => v.id)
    )
    .eq("category", "listing_photo")
    .eq("is_public", true)
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

export async function getPublishedVehicle(companyId: string, vehicleId: string) {
  const supabase = await createClient();

  const { data: vehicle } = await supabase
    .from("vehicles")
    .select("id, make, model, year, color, daily_rate, specs, description")
    .eq("id", vehicleId)
    .eq("company_id", companyId)
    .eq("status", "published")
    .single();

  if (!vehicle) return null;

  const { data: photos } = await supabase
    .from("vehicle_photos")
    .select("id, storage_path")
    .eq("vehicle_id", vehicleId)
    .eq("category", "listing_photo")
    .eq("is_public", true)
    .order("sort_order", { ascending: true });

  const photoUrls =
    photos?.map(
      (photo) =>
        supabase.storage.from("vehicle-photos").getPublicUrl(photo.storage_path)
          .data.publicUrl
    ) ?? [];

  return { ...vehicle, photoUrls };
}
