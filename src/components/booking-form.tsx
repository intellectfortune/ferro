"use client";

import { useActionState } from "react";
import type { BookingActionState } from "@/lib/actions/bookings";
import type { BookingStatus } from "@/types/database";
import { DateRangePicker } from "@/components/date-range-picker";

const initialState: BookingActionState = { error: null };

const inputClass =
  "mt-1 w-full rounded-[9px] border border-line bg-surface-2 px-3 py-2 outline-none focus:border-amber-text";
const labelClass = "block text-sm text-muted";

export type BookingFormValues = {
  vehicle_id?: string;
  customer_name?: string;
  customer_email?: string | null;
  customer_phone?: string | null;
  start_at?: string;
  end_at?: string;
  status?: BookingStatus;
  total_price?: number | null;
  notes?: string | null;
};

export function BookingForm({
  action,
  vehicles,
  initialValues,
  submitLabel,
}: {
  action: (
    state: BookingActionState,
    formData: FormData
  ) => Promise<BookingActionState>;
  vehicles: { id: string; make: string; model: string }[];
  initialValues?: BookingFormValues;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const v = initialValues ?? {};

  return (
    <form action={formAction} className="mt-8 max-w-2xl space-y-6">
      <div>
        <label htmlFor="vehicle_id" className={labelClass}>
          Vehicle
        </label>
        <select
          id="vehicle_id"
          name="vehicle_id"
          required
          defaultValue={v.vehicle_id ?? ""}
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

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="customer_name" className={labelClass}>
            Customer name
          </label>
          <input
            id="customer_name"
            name="customer_name"
            required
            defaultValue={v.customer_name}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="status" className={labelClass}>
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={v.status ?? "inquiry"}
            className={inputClass}
          >
            <option value="inquiry">Inquiry</option>
            <option value="confirmed">Confirmed</option>
            <option value="in_progress">In progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div>
          <label htmlFor="customer_email" className={labelClass}>
            Customer email
          </label>
          <input
            id="customer_email"
            name="customer_email"
            type="email"
            defaultValue={v.customer_email ?? undefined}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="customer_phone" className={labelClass}>
            Customer phone
          </label>
          <input
            id="customer_phone"
            name="customer_phone"
            defaultValue={v.customer_phone ?? undefined}
            className={inputClass}
          />
        </div>
        <div className="sm:col-span-2">
          <DateRangePicker
            startName="start_at"
            endName="end_at"
            defaultStart={v.start_at}
            defaultEnd={v.end_at}
            label="Rental dates"
          />
        </div>
        <div>
          <label htmlFor="total_price" className={labelClass}>
            Total price (USD)
          </label>
          <input
            id="total_price"
            name="total_price"
            type="number"
            min={0}
            step="0.01"
            defaultValue={v.total_price ?? undefined}
            className={inputClass}
          />
        </div>
      </section>

      <section>
        <label htmlFor="notes" className={labelClass}>
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={4}
          defaultValue={v.notes ?? undefined}
          className={inputClass}
        />
      </section>

      {state.error && <p className="text-sm text-red-400">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-[9px] bg-amber px-4 py-2 font-medium text-on-amber transition hover:brightness-110 disabled:opacity-60"
      >
        {pending ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
