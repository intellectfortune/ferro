import Link from "next/link";

const LEGAL_LINKS = [
  { href: "/terms", label: "Terms of Service" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/eula", label: "EULA" },
  { href: "/dmca", label: "DMCA Policy" },
];

export function LegalPage({
  title,
  effectiveDate,
  children,
}: {
  title: string;
  effectiveDate: string;
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto min-h-screen max-w-2xl px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-widest text-amber-text">
        Ferro Fleet LLC
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">{title}</h1>
      <p className="mt-2 font-mono text-xs text-muted">Effective {effectiveDate}</p>

      <div className="legal-content mt-10">{children}</div>

      <nav className="mt-14 flex flex-wrap gap-x-5 gap-y-2 border-t border-line pt-6 font-mono text-xs text-muted">
        {LEGAL_LINKS.map((l) => (
          <Link key={l.href} href={l.href} className="hover:text-amber-text">
            {l.label}
          </Link>
        ))}
      </nav>
      <Link
        href="/"
        className="mt-8 inline-block font-mono text-xs text-amber-text hover:underline"
      >
        ← Back
      </Link>
    </main>
  );
}
