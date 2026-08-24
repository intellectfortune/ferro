"use client";

import { useState } from "react";
import { DayPicker, type DateRange } from "react-day-picker";

const dayClassNames = {
  root: "p-3",
  months: "flex",
  month: "space-y-3",
  month_caption: "flex items-center justify-center px-9 py-1",
  caption_label: "text-sm font-semibold",
  nav: "flex items-center justify-between",
  button_previous:
    "absolute left-1 top-1 flex h-7 w-7 items-center justify-center rounded-[9px] text-muted hover:bg-surface-2 hover:text-paper",
  button_next:
    "absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-[9px] text-muted hover:bg-surface-2 hover:text-paper",
  chevron: "h-4 w-4 fill-current",
  month_grid: "w-full border-collapse",
  weekdays: "flex",
  weekday:
    "w-9 font-mono text-[10px] uppercase tracking-wide text-muted font-normal",
  weeks: "",
  week: "flex w-full mt-1",
  day: "h-9 w-9 p-0 text-center text-sm relative",
  day_button:
    "h-9 w-9 rounded-[9px] font-normal transition hover:bg-surface-2 hover:text-paper",
  today: "font-bold text-amber-text",
  selected: "",
  range_start: "[&>button]:bg-amber [&>button]:text-on-amber [&>button]:hover:bg-amber",
  range_end: "[&>button]:bg-amber [&>button]:text-on-amber [&>button]:hover:bg-amber",
  range_middle: "[&>button]:bg-amber-soft [&>button]:text-amber-text [&>button]:rounded-none",
  outside: "text-muted/40",
  disabled: "text-muted/30",
  hidden: "invisible",
};

function toLocalInputValue(iso?: string | null) {
  if (!iso) return undefined;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return undefined;
  return d;
}

function formatDateTime(date?: Date, time?: string) {
  if (!date) return null;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}T${time ?? "10:00"}`;
}

function formatSummary(date?: Date, time?: string) {
  if (!date) return null;
  const dateLabel = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
  return `${dateLabel}, ${time ?? "10:00"}`;
}

export function DateRangePicker({
  startName,
  endName,
  defaultStart,
  defaultEnd,
  label = "Dates",
}: {
  startName: string;
  endName: string;
  defaultStart?: string | null;
  defaultEnd?: string | null;
  label?: string;
}) {
  const initialStart = toLocalInputValue(defaultStart);
  const initialEnd = toLocalInputValue(defaultEnd);

  const [open, setOpen] = useState(false);
  const [range, setRange] = useState<DateRange | undefined>(
    initialStart ? { from: initialStart, to: initialEnd ?? initialStart } : undefined
  );
  const [startTime, setStartTime] = useState(
    initialStart
      ? `${String(initialStart.getHours()).padStart(2, "0")}:${String(
          initialStart.getMinutes()
        ).padStart(2, "0")}`
      : "10:00"
  );
  const [endTime, setEndTime] = useState(
    initialEnd
      ? `${String(initialEnd.getHours()).padStart(2, "0")}:${String(
          initialEnd.getMinutes()
        ).padStart(2, "0")}`
      : "11:00"
  );

  const startValue = formatDateTime(range?.from, startTime);
  const endValue = formatDateTime(range?.to ?? range?.from, endTime);

  const summary =
    range?.from && (range.to ?? range.from)
      ? `${formatSummary(range.from, startTime)} → ${formatSummary(
          range.to ?? range.from,
          endTime
        )}`
      : "Select dates";

  return (
    <div>
      <label className="block text-sm text-muted">{label}</label>
      <input type="hidden" name={startName} value={startValue ?? ""} required />
      <input type="hidden" name={endName} value={endValue ?? ""} required />

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-1 flex w-full items-center gap-2 rounded-[9px] border border-line bg-surface-2 px-3 py-2 text-left text-sm outline-none focus:border-amber-text"
      >
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          className="h-4 w-4 flex-shrink-0 text-muted"
        >
          <rect x="2.5" y="3.5" width="15" height="14" rx="2" />
          <path d="M2.5 8h15M6.5 2v3M13.5 2v3" />
        </svg>
        <span className={range?.from ? "" : "text-muted"}>{summary}</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-sm overflow-hidden rounded-[14px] border border-line bg-surface"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <h3 className="text-sm font-semibold">{label}</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="text-muted hover:text-paper"
              >
                ✕
              </button>
            </div>

            <div className="relative">
              <DayPicker
                mode="range"
                selected={range}
                onSelect={setRange}
                showOutsideDays={false}
                classNames={dayClassNames}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 border-t border-line px-4 py-3">
              <div>
                <label className="block text-xs text-muted">Start time</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="mt-1 w-full rounded-[9px] border border-line bg-surface-2 px-2 py-1.5 text-sm outline-none focus:border-amber-text"
                />
              </div>
              <div>
                <label className="block text-xs text-muted">End time</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="mt-1 w-full rounded-[9px] border border-line bg-surface-2 px-2 py-1.5 text-sm outline-none focus:border-amber-text"
                />
              </div>
            </div>

            <div className="border-t border-line px-4 py-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={!range?.from}
                className="w-full rounded-[9px] bg-amber px-3 py-2 text-sm font-medium text-on-amber transition hover:brightness-110 disabled:opacity-60"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
