const SIZES = {
  sm: { box: "h-4 w-4", icon: "h-2.5 w-2.5" },
  md: { box: "h-5 w-5", icon: "h-3 w-3" },
};

/**
 * Amber = healthy, matching the Running/Connected badge convention used
 * everywhere else in the app — issue = red, same as overdue/uncollectible
 * elsewhere.
 */
export function StatusIcon({
  healthy,
  size = "md",
}: {
  healthy: boolean;
  size?: "sm" | "md";
}) {
  const { box, icon } = SIZES[size];
  return (
    <span
      className={`flex flex-shrink-0 items-center justify-center rounded-full ${box} ${
        healthy ? "bg-amber-soft text-amber-text" : "bg-red-400/10 text-red-400"
      }`}
    >
      {healthy ? (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.2" className={icon}>
          <path d="M4 10l4 4 8-8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" className={icon}>
          <path d="M10 3l7.5 13H2.5L10 3z" strokeLinejoin="round" />
          <path d="M10 8v3.2M10 13.7h.01" strokeLinecap="round" />
        </svg>
      )}
    </span>
  );
}

export function FuelIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
      <path d="M4 17V5.5a1 1 0 011-1h4.5a1 1 0 011 1V17" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3.5 17h7.5M5.5 9h3.5" strokeLinecap="round" />
      <path d="M10.5 7.5h1.5l2.3 2.3v5.2a1.2 1.2 0 002.4 0v-4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14.5 8l1.8-1.8" strokeLinecap="round" />
    </svg>
  );
}
