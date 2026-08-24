"use client";

import { useActionState, useRef, useState } from "react";
import {
  uploadVehicleDocument,
  type DocumentActionState,
} from "@/lib/actions/documents";

const initialState: DocumentActionState = { error: null };

const inputClass =
  "mt-1 w-full rounded-[9px] border border-line bg-surface-2 px-3 py-2 text-sm outline-none focus:border-amber-text";
const labelClass = "block text-xs text-muted";

export function UploadDocumentButton({
  vehicles,
}: {
  vehicles: { id: string; make: string; model: string }[];
}) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(
    uploadVehicleDocument,
    initialState
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-[9px] bg-amber px-3 py-2 text-sm font-medium text-on-amber transition hover:brightness-110"
      >
        Upload document
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-[14px] border border-line bg-surface"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="text-base font-semibold">Upload document</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="text-muted hover:text-paper"
              >
                ✕
              </button>
            </div>

            {state.success ? (
              <div className="px-5 py-8 text-center">
                <p className="text-sm">Document uploaded.</p>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="mt-4 rounded-[9px] bg-amber px-4 py-2 text-sm font-medium text-on-amber transition hover:brightness-110"
                >
                  Done
                </button>
              </div>
            ) : (
              <form
                ref={formRef}
                action={formAction}
                className="space-y-4 p-5"
              >
                <div>
                  <label htmlFor="vehicle_id" className={labelClass}>
                    Vehicle
                  </label>
                  <select
                    id="vehicle_id"
                    name="vehicle_id"
                    required
                    defaultValue=""
                    className={inputClass}
                  >
                    <option value="" disabled>
                      Select a vehicle
                    </option>
                    {vehicles.map((vehicle) => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.make} {vehicle.model}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="category" className={labelClass}>
                    Document type
                  </label>
                  <select
                    id="category"
                    name="category"
                    defaultValue="id_doc"
                    className={inputClass}
                  >
                    <option value="id_doc">ID photo</option>
                    <option value="dec_page">Dec page</option>
                    <option value="other_doc">Other</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="file" className={labelClass}>
                    File
                  </label>
                  <input
                    id="file"
                    type="file"
                    name="file"
                    required
                    accept="image/jpeg,image/png,image/webp,image/heic,application/pdf"
                    className="mt-1 w-full text-sm text-paper/70 file:mr-3 file:rounded-[9px] file:border file:border-line file:bg-surface file:px-3 file:py-1.5 file:text-sm file:text-paper file:transition hover:file:border-amber-text"
                  />
                </div>

                {state.error && (
                  <p className="text-sm text-red-400">{state.error}</p>
                )}

                <button
                  type="submit"
                  disabled={pending}
                  className="rounded-[9px] bg-amber px-4 py-2 text-sm font-medium text-on-amber transition hover:brightness-110 disabled:opacity-60"
                >
                  {pending ? "Uploading..." : "Upload"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
