import Link from "next/link";

export function MarketingFooter() {
  return (
    <div className="mx-auto max-w-[1100px] px-6">
      <footer className="flex flex-col items-center justify-between gap-3 border-t border-line py-10 font-mono text-xs text-muted-dim sm:flex-row">
        <span>© {new Date().getFullYear()} Ferro Fleet LLC</span>
        <div className="flex gap-5">
          <Link href="/terms" className="transition hover:text-paper">
            Terms
          </Link>
          <Link href="/privacy" className="transition hover:text-paper">
            Privacy
          </Link>
        </div>
      </footer>
    </div>
  );
}
