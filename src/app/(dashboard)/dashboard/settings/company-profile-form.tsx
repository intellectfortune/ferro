"use client";

import { useActionState } from "react";
import {
  updateCompanyProfile,
  type CompanyActionState,
} from "@/lib/actions/company";

const initialState: CompanyActionState = { error: null };

const inputClass =
  "mt-1 w-full rounded-[9px] border border-line bg-surface-2 px-3 py-2 text-sm outline-none focus:border-amber-text";
const labelClass = "block text-xs text-muted";

export function CompanyProfileForm({
  name,
  slug,
}: {
  name: string;
  slug: string;
}) {
  const [state, formAction, pending] = useActionState(
    updateCompanyProfile,
    initialState
  );

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="name" className={labelClass}>
          Company name
        </label>
        <input
          id="name"
          name="name"
          required
          defaultValue={name}
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="slug" className={labelClass}>
          Public URL slug
        </label>
        <input
          id="slug"
          name="slug"
          required
          defaultValue={slug}
          className={`${inputClass} font-mono`}
        />
        <p className="mt-1 text-xs text-muted">
          Your storefront: ferro.app/{slug}
        </p>
      </div>

      {state.error && <p className="text-sm text-red-400">{state.error}</p>}
      {state.success && <p className="text-sm text-amber-text">Saved.</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-[9px] bg-amber px-4 py-2 text-sm font-medium text-on-amber transition hover:brightness-110 disabled:opacity-60"
      >
        {pending ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}
