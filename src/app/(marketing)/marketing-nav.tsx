import Link from "next/link";

export function MarketingNav() {
  return (
    <div className="mx-auto max-w-[1100px] px-6">
      <nav className="flex items-center justify-between py-5 sm:py-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-mono text-[19px] font-bold tracking-tight"
        >
          <span className="relative h-[26px] w-[26px] flex-shrink-0 rounded-[6px] bg-amber">
            <span className="absolute left-[7px] top-[6px] h-[14px] w-[3px] rounded-sm bg-ink" />
            <span className="absolute left-[12px] top-[6px] h-[3px] w-[9px] rounded-sm bg-ink shadow-[0_5px_0_var(--color-ink)]" />
          </span>
          ferro<span className="text-amber-text">_</span>
        </Link>
        <div className="flex items-center gap-3 sm:gap-8">
          <div className="hidden items-center gap-8 text-sm text-muted sm:flex">
            <Link href="/pricing" className="transition hover:text-paper">
              Pricing
            </Link>
            <Link href="/login" className="transition hover:text-paper">
              Log in
            </Link>
          </div>
          <Link
            href="/login"
            className="text-sm text-muted transition hover:text-paper sm:hidden"
          >
            Log in
          </Link>
          <Link
            href="/waitlist"
            className="whitespace-nowrap rounded-[9px] bg-amber px-4 py-2 text-[13px] font-bold text-on-amber transition hover:brightness-110 sm:px-5 sm:py-2.5 sm:text-[13.5px]"
          >
            Join waitlist
          </Link>
        </div>
      </nav>
    </div>
  );
}
