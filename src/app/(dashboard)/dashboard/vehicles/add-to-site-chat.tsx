"use client";

import { useActionState, useState } from "react";
import {
  submitListingRequest,
  type ListingRequestActionState,
} from "@/lib/actions/listing-requests";

const initialState: ListingRequestActionState = { error: null };

export function AddToSiteChat() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    submitListingRequest,
    initialState
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-[9px] border border-line bg-surface px-3 py-2 text-sm font-medium text-paper transition hover:border-amber-text hover:text-amber-text"
      >
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          className="h-4 w-4"
        >
          <path d="M2.5 4.5h15v9h-9l-3.5 3v-3h-2.5z" />
        </svg>
        Add to site
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="flex w-full max-w-lg flex-col overflow-hidden rounded-[14px] border border-line bg-surface"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <div>
                <h2 className="text-base font-semibold">Add a car to the site</h2>
                <p className="mt-0.5 text-[12.5px] text-muted">
                  Describe it in plain language — we&apos;ll build the listing.
                </p>
              </div>
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
                <p className="text-sm">
                  Got it — we&apos;ll have this live on your site soon.
                </p>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="mt-4 rounded-[9px] bg-amber px-4 py-2 text-sm font-medium text-on-amber transition hover:brightness-110"
                >
                  Done
                </button>
              </div>
            ) : (
              <form action={formAction} className="flex flex-col gap-3 p-5">
                <textarea
                  name="message"
                  required
                  rows={6}
                  placeholder={
                    "e.g. 2023 Lamborghini Huracán EVO, Verde Mantis over black, VIN ending 4821, straight pipe exhaust, forged wheels, ~600 miles. Include make, model, year, VIN, color, and any mods."
                  }
                  className="w-full rounded-[9px] border border-line bg-surface-2 px-3 py-2.5 text-sm outline-none focus:border-amber-text"
                />
                {state.error && (
                  <p className="text-sm text-red-400">{state.error}</p>
                )}
                <button
                  type="submit"
                  disabled={pending}
                  className="self-end rounded-[9px] bg-amber px-4 py-2 text-sm font-medium text-on-amber transition hover:brightness-110 disabled:opacity-60"
                >
                  {pending ? "Sending..." : "Send"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
