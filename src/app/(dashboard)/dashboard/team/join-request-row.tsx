"use client";

import { useActionState } from "react";
import { approveJoinRequest, denyJoinRequest, type JoinActionState } from "@/lib/actions/join";

const initialState: JoinActionState = { error: null };

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diffMs / 3600000);
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function JoinRequestRow({
  id,
  email,
  fullName,
  requestedAt,
}: {
  id: string;
  email: string;
  fullName: string | null;
  requestedAt: string;
}) {
  const [state, formAction, pending] = useActionState(
    approveJoinRequest.bind(null, id),
    initialState
  );

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-4 last:border-0 sm:flex-nowrap sm:gap-4">
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13.5px] font-semibold">{fullName ?? email}</div>
        <div className="truncate text-xs text-muted">
          {email} · requested {timeAgo(requestedAt)}
        </div>
        {state.error && <p className="mt-1 text-xs text-red-400">{state.error}</p>}
      </div>

      <form action={formAction} className="flex flex-shrink-0 items-center gap-2">
        <select
          name="role"
          defaultValue="employee"
          className="rounded-[9px] border border-line bg-surface-2 px-2 py-1 font-mono text-xs uppercase"
        >
          <option value="employee">Employee</option>
          <option value="broker">Broker</option>
          <option value="fleet_manager">Fleet Manager</option>
        </select>
        <button
          type="submit"
          disabled={pending}
          className="rounded-[9px] bg-amber px-3 py-1.5 text-xs font-medium text-on-amber transition hover:brightness-110 disabled:opacity-60"
        >
          Approve
        </button>
      </form>

      <form
        className="flex-shrink-0"
        action={denyJoinRequest.bind(null, id)}
        onSubmit={(e) => {
          if (!confirm(`Deny ${fullName ?? email}'s request to join?`)) {
            e.preventDefault();
          }
        }}
      >
        <button
          type="submit"
          className="rounded-[9px] border border-line px-2.5 py-1.5 text-xs text-red-400 transition hover:border-red-400"
        >
          Deny
        </button>
      </form>
    </div>
  );
}
