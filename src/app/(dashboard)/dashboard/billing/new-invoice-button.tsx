"use client";

import { useActionState, useState } from "react";
import {
  createInvoiceForBooking,
  type InvoiceActionState,
} from "@/lib/actions/invoices";

const initialState: InvoiceActionState = { error: null };

const inputClass =
  "mt-1 w-full rounded-[9px] border border-line bg-surface-2 px-3 py-2 text-sm outline-none focus:border-amber-text";
const labelClass = "block text-xs text-muted";

type Bookable = {
  id: string;
  customer_name: string;
  customer_email: string | null;
  total_price: number | null;
};

export function NewInvoiceButton({ bookings }: { bookings: Bookable[] }) {
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(bookings[0]?.id ?? "");
  const [state, formAction, pending] = useActionState(
    createInvoiceForBooking,
    initialState
  );

  const selected = bookings.find((b) => b.id === selectedId);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={bookings.length === 0}
        className="rounded-[9px] bg-amber px-3 py-2 text-sm font-medium text-on-amber transition hover:brightness-110 disabled:opacity-50"
      >
        + New invoice
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
              <h2 className="text-base font-semibold">New invoice</h2>
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
                <p className="text-sm">Invoice created and sent.</p>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="mt-4 rounded-[9px] bg-amber px-4 py-2 text-sm font-medium text-on-amber transition hover:brightness-110"
                >
                  Done
                </button>
              </div>
            ) : (
              <form action={formAction} className="space-y-4 p-5">
                <div>
                  <label htmlFor="booking_id" className={labelClass}>
                    Booking
                  </label>
                  <select
                    id="booking_id"
                    name="booking_id"
                    required
                    value={selectedId}
                    onChange={(e) => setSelectedId(e.target.value)}
                    className={inputClass}
                  >
                    {bookings.map((booking) => (
                      <option key={booking.id} value={booking.id}>
                        {booking.customer_name}
                        {booking.total_price ? ` — $${booking.total_price}` : ""}
                      </option>
                    ))}
                  </select>
                  {selected && !selected.customer_email && (
                    <p className="mt-1 text-xs text-red-400">
                      This booking has no customer email — add one before invoicing.
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="amount" className={labelClass}>
                    Amount (USD)
                  </label>
                  <input
                    id="amount"
                    name="amount"
                    type="number"
                    min={0}
                    step="0.01"
                    defaultValue={selected?.total_price ?? undefined}
                    className={inputClass}
                  />
                </div>

                {state.error && <p className="text-sm text-red-400">{state.error}</p>}

                <button
                  type="submit"
                  disabled={pending}
                  className="rounded-[9px] bg-amber px-4 py-2 text-sm font-medium text-on-amber transition hover:brightness-110 disabled:opacity-60"
                >
                  {pending ? "Creating..." : "Create & send invoice"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
