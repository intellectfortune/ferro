"use client";

import { useActionState, useState } from "react";
import { createInvoiceForBooking, type InvoiceActionState } from "@/lib/actions/invoices";

const initialState: InvoiceActionState = { error: null };

export function QuickInvoicePrompt({
  bookingId,
  totalPrice,
}: {
  bookingId: string;
  totalPrice: number | null;
}) {
  const [dismissed, setDismissed] = useState(false);
  const [state, formAction, pending] = useActionState(createInvoiceForBooking, initialState);

  if (dismissed) return null;

  if (state.success) {
    return (
      <div className="mb-6 rounded-[9px] border border-amber-text/30 bg-amber-soft px-4 py-3 text-sm text-amber-text">
        Invoice created and sent.
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="mb-6 flex flex-wrap items-center gap-3 rounded-[9px] border border-amber-text/30 bg-amber-soft px-4 py-3"
    >
      <input type="hidden" name="booking_id" value={bookingId} />
      <span className="text-sm font-medium text-amber-text">Booking created — send an invoice now?</span>
      <input
        name="amount"
        type="number"
        min={0}
        step="0.01"
        defaultValue={totalPrice ?? undefined}
        placeholder="Amount (USD)"
        className="w-32 rounded-[9px] border border-line bg-surface px-2.5 py-1.5 text-sm outline-none focus:border-amber-text"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-[9px] bg-amber px-3 py-1.5 text-xs font-medium text-on-amber transition hover:brightness-110 disabled:opacity-60"
      >
        {pending ? "Sending..." : "Send invoice"}
      </button>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="text-xs text-amber-text/70 hover:text-amber-text"
      >
        Not now
      </button>
      {state.error && <p className="w-full text-xs text-red-400">{state.error}</p>}
    </form>
  );
}
