"use client";

import { useEffect } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-6 text-center">
      <p className="font-mono text-xs uppercase tracking-widest text-amber-text">
        Something went wrong
      </p>
      <h1 className="mt-2 text-xl font-bold tracking-tight">
        This page hit an error
      </h1>
      <p className="mt-2 max-w-sm text-sm text-muted">
        Try again, or head back to the dashboard if it keeps happening.
      </p>
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-[9px] bg-amber px-4 py-2 text-sm font-medium text-on-amber transition hover:brightness-110"
        >
          Try again
        </button>
        <a
          href="/dashboard"
          className="rounded-[9px] border border-line px-4 py-2 text-sm font-medium text-paper transition hover:border-amber-text hover:text-amber-text"
        >
          Back to dashboard
        </a>
      </div>
    </div>
  );
}
