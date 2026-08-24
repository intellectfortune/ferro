"use client";

import { deleteVehiclePhoto } from "@/lib/actions/photos";

export function DeletePhotoButton({
  photoId,
  vehicleId,
}: {
  photoId: string;
  vehicleId: string;
}) {
  return (
    <form action={deleteVehiclePhoto.bind(null, photoId, vehicleId)}>
      <button
        type="submit"
        aria-label="Delete photo"
        className="absolute right-1 top-1 rounded-full bg-ink/70 px-2 py-0.5 text-xs text-paper opacity-0 backdrop-blur transition group-hover:opacity-100 hover:text-red-400"
      >
        ✕
      </button>
    </form>
  );
}
