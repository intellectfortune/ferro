import Link from "next/link";
import { getCurrentProfile, canManageVehicles } from "@/lib/actions/profile";
import { listVehiclesWithCoverPhoto } from "@/lib/queries/vehicles";
import { redirect } from "next/navigation";
import { VehicleCard } from "@/components/vehicle-card";
import { AddToSiteChat } from "./add-to-site-chat";

export default async function VehiclesPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const vehicles = await listVehiclesWithCoverPhoto();
  const canManage = canManageVehicles(profile.role);

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Vehicles</h1>
        <div className="flex items-center gap-3">
          <AddToSiteChat />
          {canManage && (
            <Link
              href="/dashboard/vehicles/new"
              className="rounded-[9px] bg-amber px-3 py-2 text-sm font-medium text-on-amber transition hover:brightness-110"
            >
              Add vehicle
            </Link>
          )}
        </div>
      </div>

      {vehicles.length === 0 ? (
        <div className="rounded-[14px] border border-dashed border-line bg-surface px-6 py-10 text-center text-sm text-muted">
          No vehicles yet.
          {canManage && " Add your first one to get started."}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {vehicles.map((vehicle) => (
            <VehicleCard key={vehicle.id} {...vehicle} />
          ))}
        </div>
      )}
    </div>
  );
}
