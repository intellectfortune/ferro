"use client";

import { useActionState } from "react";
import { updateMemberRole, removeMember, type TeamActionState } from "@/lib/actions/team";
import type { UserRole } from "@/types/database";

const initialState: TeamActionState = { error: null };

export function MemberRow({
  id,
  fullName,
  email,
  role,
  isSelf,
  canManage,
}: {
  id: string;
  fullName: string | null;
  email: string;
  role: UserRole;
  isSelf: boolean;
  canManage: boolean;
}) {
  const [state, formAction] = useActionState(
    updateMemberRole.bind(null, id),
    initialState
  );

  const initials = (fullName ?? email)
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-4 last:border-0 sm:flex-nowrap sm:gap-4">
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[9px] bg-amber font-mono text-xs font-bold text-on-amber">
        {initials}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13.5px] font-semibold">
          {fullName ?? email} {isSelf && <span className="text-muted">(you)</span>}
        </div>
        <div className="truncate text-xs text-muted">{email}</div>
        {state.error && <p className="text-xs text-red-400">{state.error}</p>}
      </div>

      {canManage && !isSelf ? (
        <form action={formAction} className="flex flex-shrink-0 items-center gap-2">
          <select
            name="role"
            defaultValue={role}
            onChange={(e) => e.target.form?.requestSubmit()}
            className="rounded-[9px] border border-line bg-surface-2 px-2 py-1 font-mono text-xs uppercase"
          >
            <option value="owner">Owner</option>
            <option value="fleet_manager">Fleet Manager</option>
            <option value="broker">Broker</option>
            <option value="employee">Employee</option>
          </select>
        </form>
      ) : (
        <span className="flex-shrink-0 rounded-full bg-amber-soft px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wide text-amber-text">
          {role.replace("_", " ")}
        </span>
      )}

      {canManage && !isSelf && (
        <form
          className="flex-shrink-0"
          action={removeMember.bind(null, id)}
          onSubmit={(e) => {
            if (!confirm(`Remove ${fullName ?? email} from the team?`)) {
              e.preventDefault();
            }
          }}
        >
          <button
            type="submit"
            className="rounded-[9px] border border-line px-2.5 py-1 text-xs text-red-400 transition hover:border-red-400"
          >
            Remove
          </button>
        </form>
      )}
    </div>
  );
}
