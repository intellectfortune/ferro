"use client";

import { useActionState, useState } from "react";
import { createBooking, type BookingActionState } from "@/lib/actions/bookings";
import { DateRangePicker } from "@/components/date-range-picker";

const initialState: BookingActionState = { error: null };

type Step = "vehicle" | "name" | "dates" | "email" | "phone" | "review";
const STEPS: Step[] = ["vehicle", "name", "dates", "email", "phone", "review"];

const inputClass =
  "w-full rounded-[9px] border border-line bg-surface-2 px-3 py-2 text-sm outline-none focus:border-amber-text";

function Bubble({ from, children }: { from: "assistant" | "user"; children: React.ReactNode }) {
  return (
    <div className={`flex ${from === "user" ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-[12px] px-3.5 py-2.5 text-[13.5px] ${
          from === "assistant" ? "bg-surface-2 text-paper" : "bg-amber font-medium text-on-amber"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

export function QuickBookingChat({
  vehicles,
}: {
  vehicles: { id: string; make: string; model: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [vehicleId, setVehicleId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [dates, setDates] = useState<{ start: string; end: string } | null>(null);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [state, formAction, pending] = useActionState(createBooking, initialState);

  const step = STEPS[stepIndex];
  const selectedVehicle = vehicles.find((v) => v.id === vehicleId);

  function reset() {
    setStepIndex(0);
    setVehicleId("");
    setCustomerName("");
    setDates(null);
    setEmail("");
    setPhone("");
  }

  function next() {
    setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
  }
  function back() {
    setStepIndex((i) => Math.max(i - 1, 0));
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          reset();
          setOpen(true);
        }}
        disabled={vehicles.length === 0}
        className="rounded-[9px] border border-line px-3 py-2 text-sm font-medium text-paper transition hover:border-amber-text hover:text-amber-text disabled:opacity-50"
      >
        Quick entry
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="flex w-full max-w-md flex-col overflow-hidden rounded-[14px] border border-line bg-surface"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="text-base font-semibold">New booking</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="text-muted hover:text-paper"
              >
                ✕
              </button>
            </div>

            <form action={formAction} className="flex flex-col">
              <input type="hidden" name="vehicle_id" value={vehicleId} />
              <input type="hidden" name="customer_name" value={customerName} />
              <input type="hidden" name="start_at" value={dates?.start ?? ""} />
              <input type="hidden" name="end_at" value={dates?.end ?? ""} />
              <input type="hidden" name="customer_email" value={email} />
              <input type="hidden" name="customer_phone" value={phone} />
              {/* Quick entry is for an actual renter, not a speculative lead. */}
              <input type="hidden" name="status" value="confirmed" />

              <div className="max-h-[50vh] space-y-3 overflow-y-auto px-5 py-4">
                {selectedVehicle && stepIndex > 0 && (
                  <>
                    <Bubble from="assistant">Which vehicle is this for?</Bubble>
                    <Bubble from="user">
                      {selectedVehicle.make} {selectedVehicle.model}
                    </Bubble>
                  </>
                )}
                {customerName && stepIndex > 1 && (
                  <>
                    <Bubble from="assistant">What&apos;s the renter&apos;s name?</Bubble>
                    <Bubble from="user">{customerName}</Bubble>
                  </>
                )}
                {dates && stepIndex > 2 && (
                  <>
                    <Bubble from="assistant">What dates?</Bubble>
                    <Bubble from="user">
                      {new Date(dates.start).toLocaleDateString()} →{" "}
                      {new Date(dates.end).toLocaleDateString()}
                    </Bubble>
                  </>
                )}
                {stepIndex > 3 && (
                  <>
                    <Bubble from="assistant">What&apos;s their email? (optional)</Bubble>
                    <Bubble from="user">{email || "Skipped"}</Bubble>
                  </>
                )}
                {stepIndex > 4 && (
                  <>
                    <Bubble from="assistant">And a phone number? (optional)</Bubble>
                    <Bubble from="user">{phone || "Skipped"}</Bubble>
                  </>
                )}

                {step === "vehicle" && <Bubble from="assistant">Which vehicle is this for?</Bubble>}
                {step === "name" && <Bubble from="assistant">What&apos;s the renter&apos;s name?</Bubble>}
                {step === "dates" && <Bubble from="assistant">What dates?</Bubble>}
                {step === "email" && <Bubble from="assistant">What&apos;s their email? (optional)</Bubble>}
                {step === "phone" && <Bubble from="assistant">And a phone number? (optional)</Bubble>}
                {step === "review" && (
                  <Bubble from="assistant">
                    Ready to create this booking — confirmed for{" "}
                    {selectedVehicle ? `${selectedVehicle.make} ${selectedVehicle.model}` : "—"},{" "}
                    {customerName}.
                  </Bubble>
                )}
              </div>

              <div className="space-y-3 border-t border-line px-5 py-4">
                {step === "vehicle" && (
                  <>
                    <select
                      autoFocus
                      value={vehicleId}
                      onChange={(e) => setVehicleId(e.target.value)}
                      className={inputClass}
                    >
                      <option value="" disabled>
                        Select a vehicle
                      </option>
                      {vehicles.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.make} {v.model}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={next}
                      disabled={!vehicleId}
                      className="w-full rounded-[9px] bg-amber px-4 py-2 text-sm font-medium text-on-amber transition hover:brightness-110 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </>
                )}

                {step === "name" && (
                  <>
                    <input
                      autoFocus
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && customerName.trim()) next();
                      }}
                      placeholder="Jordan Cole"
                      className={inputClass}
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={back}
                        className="rounded-[9px] border border-line px-4 py-2 text-sm text-paper/80 transition hover:border-amber-text"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={next}
                        disabled={!customerName.trim()}
                        className="flex-1 rounded-[9px] bg-amber px-4 py-2 text-sm font-medium text-on-amber transition hover:brightness-110 disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  </>
                )}

                {step === "dates" && (
                  <>
                    <DateRangePicker
                      startName="_start_display"
                      endName="_end_display"
                      onRangeChange={(start, end) => setDates(start && end ? { start, end } : null)}
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={back}
                        className="rounded-[9px] border border-line px-4 py-2 text-sm text-paper/80 transition hover:border-amber-text"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={next}
                        disabled={!dates}
                        className="flex-1 rounded-[9px] bg-amber px-4 py-2 text-sm font-medium text-on-amber transition hover:brightness-110 disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  </>
                )}

                {step === "email" && (
                  <>
                    <input
                      autoFocus
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") next();
                      }}
                      placeholder="renter@email.com"
                      className={inputClass}
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={back}
                        className="rounded-[9px] border border-line px-4 py-2 text-sm text-paper/80 transition hover:border-amber-text"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={next}
                        className="flex-1 rounded-[9px] bg-amber px-4 py-2 text-sm font-medium text-on-amber transition hover:brightness-110"
                      >
                        {email ? "Next" : "Skip"}
                      </button>
                    </div>
                  </>
                )}

                {step === "phone" && (
                  <>
                    <input
                      autoFocus
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") next();
                      }}
                      placeholder="(555) 123-4567"
                      className={inputClass}
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={back}
                        className="rounded-[9px] border border-line px-4 py-2 text-sm text-paper/80 transition hover:border-amber-text"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={next}
                        className="flex-1 rounded-[9px] bg-amber px-4 py-2 text-sm font-medium text-on-amber transition hover:brightness-110"
                      >
                        {phone ? "Next" : "Skip"}
                      </button>
                    </div>
                  </>
                )}

                {step === "review" && (
                  <>
                    {state.error && <p className="text-sm text-red-400">{state.error}</p>}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={back}
                        className="rounded-[9px] border border-line px-4 py-2 text-sm text-paper/80 transition hover:border-amber-text"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={pending}
                        className="flex-1 rounded-[9px] bg-amber px-4 py-2 text-sm font-medium text-on-amber transition hover:brightness-110 disabled:opacity-60"
                      >
                        {pending ? "Creating..." : "Create booking"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
