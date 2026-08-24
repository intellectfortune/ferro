"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { MOBILE_NAV_TOGGLE_EVENT } from "@/components/mobile-menu-button";

type NavItem = {
  label: string;
  href?: string;
  icon: ReactNode;
  badge?: string | number;
  /** Fully disabled — no destination page exists yet. */
  soon?: boolean;
  /** Decorative "Soon" tag on an item that still links somewhere real. */
  tag?: string;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const icon = {
  dashboard: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="2.5" y="2.5" width="6" height="6" rx="1.5" />
      <rect x="11.5" y="2.5" width="6" height="6" rx="1.5" />
      <rect x="2.5" y="11.5" width="6" height="6" rx="1.5" />
      <rect x="11.5" y="11.5" width="6" height="6" rx="1.5" />
    </svg>
  ),
  vehicles: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M3 12l1.5-5A2 2 0 016.4 5.5h7.2a2 2 0 011.9 1.5L17 12" />
      <rect x="2.5" y="12" width="15" height="4" rx="1.5" />
      <circle cx="6" cy="16.5" r="1.2" />
      <circle cx="14" cy="16.5" r="1.2" />
    </svg>
  ),
  bookings: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="2.5" y="3.5" width="15" height="14" rx="2" />
      <path d="M2.5 8h15M6.5 2v3M13.5 2v3" />
      <path d="M6.5 12l1.8 1.8L11 10.5" />
    </svg>
  ),
  inquiries: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M2.5 5.5a2 2 0 012-2h11a2 2 0 012 2v9a2 2 0 01-2 2h-11a2 2 0 01-2-2v-9zM2.5 6l7.5 5 7.5-5" />
    </svg>
  ),
  tracking: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M10 18s6-5.5 6-10a6 6 0 10-12 0c0 4.5 6 10 6 10z" />
      <circle cx="10" cy="8" r="2" />
    </svg>
  ),
  calendar: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="2.5" y="3.5" width="15" height="14" rx="2" />
      <path d="M2.5 8h15M6.5 2v3M13.5 2v3M6.5 12h2M6.5 15h5" />
    </svg>
  ),
  billing: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M3 6.5l7-4 7 4v7l-7 4-7-4v-7z" />
      <path d="M3 6.5l7 4 7-4M10 10.5V17.5" />
    </svg>
  ),
  ads: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M3 3v14M3 12l4-3 3 2 5-6" />
    </svg>
  ),
  chat: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M2.5 5.5a2 2 0 012-2h11a2 2 0 012 2v6a2 2 0 01-2 2H8l-4 3.5V13.5H4.5a2 2 0 01-2-2v-6z" />
    </svg>
  ),
  outreach: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M17.5 2.5l-15 6.2 5.7 2.3 2.3 5.7 7-14.2z" />
      <path d="M10.5 9.5l3-3" />
    </svg>
  ),
  documents: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3" y="4" width="12" height="12" rx="1.5" />
      <rect x="5.5" y="1.5" width="12" height="12" rx="1.5" />
    </svg>
  ),
  team: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="7" cy="6.5" r="2.5" />
      <path d="M2.5 16c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4" />
      <circle cx="14.5" cy="7" r="2" />
      <path d="M12.5 11c1.8.2 3 1.4 3.5 3" />
    </svg>
  ),
  contracts: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M5 2.5h7l3.5 3.5v11a1 1 0 01-1 1h-9.5a1 1 0 01-1-1v-13.5a1 1 0 011-1z" />
      <path d="M12 2.5v3.5h3.5" />
      <path d="M6.5 11l2 2 4-4.5" />
    </svg>
  ),
  settings: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="10" cy="10" r="2.3" />
      <path d="M10 3v2M10 15v2M3 10h2M15 10h2M5 5l1.4 1.4M13.6 13.6L15 15M15 5l-1.4 1.4M6.4 13.6L5 15" />
    </svg>
  ),
};

function buildGroups(vehicleCount: number, newInquiryCount: number): NavGroup[] {
  return [
    {
      label: "Operations",
      items: [
        { label: "Dashboard", href: "/dashboard", icon: icon.dashboard },
        {
          label: "Vehicles",
          href: "/dashboard/vehicles",
          icon: icon.vehicles,
          badge: vehicleCount > 0 ? vehicleCount : undefined,
        },
        {
          label: "Inquiries",
          href: "/dashboard/inquiries",
          icon: icon.inquiries,
          badge: newInquiryCount > 0 ? newInquiryCount : undefined,
        },
        {
          label: "Bookings",
          href: "/dashboard/bookings",
          icon: icon.bookings,
        },
        {
          label: "Calendar",
          href: "/dashboard/calendar",
          icon: icon.calendar,
        },
        {
          label: "Tracking",
          href: "/dashboard/tracking",
          icon: icon.tracking,
        },
      ],
    },
    {
      label: "Growth",
      items: [
        {
          label: "Billing",
          href: "/dashboard/billing",
          icon: icon.billing,
        },
        {
          label: "Ads",
          href: "/dashboard/ads",
          icon: icon.ads,
          tag: "Soon",
        },
        {
          label: "Outreach",
          href: "/dashboard/outreach",
          icon: icon.outreach,
          tag: "Soon",
        },
      ],
    },
    {
      label: "Records",
      items: [
        {
          label: "Documents",
          href: "/dashboard/documents",
          icon: icon.documents,
        },
        {
          label: "Contracts",
          href: "/dashboard/contracts",
          icon: icon.contracts,
        },
        { label: "Team", href: "/dashboard/team", icon: icon.team },
        { label: "Team Chat", href: "/dashboard/chat", icon: icon.chat },
      ],
    },
  ];
}

function Logo() {
  return (
    <div className="flex items-center gap-2.5 px-2 pb-7 pt-1">
      <div className="relative h-7 w-7 flex-shrink-0 rounded-[7px] bg-amber">
        <span className="absolute left-2 top-1.5 h-4 w-[3px] rounded-sm bg-on-amber" />
        <span className="absolute left-[13px] top-1.5 h-[3px] w-[9px] rounded-sm bg-on-amber shadow-[0_6px_0_var(--color-on-amber)]" />
      </div>
      <span className="font-mono text-[17px] font-bold tracking-tight">
        ferro<span className="text-amber-text">_</span>
      </span>
    </div>
  );
}

function NavGroups({
  groups,
  pathname,
  onNavigate,
}: {
  groups: NavGroup[];
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <>
      {groups.map((group) => (
        <div key={group.label} className="mb-6">
          <div className="px-3 pb-2 font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted">
            {group.label}
          </div>
          {group.items.map((item) => {
            const active =
              !!item.href &&
              (item.href === "/dashboard"
                ? pathname === item.href
                : pathname.startsWith(item.href));
            const content = (
              <>
                <span
                  className={`h-[17px] w-[17px] flex-shrink-0 ${
                    active ? "text-amber-text" : ""
                  }`}
                >
                  {item.icon}
                </span>
                {item.label}
                {item.badge !== undefined && (
                  <span className="ml-auto rounded-full bg-amber px-1.5 py-px font-mono text-[10px] font-bold text-on-amber">
                    {item.badge}
                  </span>
                )}
                {(item.soon || item.tag) && (
                  <span className="ml-auto rounded-full border border-line px-1.5 py-px font-mono text-[9px] uppercase tracking-wide text-muted">
                    {item.tag ?? "Soon"}
                  </span>
                )}
              </>
            );

            const className = `mb-0.5 flex items-center gap-3 rounded-[9px] px-3 py-2 text-sm font-medium transition-colors ${
              active
                ? "bg-surface-2 text-paper"
                : item.soon
                  ? "cursor-default text-muted/60"
                  : "text-muted hover:bg-surface-2 hover:text-paper"
            }`;

            if (!item.href || item.soon) {
              return (
                <div key={item.label} className={className} aria-disabled={item.soon}>
                  {content}
                </div>
              );
            }

            return (
              <Link key={item.label} href={item.href} className={className} onClick={onNavigate}>
                {content}
              </Link>
            );
          })}
        </div>
      ))}
    </>
  );
}

function SettingsLink({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <div className="mt-auto border-t border-line pt-4">
      <Link
        href="/dashboard/settings"
        onClick={onNavigate}
        className={`flex items-center gap-3 rounded-[9px] px-3 py-2 text-sm font-medium transition-colors ${
          pathname.startsWith("/dashboard/settings")
            ? "bg-surface-2 text-paper"
            : "text-muted hover:bg-surface-2 hover:text-paper"
        }`}
      >
        <span className="h-[17px] w-[17px] flex-shrink-0">{icon.settings}</span>
        Settings
      </Link>
    </div>
  );
}

export function SidebarNav({
  vehicleCount,
  newInquiryCount,
}: {
  vehicleCount: number;
  newInquiryCount: number;
}) {
  const pathname = usePathname();
  const groups = buildGroups(vehicleCount, newInquiryCount);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const toggle = () => setOpen((o) => !o);
    window.addEventListener(MOBILE_NAV_TOGGLE_EVENT, toggle);
    return () => window.removeEventListener(MOBILE_NAV_TOGGLE_EVENT, toggle);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-60 flex-col border-r border-line bg-surface p-4 md:flex">
        <Logo />
        <NavGroups groups={groups} pathname={pathname} />
        <SettingsLink pathname={pathname} />
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-ink/60 md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col overflow-y-auto border-r border-line bg-surface p-4 transition-transform duration-200 ease-out md:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-1 flex items-center justify-between">
          <Logo />
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="mb-6 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[9px] text-muted transition hover:text-paper"
          >
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
              <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <NavGroups groups={groups} pathname={pathname} onNavigate={() => setOpen(false)} />
        <SettingsLink pathname={pathname} onNavigate={() => setOpen(false)} />
      </aside>
    </>
  );
}
