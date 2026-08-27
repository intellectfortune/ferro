"use client";

import { useState, useTransition } from "react";
import { regenerateJoinCode } from "@/lib/actions/join";

export function JoinCodeCard({ initialCode }: { initialCode: string | null }) {
  const [code, setCode] = useState(initialCode);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleRegenerate() {
    setError(null);
    startTransition(async () => {
      const result = await regenerateJoinCode();
      if (result.error) {
        setError(result.error);
        return;
      }
      setCode(result.code ?? null);
    });
  }

  function handleCopy() {
    if (!code) return;
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div className="mb-6 rounded-[14px] border border-line bg-surface p-6">
      <h2 className="text-base font-bold">Join code</h2>
      <p className="mt-1 max-w-lg text-[13px] text-muted">
        Share this code so someone can request to join your team instead of
        sending them an email invite. They&apos;ll need approval from an
        owner, broker, or fleet manager before getting real access.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <span className="rounded-[9px] border border-line bg-surface-2 px-4 py-2 font-mono text-lg font-bold tracking-[0.15em] text-amber-text">
          {code ?? "—"}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          disabled={!code}
          className="rounded-[9px] border border-line px-3 py-2 text-sm text-paper/80 transition hover:border-amber-text hover:text-amber-text disabled:opacity-50"
        >
          {copied ? "Copied" : "Copy"}
        </button>
        <button
          type="button"
          onClick={handleRegenerate}
          disabled={pending}
          className="rounded-[9px] border border-line px-3 py-2 text-sm text-paper/80 transition hover:border-amber-text hover:text-amber-text disabled:opacity-60"
        >
          {pending ? "Regenerating..." : "Regenerate"}
        </button>
      </div>
      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
    </div>
  );
}
