"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { uploadVehiclePhoto, type PhotoActionState } from "@/lib/actions/photos";

const initialState: PhotoActionState = { error: null };

export function PhotoUploader({ vehicleId }: { vehicleId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(
    uploadVehiclePhoto.bind(null, vehicleId),
    initialState
  );
  const [justUploaded, setJustUploaded] = useState(false);

  useEffect(() => {
    if (pending || !state.success) return;
    formRef.current?.reset();
    setJustUploaded(true);
    const timeout = setTimeout(() => setJustUploaded(false), 2500);
    return () => clearTimeout(timeout);
  }, [pending, state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-wrap items-center gap-3">
      <input
        type="file"
        name="file"
        accept="image/jpeg,image/png,image/webp,image/heic"
        disabled={pending}
        onChange={(event) => {
          if (event.target.files && event.target.files.length > 0) {
            formRef.current?.requestSubmit();
          }
        }}
        className="text-sm text-paper/70 file:mr-3 file:rounded-[9px] file:border file:border-line file:bg-surface file:px-3 file:py-1.5 file:text-sm file:text-paper file:transition hover:file:border-amber-text disabled:cursor-not-allowed disabled:opacity-60"
      />
      {pending && (
        <span className="flex items-center gap-1.5 text-sm text-muted">
          <svg
            className="h-3.5 w-3.5 animate-spin"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M10 2.5a7.5 7.5 0 105.6 12.5" strokeLinecap="round" />
          </svg>
          Uploading…
        </span>
      )}
      {!pending && justUploaded && (
        <span className="text-sm font-medium text-amber-text">Uploaded ✓</span>
      )}
      {state.error && <p className="w-full text-sm text-red-400">{state.error}</p>}
    </form>
  );
}
