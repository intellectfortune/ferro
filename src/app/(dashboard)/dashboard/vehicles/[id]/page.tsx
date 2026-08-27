import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile, isBrokerOrAbove, isFleetManagerOrAbove } from "@/lib/actions/profile";
import { updateVehicle } from "@/lib/actions/vehicles";
import { VehicleForm } from "@/components/vehicle-form";
import { DeleteVehicleButton } from "./delete-button";
import { PhotoUploader } from "./photo-uploader";
import { DeletePhotoButton } from "./delete-photo-button";
import { TrackingSection } from "./tracking-section";

export default async function VehicleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const supabase = await createClient();
  const { data: vehicle } = await supabase
    .from("vehicles")
    .select("*")
    .eq("id", id)
    .single();

  if (!vehicle) notFound();

  const { data: photos } = await supabase
    .from("vehicle_photos")
    .select("id, storage_path")
    .eq("vehicle_id", id)
    .eq("category", "listing_photo")
    .order("sort_order", { ascending: true });

  const photoUrls =
    photos?.map((photo) => ({
      id: photo.id,
      url: supabase.storage.from("vehicle-photos").getPublicUrl(photo.storage_path)
        .data.publicUrl,
    })) ?? [];

  // Broker+ can edit vehicle details and manage photos; deleting the
  // vehicle itself is Fleet Manager+ only.
  const canManage = isBrokerOrAbove(profile.role);
  const canDelete = isFleetManagerOrAbove(profile.role);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          {vehicle.year ? `${vehicle.year} ` : ""}
          {vehicle.make} {vehicle.model}
        </h1>
        {canDelete && <DeleteVehicleButton vehicleId={vehicle.id} />}
      </div>

      <section className="mt-8 max-w-2xl">
        <h2 className="font-mono text-xs uppercase tracking-widest text-muted">
          Photos
        </h2>
        {photoUrls.length > 0 && (
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {photoUrls.map((photo) => (
              <div
                key={photo.id}
                className="group relative aspect-video overflow-hidden rounded-[14px] border border-line"
              >
                <Image
                  src={photo.url}
                  alt=""
                  fill
                  sizes="(min-width: 640px) 33vw, 50vw"
                  className="object-cover"
                />
                {canManage && (
                  <DeletePhotoButton photoId={photo.id} vehicleId={vehicle.id} />
                )}
              </div>
            ))}
          </div>
        )}
        {canManage && (
          <div className="mt-4">
            <PhotoUploader vehicleId={vehicle.id} />
          </div>
        )}
      </section>

      <TrackingSection companyId={profile.company_id} bouncieImei={vehicle.bouncie_imei} />

      {canManage ? (
        <VehicleForm
          action={updateVehicle.bind(null, vehicle.id)}
          initialValues={vehicle}
          submitLabel="Save changes"
        />
      ) : (
        <dl className="mt-8 grid max-w-2xl grid-cols-2 gap-4 rounded-[14px] border border-line bg-surface p-5 text-sm">
          <div>
            <dt className="text-muted">Color</dt>
            <dd>{vehicle.color ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-muted">Status</dt>
            <dd className="uppercase">{vehicle.status}</dd>
          </div>
          <div>
            <dt className="text-muted">Daily rate</dt>
            <dd>{vehicle.daily_rate ? `$${vehicle.daily_rate}/day` : "—"}</dd>
          </div>
          <div>
            <dt className="text-muted">VIN</dt>
            <dd className="font-mono">{vehicle.vin ?? "—"}</dd>
          </div>
        </dl>
      )}
    </div>
  );
}
