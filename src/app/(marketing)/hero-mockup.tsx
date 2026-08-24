const STATS = [
  { label: "Active fleet", value: "6" },
  { label: "Upcoming bookings", value: "9" },
  { label: "Revenue this month", value: "$18,400" },
  { label: "Documents on file", value: "14" },
];

const VEHICLES = [
  { make: "McLaren", model: "720S", status: "Available", from: "#3a2a1e", to: "#1b1b1f" },
  { make: "Porsche", model: "911 Turbo S", status: "Available", from: "#241f2e", to: "#1b1b1f" },
  { make: "Ferrari", model: "488 Spider", status: "Booked", from: "#2e1a1a", to: "#1b1b1f" },
];

/**
 * A static, always-up-to-date recreation of the real dashboard — not a
 * live embed (no session to render one on the marketing site) and not a
 * screenshot that goes stale the next time the app's UI changes.
 */
export function HeroMockup() {
  return (
    <div className="rounded-[16px] border border-line bg-surface p-1">
      <div className="rounded-[12px] bg-gradient-to-br from-surface-2 to-surface p-5 sm:p-7">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="text-[15px] font-bold text-paper">Apex Exotics Rentals</div>
            <div className="mt-1 flex items-center gap-2 text-[11px] text-muted">
              <span className="rounded-full bg-amber-soft px-2 py-0.5 font-mono font-bold uppercase tracking-wide text-amber-text">
                owner
              </span>
              <span>Jordan Cole</span>
            </div>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-[9px] bg-amber font-mono text-xs font-bold text-on-amber">
            JC
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="rounded-[10px] border border-line bg-ink/40 px-3 py-2.5 text-left"
            >
              <div className="font-mono text-[9.5px] uppercase tracking-wide text-muted-dim">
                {stat.label}
              </div>
              <div className="mt-1 text-[17px] font-bold text-paper">{stat.value}</div>
            </div>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2.5">
          {VEHICLES.map((vehicle) => (
            <div
              key={vehicle.model}
              className="overflow-hidden rounded-[10px] border border-line text-left"
            >
              <div
                className="relative flex h-[52px] items-end p-2 sm:h-[64px]"
                style={{
                  background: `linear-gradient(135deg, ${vehicle.from}, ${vehicle.to})`,
                }}
              >
                <span
                  className={`rounded-full px-1.5 py-0.5 font-mono text-[8px] font-bold uppercase tracking-wide ${
                    vehicle.status === "Available"
                      ? "bg-amber-soft text-amber-text"
                      : "bg-ink/70 text-muted"
                  }`}
                >
                  {vehicle.status}
                </span>
              </div>
              <div className="bg-ink/40 px-2 py-1.5">
                <div className="truncate text-[10.5px] font-semibold text-paper">
                  {vehicle.make} {vehicle.model}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
