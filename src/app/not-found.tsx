"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NotFound() {
  const pathname = usePathname();
  const inDashboard = pathname.startsWith("/dashboard");

  const primary = inDashboard
    ? { href: "/dashboard", label: "Back to dashboard" }
    : { href: "/", label: "Back to homepage" };
  const secondary = inDashboard
    ? { href: "/", label: "Ferro homepage" }
    : { href: "/dashboard", label: "Go to dashboard" };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-ink px-6 text-center text-paper">
      <div className="mb-6 flex items-center gap-2.5 font-mono text-[19px] font-bold tracking-tight">
        <span className="relative h-7 w-7 flex-shrink-0 rounded-[7px] bg-amber">
          <span className="absolute left-2 top-1.5 h-4 w-[3px] rounded-sm bg-ink" />
          <span className="absolute left-[13px] top-1.5 h-[3px] w-[9px] rounded-sm bg-ink shadow-[0_5px_0_var(--color-ink)]" />
        </span>
        ferro<span className="text-amber-text">_</span>
      </div>

      <div className="mb-3 font-mono text-sm uppercase tracking-[0.2em] text-amber-text">
        404
      </div>
      <h1 className="mb-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
        This page took a wrong turn.
      </h1>
      <p className="mb-9 max-w-md text-[15px] text-muted">
        Whatever you were looking for isn&apos;t here — it may have moved, or the
        link might be off.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href={primary.href}
          className="rounded-[10px] bg-amber px-6 py-3 text-sm font-bold text-on-amber transition hover:brightness-110"
        >
          {primary.label}
        </Link>
        <Link
          href={secondary.href}
          className="rounded-[10px] border border-line px-6 py-3 text-sm font-semibold text-paper transition hover:border-amber-text"
        >
          {secondary.label}
        </Link>
      </div>
    </main>
  );
}
