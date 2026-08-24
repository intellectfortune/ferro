"use client";

import { useActionState, useState } from "react";
import {
  createCalendarEvent,
  type CalendarEventActionState,
} from "@/lib/actions/calendar-events";
import { DateRangePicker } from "@/components/date-range-picker";

const initialState: CalendarEventActionState = { error: null };

const inputClass =
  "mt-1 w-full rounded-[9px] border border-line bg-surface-2 px-3 py-2 text-sm outline-none focus:border-amber-text";
const labelClass = "block text-xs text-muted";

export function AddEventButton({
  vehicles,
}: {
  vehicles: { id: string; make: string; model: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    createCalendarEvent,
    initialState
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-[9px] bg-amber px-3 py-2 text-sm font-medium text-on-amber transition hover:brightness-110"
      >
        Add event
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
              <h2 className="text-base font-semibold">Add calendar event</h2>
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
                <p className="text-sm">Event added.</p>
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
                  <label htmlFor="type" className={labelClass}>
                    Type
                  </label>
                  <select
                    id="type"
                    name="type"
                    defaultValue="service"
                    className={inputClass}
                  >
                    <option value="service">Service</option>
                    <option value="detailing">Detailing</option>
                    <option value="inspection">Inspection</option>
                    <option value="content_shoot">Content Shoot</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="title" className={labelClass}>
                    Title
                  </label>
                  <input
                    id="title"
                    name="title"
                    required
                    placeholder="e.g. Oil change"
                    className={inputClass}
                  />
                </div>
                <DateRangePicker startName="start_at" endName="end_at" label="Dates" />
                <div>
                  <label htmlFor="notes" className={labelClass}>
                    Notes
                  </label>
                  <textarea id="notes" name="notes" rows={2} className={inputClass} />
                </div>

                {state.error && (
                  <p className="text-sm text-red-400">{state.error}</p>
                )}

                <button
                  type="submit"
                  disabled={pending}
                  className="rounded-[9px] bg-amber px-4 py-2 text-sm font-medium text-on-amber transition hover:brightness-110 disabled:opacity-60"
                >
                  {pending ? "Adding..." : "Add event"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
