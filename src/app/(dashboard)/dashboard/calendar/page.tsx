import Link from "next/link";
import { listCalendarItems, type CalendarItem } from "@/lib/queries/calendar";
import { listVehiclesForSelect } from "@/lib/queries/bookings";
import { getCurrentProfile, isFleetManagerOrAbove } from "@/lib/actions/profile";
import { AddEventButton } from "./add-event-button";
import { EventPill } from "./event-pill";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function dateKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function buildMonthGrid(year: number, month: number) {
  const firstOfMonth = new Date(year, month, 1);
  const startWeekday = firstOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalCells = Math.ceil((startWeekday + daysInMonth) / 7) * 7;

  const days: Date[] = [];
  for (let i = 0; i < totalCells; i++) {
    days.push(new Date(year, month, 1 - startWeekday + i));
  }
  return days;
}

function itemsByDay(items: CalendarItem[], days: Date[]) {
  const map = new Map<string, CalendarItem[]>();
  for (const day of days) {
    const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate());
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
    const matches = items.filter((item) => {
      const start = new Date(item.startAt);
      const end = new Date(item.endAt);
      return start < dayEnd && end > dayStart;
    });
    map.set(dateKey(day), matches);
  }
  return map;
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month: monthParam } = await searchParams;
  const profile = await getCurrentProfile();

  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth();
  if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
    const [y, m] = monthParam.split("-").map(Number);
    year = y;
    month = m - 1;
  }

  const days = buildMonthGrid(year, month);
  const rangeStart = days[0];
  const rangeEnd = new Date(days[days.length - 1].getTime() + 24 * 60 * 60 * 1000);

  const [items, vehicles] = await Promise.all([
    listCalendarItems(rangeStart, rangeEnd),
    listVehiclesForSelect(),
  ]);

  const grouped = itemsByDay(items, days);
  const canDelete = isFleetManagerOrAbove(profile?.role);

  const monthLabel = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month, 1));

  const prevMonth = new Date(year, month - 1, 1);
  const nextMonth = new Date(year, month + 1, 1);
  const prevHref = `/dashboard/calendar?month=${prevMonth.getFullYear()}-${String(
    prevMonth.getMonth() + 1
  ).padStart(2, "0")}`;
  const nextHref = `/dashboard/calendar?month=${nextMonth.getFullYear()}-${String(
    nextMonth.getMonth() + 1
  ).padStart(2, "0")}`;

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
        <AddEventButton vehicles={vehicles} />
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">{monthLabel}</h2>
        <div className="flex items-center gap-2">
          <Link
            href={prevHref}
            className="rounded-[9px] border border-line px-3 py-1.5 text-sm text-muted hover:border-amber-text hover:text-amber-text"
          >
            ← Prev
          </Link>
          <Link
            href="/dashboard/calendar"
            className="rounded-[9px] border border-line px-3 py-1.5 text-sm text-muted hover:border-amber-text hover:text-amber-text"
          >
            Today
          </Link>
          <Link
            href={nextHref}
            className="rounded-[9px] border border-line px-3 py-1.5 text-sm text-muted hover:border-amber-text hover:text-amber-text"
          >
            Next →
          </Link>
        </div>
      </div>

      <div className="overflow-hidden rounded-[14px] border border-line bg-line">
        <div className="grid grid-cols-7 gap-px bg-line">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="bg-surface px-1 py-2 text-center font-mono text-[10.5px] uppercase tracking-wide text-muted sm:px-2"
            >
              <span className="sm:hidden">{day.slice(0, 1)}</span>
              <span className="hidden sm:inline">{day}</span>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-px bg-line">
          {days.map((day) => {
            const inMonth = day.getMonth() === month;
            const dayItems = grouped.get(dateKey(day)) ?? [];
            const visible = dayItems.slice(0, 3);
            const overflow = dayItems.length - visible.length;
            const isToday = dateKey(day) === dateKey(now);

            return (
              <div
                key={dateKey(day)}
                className={`min-h-[64px] bg-surface p-1 sm:min-h-[92px] sm:p-1.5 ${inMonth ? "" : "opacity-40"}`}
              >
                <div
                  className={`mb-1 font-mono text-[11px] ${
                    isToday
                      ? "inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber text-on-amber"
                      : "text-muted"
                  }`}
                >
                  {day.getDate()}
                </div>
                <div className="space-y-0.5">
                  {visible.map((item) => (
                    <EventPill key={`${item.kind}-${item.id}`} item={item} canDelete={canDelete} />
                  ))}
                  {overflow > 0 && (
                    <div className="px-1.5 font-mono text-[10px] text-muted">
                      +{overflow} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
