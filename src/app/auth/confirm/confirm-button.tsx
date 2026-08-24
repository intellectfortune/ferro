"use client";

import { useActionState } from "react";
import { type EmailOtpType } from "@supabase/supabase-js";
import { confirmEmail, type ConfirmActionState } from "@/lib/actions/confirm";

const initialState: ConfirmActionState = { error: null };

export function ConfirmButton({
  tokenHash,
  type,
  next,
}: {
  tokenHash: string;
  type: EmailOtpType;
  next: string;
}) {
  const [state, formAction, pending] = useActionState(
    confirmEmail.bind(null, tokenHash, type, next),
    initialState
  );

  return (
    <form action={formAction} className="mt-6">
      {state.error && (
        <p className="mb-3 text-sm text-red-400">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-amber px-3 py-2 font-medium text-on-amber transition hover:brightness-110 disabled:opacity-60"
      >
        {pending ? "Confirming..." : "Confirm email"}
      </button>
    </form>
  );
}
