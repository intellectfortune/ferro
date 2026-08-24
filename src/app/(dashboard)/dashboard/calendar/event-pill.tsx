"use client";

import Link from "next/link";
import { deleteCalendarEvent } from "@/lib/actions/calendar-events";
import type { CalendarItem } from "@/lib/queries/calendar";

const EVENT_TYPE_LABEL: Record<string, string> = {
  service: "Service",
  detailing: "Detailing",
  inspection: "Inspection",
  content_shoot: "Content Shoot",
  blocked: "Blocked",
};

export function EventPill({
  item,
  canDelete,
}: {
  item: CalendarItem;
  canDelete: boolean;
}) {
  const label =
    item.kind === "booking"
      ? item.title
      : `${EVENT_TYPE_LABEL[item.eventType ?? ""] ?? item.eventType}: ${item.title}`;

  const className =
    "block w-full truncate rounded px-1.5 py-0.5 text-left font-mono text-[10px] " +
    (item.kind === "booking"
      ? "bg-amber-soft text-amber-text"
      : "bg-surface-2 text-muted");

  if (item.kind === "booking") {
    return (
      <Link href={item.href} className={className} title={`${label} · ${item.vehicleLabel}`}>
        {label}
      </Link>
    );
  }

  if (!canDelete) {
    return (
      <span className={className} title={`${label} · ${item.vehicleLabel}`}>
        {label}
      </span>
    );
  }

  return (
    <form
      action={deleteCalendarEvent.bind(null, item.id)}
      onSubmit={(e) => {
        if (!confirm(`Remove "${item.title}"?`)) e.preventDefault();
      }}
    >
      <button type="submit" className={className} title={`${label} · ${item.vehicleLabel}`}>
        {label}
      </button>
    </form>
  );
}
