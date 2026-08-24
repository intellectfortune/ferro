"use client";

import { useActionState, useEffect, useState } from "react";
import { joinWaitlist, type WaitlistActionState } from "@/lib/actions/waitlist";

const initialState: WaitlistActionState = { error: null };

export function WaitlistForm({
  initialCount,
}: {
  /** When provided, shows a live "N fleet owners" count below the form. */
  initialCount?: number;
}) {
  const [state, formAction, pending] = useActionState(joinWaitlist, initialState);
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    if (state.success) {
      setCount((c) => (c === undefined ? c : c + 1));
    }
  }, [state]);

  if (state.success) {
    return (
      <div className="mx-auto max-w-[420px] rounded-[10px] border border-amber-text/40 bg-amber-soft px-5 py-4 text-center text-sm font-medium text-amber-text">
        You&apos;re on the list — we&apos;ll be in touch.
      </div>
    );
  }

  return (
    <div>
      <form
        action={formAction}
        className="mx-auto flex max-w-[420px] gap-2.5"
      >
        <input
          type="email"
          name="email"
          required
          placeholder="you@yourfleet.com"
          className="flex-1 rounded-[10px] border border-line bg-surface px-4 py-3.5 text-sm text-paper outline-none placeholder:text-muted focus:border-amber-text"
        />
        <button
          type="submit"
          disabled={pending}
          className="whitespace-nowrap rounded-[10px] bg-amber px-5 py-3.5 text-sm font-bold text-on-amber transition hover:brightness-110 disabled:opacity-60"
        >
          {pending ? "Joining…" : "Join waitlist"}
        </button>
      </form>
      {state.error && (
        <p className="mt-3 text-center text-sm text-red-400">{state.error}</p>
      )}
      {count !== undefined && (
        <p className="mt-4 text-center font-mono text-xs text-muted-dim">
          {count.toLocaleString()} fleet owner{count === 1 ? "" : "s"} already on the list
        </p>
      )}
    </div>
  );
}
