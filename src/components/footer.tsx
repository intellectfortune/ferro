import Link from "next/link";

export function Footer() {
  const roiCalculatorUrl = process.env.NEXT_PUBLIC_ROI_CALCULATOR_URL;

  return (
    <footer className="mt-auto flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t border-line px-6 py-6 font-mono text-xs text-muted">
      <span>© {new Date().getFullYear()} Ferro</span>
      <Link href="/terms" className="hover:text-amber-text">
        Terms of Service
      </Link>
      <Link href="/privacy" className="hover:text-amber-text">
        Privacy Policy
      </Link>
      {roiCalculatorUrl && (
        <a
          href={roiCalculatorUrl}
          target="_blank"
          rel="noreferrer"
          className="hover:text-amber-text"
        >
          ROI Calculator
        </a>
      )}
    </footer>
  );
}
