import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/actions/profile";
import { createVehicle } from "@/lib/actions/vehicles";
import { VehicleForm } from "@/components/vehicle-form";

export default async function NewVehiclePage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  return (
    <div>
      <h1 className="text-2xl font-semibold">Add vehicle</h1>
      <VehicleForm action={createVehicle} submitLabel="Add vehicle" />
    </div>
  );
}
