"use client";

import { useActionState } from "react";
import { submitInquiry, type InquiryFormState } from "@/lib/actions/inquiries";

const initialState: InquiryFormState = { error: null };

const inputClass =
  "mt-1 w-full rounded-[9px] border border-line bg-surface-2 px-3 py-2 outline-none focus:border-amber-text";
const labelClass = "block text-sm text-paper/70";

export function ContactForm({
  companyId,
  vehicleId,
  vehicleLabel,
}: {
  companyId: string;
  vehicleId: string;
  vehicleLabel: string;
}) {
  const [state, formAction, pending] = useActionState(
    submitInquiry.bind(null, companyId, vehicleId),
    initialState
  );

  if (state.success) {
    return (
      <div className="rounded-[14px] border border-amber-text/40 bg-amber-soft px-5 py-4 text-sm font-medium text-amber-text">
        Thanks — your message has been sent. We&apos;ll be in touch soon.
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4 rounded-[14px] border border-line bg-surface p-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className={labelClass}>
            Name
          </label>
          <input id="name" name="name" required className={inputClass} />
        </div>
        <div>
          <label htmlFor="email" className={labelClass}>
            Email
          </label>
          <input id="email" name="email" type="email" required className={inputClass} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="phone" className={labelClass}>
            Phone <span className="text-muted">(optional)</span>
          </label>
          <input id="phone" name="phone" type="tel" className={inputClass} />
        </div>
      </div>
      <div>
        <label htmlFor="message" className={labelClass}>
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          required
          defaultValue={`Hi, I'm interested in the ${vehicleLabel}. `}
          className={inputClass}
        />
      </div>

      {state.error && <p className="text-sm text-red-400">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-[9px] bg-amber px-4 py-2 font-medium text-on-amber transition hover:brightness-110 disabled:opacity-60"
      >
        {pending ? "Sending..." : "Send message"}
      </button>
    </form>
  );
}
