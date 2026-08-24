"use client";

export const MOBILE_NAV_TOGGLE_EVENT = "ferro-mobile-nav-toggle";

export function MobileMenuButton() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(MOBILE_NAV_TOGGLE_EVENT))}
      aria-label="Open menu"
      className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[9px] border border-line bg-surface text-paper/80 transition hover:border-amber-text hover:text-amber-text md:hidden"
    >
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-[18px] w-[18px]">
        <path d="M3 5.5h14M3 10h14M3 14.5h14" strokeLinecap="round" />
      </svg>
    </button>
  );
}
