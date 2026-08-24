import Link from "next/link";
import { listConnectionStatuses } from "@/lib/queries/settings";
import { getBouncieVehicle, listBouncieTrips, type BouncieTrip } from "@/lib/bouncie";

function formatDuration(startTime: string, endTime: string) {
  const mins = Math.round(
    (new Date(endTime).getTime() - new Date(startTime).getTime()) / 60000
  );
  return `${mins} min`;
}

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function StatusIcon({ healthy }: { healthy: boolean }) {
  return (
    <span
      className={`flex h-5 w-5 items-center justify-center rounded-full ${
        healthy ? "bg-amber-soft text-amber-text" : "bg-red-400/10 text-red-400"
      }`}
    >
      {healthy ? (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3">
          <path d="M3 8.5l3 3 7-7" />
        </svg>
      ) : (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3 w-3">
          <path d="M8 1.5l7 12.5H1z" />
          <path d="M8 6.5v3.5M8 12h.01" />
        </svg>
      )}
    </span>
  );
}

export async function TrackingSection({
  companyId,
  bouncieImei,
}: {
  companyId: string;
  bouncieImei: string | null;
}) {
  if (!bouncieImei) return null;

  const connections = await listConnectionStatuses();
  const bouncieConnected =
    connections.find((c) => c.provider === "bouncie")?.status === "connected";

  return (
    <section className="mt-8 max-w-2xl">
      <h2 className="font-mono text-xs uppercase tracking-widest text-muted">
        Tracking
      </h2>
      {!bouncieConnected ? (
        <p className="mt-3 text-sm text-muted">
          Connect Bouncie from{" "}
          <Link href="/dashboard/settings" className="text-amber-text hover:underline">
            Settings
          </Link>{" "}
          to see live location and trip history for this vehicle.
        </p>
      ) : (
        <TrackingData companyId={companyId} imei={bouncieImei} />
      )}
    </section>
  );
}

async function TrackingData({ companyId, imei }: { companyId: string; imei: string }) {
  let vehicle: Awaited<ReturnType<typeof getBouncieVehicle>> = null;
  let trips: BouncieTrip[] = [];
  let error: string | null = null;

  try {
    [vehicle, trips] = await Promise.all([
      getBouncieVehicle(companyId, imei),
      listBouncieTrips(companyId, imei).then((t) => t ?? []),
    ]);
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load tracking data.";
  }

  if (error) {
    return <p className="mt-3 text-sm text-red-400">{error}</p>;
  }

  const stats = vehicle?.stats;
  const engineHealthy = !stats?.mil?.milOn;
  const batteryHealthy = (stats?.battery?.status ?? "normal") === "normal";

  return (
    <div className="mt-3 space-y-4">
      <div className="grid grid-cols-2 gap-4 rounded-[14px] border border-line bg-surface p-5 sm:grid-cols-3 lg:grid-cols-6">
        <div>
          <div className="font-mono text-[10.5px] uppercase tracking-wide text-muted">
            Status
          </div>
          <div className="mt-1 text-lg font-bold">
            {stats?.isRunning ? "Running" : "Parked"}
          </div>
          {stats?.lastUpdated && (
            <div className="mt-0.5 text-[11px] text-muted">
              Updated {timeAgo(stats.lastUpdated)}
            </div>
          )}
        </div>
        <div>
          <div className="font-mono text-[10.5px] uppercase tracking-wide text-muted">
            Location
          </div>
          <div className="mt-1 font-mono text-sm font-bold">
            {stats?.location?.lat && stats?.location?.lon
              ? `${stats.location.lat.toFixed(4)}, ${stats.location.lon.toFixed(4)}`
              : "—"}
          </div>
          {stats?.location?.address && (
            <div className="mt-0.5 truncate text-[11px] text-muted">
              {stats.location.address}
            </div>
          )}
        </div>
        <div>
          <div className="font-mono text-[10.5px] uppercase tracking-wide text-muted">
            Fuel level
          </div>
          <div className="mt-1 text-lg font-bold">
            {stats?.fuelLevel != null ? `${Math.round(stats.fuelLevel)}%` : "—"}
          </div>
          {stats?.fuelLevel != null && (
            <div className="mt-0.5 text-[11px] text-muted">
              {stats.fuelLevel < 20 ? "Refuel soon" : "Good"}
            </div>
          )}
        </div>
        <div>
          <div className="font-mono text-[10.5px] uppercase tracking-wide text-muted">
            Odometer
          </div>
          <div className="mt-1 text-lg font-bold">
            {stats?.odometer != null ? `${Math.round(stats.odometer).toLocaleString()} mi` : "—"}
          </div>
        </div>
        <div>
          <div className="font-mono text-[10.5px] uppercase tracking-wide text-muted">
            Engine
          </div>
          <div className="mt-1.5 flex items-center gap-1.5">
            <StatusIcon healthy={engineHealthy} />
            <span className="text-[13px] font-semibold">
              {engineHealthy ? "Healthy" : "Check engine"}
            </span>
          </div>
        </div>
        <div>
          <div className="font-mono text-[10.5px] uppercase tracking-wide text-muted">
            Battery
          </div>
          <div className="mt-1.5 flex items-center gap-1.5">
            <StatusIcon healthy={batteryHealthy} />
            <span className="text-[13px] font-semibold capitalize">
              {stats?.battery?.status ?? "Unknown"}
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-[14px] border border-line bg-surface p-5">
        <h3 className="mb-3 text-sm font-semibold">Recent trips</h3>
        {trips.length === 0 ? (
          <p className="text-sm text-muted">No trips recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {trips.slice(0, 5).map((trip) => (
              <div key={trip.transactionId} className="flex items-center justify-between">
                <div className="text-[13px] font-medium">
                  {new Date(trip.startTime).toLocaleString([], {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </div>
                <div className="text-right font-mono text-xs text-muted">
                  {trip.distance ? `${trip.distance.toFixed(1)} mi · ` : ""}
                  {formatDuration(trip.startTime, trip.endTime)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
