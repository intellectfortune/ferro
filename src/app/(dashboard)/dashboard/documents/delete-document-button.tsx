"use client";

import { deleteVehiclePhoto } from "@/lib/actions/photos";

export function DeleteDocumentButton({
  documentId,
  vehicleId,
}: {
  documentId: string;
  vehicleId: string;
}) {
  return (
    <form
      action={deleteVehiclePhoto.bind(null, documentId, vehicleId)}
      onSubmit={(e) => {
        if (!confirm("Delete this document? This cannot be undone.")) {
          e.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        className="rounded-[9px] border border-line px-2.5 py-1 text-xs text-red-400 transition hover:border-red-400"
      >
        Delete
      </button>
    </form>
  );
}
