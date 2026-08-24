"use client";

import { deleteBooking } from "@/lib/actions/bookings";

export function DeleteBookingButton({ bookingId }: { bookingId: string }) {
  return (
    <form
      action={deleteBooking.bind(null, bookingId)}
      onSubmit={(e) => {
        if (!confirm("Delete this booking? This cannot be undone.")) {
          e.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        className="rounded-[9px] border border-line px-3 py-2 text-sm text-red-400 transition hover:border-red-400"
      >
        Delete booking
      </button>
    </form>
  );
}
