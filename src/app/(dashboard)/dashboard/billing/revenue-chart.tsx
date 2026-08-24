"use client";

import { useId, useState, useTransition } from "react";
import { fetchRevenueSeries } from "@/lib/actions/invoices";
import type { RevenueRange } from "@/lib/queries/invoices";

type Point = { label: string; amount: number };

const RANGE_LABEL: Record<RevenueRange, string> = {
  "30d": "30 Days",
  "90d": "90 Days",
  monthly: "Monthly",
};

function niceMax(value: number) {
  if (value <= 0) return 100;
  const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
  const normalized = value / magnitude;
  const step = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return step * magnitude;
}

function formatAxisValue(value: number) {
  if (value >= 1000) {
    const thousands = value / 1000;
    const rounded = Math.round(thousands * 10) / 10;
    return `$${rounded % 1 === 0 ? rounded : rounded.toFixed(1)}k`;
  }
  return `$${Math.round(value)}`;
}

export function RevenueChart({ initialData }: { initialData: Point[] }) {
  const [range, setRange] = useState<RevenueRange>("30d");
  const [data, setData] = useState<Point[]>(initialData);
  const [hovered, setHovered] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();
  const gradientId = useId();

  function handleRangeChange(next: RevenueRange) {
    setRange(next);
    if (next === "30d") {
      setData(initialData);
      return;
    }
    startTransition(async () => {
      const series = await fetchRevenueSeries(next);
      setData(series);
    });
  }

  const max = niceMax(Math.max(...data.map((d) => d.amount), 0));
  const width = 800;
  const height = 220;
  const padLeft = 48;
  const padBottom = 24;
  const chartW = width - padLeft - 8;
  const chartH = height - padBottom - 8;
  const barGap = 2;
  const barW = Math.max(2, chartW / data.length - barGap);
  const gridLines = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Revenue</h3>
        <div className="flex gap-1 rounded-[9px] border border-line p-0.5">
          {(Object.keys(RANGE_LABEL) as RevenueRange[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => handleRangeChange(r)}
              className={`rounded-[7px] px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-wide transition ${
                range === r
                  ? "bg-amber text-on-amber"
                  : "text-muted hover:text-paper"
              }`}
            >
              {RANGE_LABEL[r]}
            </button>
          ))}
        </div>
      </div>

      <div
        className="relative"
        style={{ opacity: pending ? 0.6 : 1, transition: "opacity 150ms" }}
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full"
          role="img"
          aria-label={
            range === "monthly"
              ? "Monthly revenue for the last 12 months"
              : `Revenue for the last ${RANGE_LABEL[range].toLowerCase()}`
          }
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-amber)" stopOpacity="1" />
              <stop offset="100%" stopColor="var(--color-amber)" stopOpacity="0.85" />
            </linearGradient>
          </defs>

          {gridLines.map((g) => {
            const y = 8 + chartH * (1 - g);
            return (
              <g key={g}>
                <line
                  x1={padLeft}
                  x2={width}
                  y1={y}
                  y2={y}
                  stroke="var(--color-line)"
                  strokeWidth="1"
                />
                <text
                  x={padLeft - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="fill-current text-muted"
                  fontSize="10"
                  fontFamily="var(--font-mono)"
                >
                  {formatAxisValue(max * g)}
                </text>
              </g>
            );
          })}

          {data.map((point, i) => {
            const barH = max > 0 ? (point.amount / max) * chartH : 0;
            const x = padLeft + i * (barW + barGap);
            const y = 8 + chartH - barH;
            const isHovered = hovered === i;
            const showLabel = data.length <= 14 && (i === 0 || i === data.length - 1 || i % Math.ceil(data.length / 6) === 0);

            return (
              <g key={i}>
                <rect
                  x={x}
                  y={y}
                  width={barW}
                  height={Math.max(barH, 1)}
                  rx={Math.min(4, barW / 2)}
                  fill={isHovered ? "var(--color-amber)" : `url(#${gradientId})`}
                  opacity={isHovered ? 1 : 0.9}
                  onPointerEnter={() => setHovered(i)}
                  onPointerLeave={() => setHovered((h) => (h === i ? null : h))}
                  style={{ cursor: "pointer" }}
                />
                <rect
                  x={x}
                  y={8}
                  width={barW}
                  height={chartH}
                  fill="transparent"
                  onPointerEnter={() => setHovered(i)}
                  onPointerLeave={() => setHovered((h) => (h === i ? null : h))}
                  style={{ cursor: "pointer" }}
                />
                {showLabel && (
                  <text
                    x={x + barW / 2}
                    y={height - 6}
                    textAnchor="middle"
                    className="fill-current text-muted"
                    fontSize="9.5"
                    fontFamily="var(--font-mono)"
                  >
                    {point.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {hovered !== null && data[hovered] && (
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-[9px] border border-line bg-surface px-2.5 py-1.5 text-xs shadow-lg"
            style={{
              left: `${((padLeft + hovered * (barW + barGap) + barW / 2) / width) * 100}%`,
              top: `${((8 + chartH - Math.max((data[hovered].amount / max) * chartH, 1)) / height) * 100}%`,
            }}
          >
            <div className="font-mono font-bold">${data[hovered].amount.toLocaleString()}</div>
            <div className="text-muted">{data[hovered].label}</div>
          </div>
        )}
      </div>
    </div>
  );
}
