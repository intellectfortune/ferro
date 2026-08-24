"use client";

import { useActionState } from "react";
import type { VehicleActionState } from "@/lib/actions/vehicles";
import type { VehicleStatus } from "@/types/database";

const initialState: VehicleActionState = { error: null };

const inputClass =
  "mt-1 w-full rounded-[9px] border border-line bg-surface-2 px-3 py-2 outline-none focus:border-amber-text";
const labelClass = "block text-sm text-paper/70";

export type VehicleFormValues = {
  make?: string;
  model?: string;
  year?: number | null;
  color?: string | null;
  vin?: string | null;
  license_plate?: string | null;
  daily_rate?: number | null;
  description?: string | null;
  status?: VehicleStatus;
  bouncie_imei?: string | null;
  specs?: Record<string, unknown>;
};

export function VehicleForm({
  action,
  initialValues,
  submitLabel,
}: {
  action: (
    state: VehicleActionState,
    formData: FormData
  ) => Promise<VehicleActionState>;
  initialValues?: VehicleFormValues;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const v = initialValues ?? {};

  return (
    <form action={formAction} className="mt-8 max-w-2xl space-y-8">
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="make" className={labelClass}>
            Make
          </label>
          <input
            id="make"
            name="make"
            required
            defaultValue={v.make}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="model" className={labelClass}>
            Model
          </label>
          <input
            id="model"
            name="model"
            required
            defaultValue={v.model}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="year" className={labelClass}>
            Year
          </label>
          <input
            id="year"
            name="year"
            type="number"
            min={1900}
            max={2100}
            defaultValue={v.year ?? undefined}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="color" className={labelClass}>
            Color
          </label>
          <input
            id="color"
            name="color"
            defaultValue={v.color ?? undefined}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="vin" className={labelClass}>
            VIN
          </label>
          <input
            id="vin"
            name="vin"
            defaultValue={v.vin ?? undefined}
            className={`${inputClass} font-mono text-sm`}
          />
        </div>
        <div>
          <label htmlFor="license_plate" className={labelClass}>
            License plate
          </label>
          <input
            id="license_plate"
            name="license_plate"
            defaultValue={v.license_plate ?? undefined}
            className={`${inputClass} font-mono text-sm`}
          />
        </div>
        <div>
          <label htmlFor="daily_rate" className={labelClass}>
            Daily rate (USD)
          </label>
          <input
            id="daily_rate"
            name="daily_rate"
            type="number"
            min={0}
            step="0.01"
            defaultValue={v.daily_rate ?? undefined}
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
            defaultValue={v.status ?? "draft"}
            className={inputClass}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </section>

      <section>
        <h3 className="font-mono text-xs uppercase tracking-widest text-paper/60">
          GPS tracking
        </h3>
        <div className="mt-3">
          <label htmlFor="bouncie_imei" className={labelClass}>
            Bouncie device IMEI
          </label>
          <input
            id="bouncie_imei"
            name="bouncie_imei"
            defaultValue={v.bouncie_imei ?? undefined}
            placeholder="e.g. 356938035643809"
            className={`${inputClass} font-mono text-sm`}
          />
          <p className="mt-1 text-xs text-muted">
            Links this vehicle to its Bouncie tracker. Leave blank if not installed yet.
          </p>
        </div>
      </section>

      <section>
        <label htmlFor="description" className={labelClass}>
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={v.description ?? undefined}
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
