"use client";

import { disconnectConnection } from "@/lib/actions/settings";
import type { ConnectionProvider } from "@/types/database";

export function DisconnectButton({
  provider,
  label,
}: {
  provider: ConnectionProvider;
  label: string;
}) {
  return (
    <form
      action={disconnectConnection.bind(null, provider)}
      onSubmit={(e) => {
        if (
          !confirm(`Disconnect ${label}? You'll need to reconnect it to restore this integration.`)
        ) {
          e.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        className="rounded-full border border-line px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide text-muted transition hover:border-red-400 hover:text-red-400"
      >
        Disconnect
      </button>
    </form>
  );
}
