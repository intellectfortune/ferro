"use client";

import { deleteVehicle } from "@/lib/actions/vehicles";

export function DeleteVehicleButton({ vehicleId }: { vehicleId: string }) {
  return (
    <form
      action={deleteVehicle.bind(null, vehicleId)}
      onSubmit={(e) => {
        if (!confirm("Delete this vehicle? This cannot be undone.")) {
          e.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        className="rounded-[9px] border border-line px-3 py-2 text-sm text-red-400 transition hover:border-red-400"
      >
        Delete vehicle
      </button>
    </form>
  );
}
