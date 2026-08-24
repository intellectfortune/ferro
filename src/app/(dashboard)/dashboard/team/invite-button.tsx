"use client";

import { useActionState, useState } from "react";
import { inviteTeamMember, type TeamActionState } from "@/lib/actions/team";

const initialState: TeamActionState = { error: null };

const inputClass =
  "mt-1 w-full rounded-[9px] border border-line bg-surface-2 px-3 py-2 text-sm outline-none focus:border-amber-text";
const labelClass = "block text-xs text-muted";

export function InviteButton() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    inviteTeamMember,
    initialState
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-[9px] bg-amber px-3 py-2 text-sm font-medium text-on-amber transition hover:brightness-110"
      >
        Invite member
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-sm overflow-hidden rounded-[14px] border border-line bg-surface"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="text-base font-semibold">Invite team member</h2>
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
                <p className="text-sm">Invite sent.</p>
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
                  <label htmlFor="email" className={labelClass}>
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="role" className={labelClass}>
                    Role
                  </label>
                  <select
                    id="role"
                    name="role"
                    defaultValue="employee"
                    className={inputClass}
                  >
                    <option value="employee">Employee</option>
                    <option value="broker">Broker</option>
                    <option value="owner">Owner</option>
                  </select>
                </div>

                {state.error && (
                  <p className="text-sm text-red-400">{state.error}</p>
                )}

                <button
                  type="submit"
                  disabled={pending}
                  className="rounded-[9px] bg-amber px-4 py-2 text-sm font-medium text-on-amber transition hover:brightness-110 disabled:opacity-60"
                >
                  {pending ? "Sending..." : "Send invite"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
