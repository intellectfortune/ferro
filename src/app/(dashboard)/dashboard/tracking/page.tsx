import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/actions/profile";
import { listVehiclesForTracking } from "@/lib/queries/tracking";
import { listConnectionStatuses } from "@/lib/queries/settings";
import { listBouncieVehicles, listBouncieTrips, type BouncieTrip } from "@/lib/bouncie";
import { LiveMap, type MapMarker } from "@/components/live-map";
import { StatusIcon, FuelIcon } from "@/components/status-icon";

function formatTripRoute(trip: BouncieTrip) {
  const start = new Date(trip.startTime).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
  return `Trip at ${start}`;
}

function formatDuration(startTime: string, endTime: string) {
  const mins = Math.round(
    (new Date(endTime).getTime() - new Date(startTime).getTime()) / 60000
  );
  return `${mins} min`;
}

export default async function TrackingPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const vehicles = await listVehiclesForTracking();
  const connectedVehicles = vehicles.filter((v) => v.bouncie_imei);

  const connections = await listConnectionStatuses();
  const bouncieConnected =
    connections.find((c) => c.provider === "bouncie")?.status === "connected";

  let liveVehicles: Awaited<ReturnType<typeof listBouncieVehicles>> = null;
  let recentTrips: BouncieTrip[] = [];
  let liveError: string | null = null;

  if (bouncieConnected) {
    try {
      liveVehicles = await listBouncieVehicles(profile.company_id);
    } catch (err) {
      liveError = err instanceof Error ? err.message : "Failed to load Bouncie data.";
    }

    if (!liveError) {
      // Settled rather than all-or-nothing: one vehicle's trip history
      // failing to load shouldn't blank out the live map/status for every
      // other vehicle that loaded fine.
      const tripLists = await Promise.allSettled(
        connectedVehicles
          .slice(0, 5)
          .map((v) => listBouncieTrips(profile.company_id, v.bouncie_imei!))
      );
      recentTrips = tripLists
        .filter((result) => result.status === "fulfilled")
        .flatMap((result) => result.value ?? [])
        .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
        .slice(0, 5);
    }
  }

  const liveByImei = new Map((liveVehicles ?? []).map((v) => [v.imei, v]));
  const mapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const mapMarkers: MapMarker[] = connectedVehicles.flatMap((vehicle) => {
    const live = liveByImei.get(vehicle.bouncie_imei!);
    const location = live?.stats?.location;
    if (location?.lat == null || location?.lon == null) return [];
    return [
      {
        id: vehicle.id,
        label: `${vehicle.make} ${vehicle.model}`,
        lat: location.lat,
        lon: location.lon,
        running: Boolean(live?.stats?.isRunning),
        photoUrl: vehicle.photoUrl,
      },
    ];
  });

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Tracking</h1>
        <span className="rounded-full bg-amber-soft px-2.5 py-1 font-mono text-[10.5px] font-bold uppercase tracking-wide text-amber-text">
          Bouncie GPS
        </span>
      </div>
      <p className="mb-8 text-sm text-muted">
        Live location, trip history, and diagnostics per vehicle. Connect a Bouncie
        account and add each vehicle&apos;s device IMEI to bring this to life.
      </p>

      <div className="mb-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="order-2 rounded-[14px] border border-line bg-surface p-6 lg:order-1 lg:col-span-1">
          <h2 className="mb-4 text-sm font-semibold">Fleet</h2>
          {vehicles.length === 0 ? (
            <p className="text-sm text-muted">No vehicles yet.</p>
          ) : (
            <div className="space-y-3">
              {vehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-[9px] border border-line px-3.5 py-3"
                >
                  <div className="min-w-0">
                    <div className="truncate text-[13px] font-medium">
                      {vehicle.make} {vehicle.model}
                    </div>
                    <div className="text-xs text-muted">{vehicle.color ?? "—"}</div>
                  </div>
                  {vehicle.bouncie_imei ? (
                    (() => {
                      const isRunning = liveByImei.get(vehicle.bouncie_imei)?.stats?.isRunning;
                      return (
                        <span
                          className={`rounded-full px-2 py-0.5 font-mono text-[9.5px] font-bold uppercase tracking-wide ${
                            isRunning ? "bg-amber-soft text-amber-text" : "bg-surface-2 text-muted"
                          }`}
                        >
                          {isRunning ? "Running" : "Connected"}
                        </span>
                      );
                    })()
                  ) : (
                    <Link
                      href={`/dashboard/vehicles/${vehicle.id}`}
                      className="rounded-full border border-line px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-wide text-muted transition hover:border-amber-text hover:text-amber-text"
                    >
                      Add device
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="order-1 rounded-[14px] border border-line bg-surface p-6 lg:order-2 lg:col-span-2">
          <h2 className="mb-4 text-sm font-semibold">Live locations</h2>
          {bouncieConnected && !liveError && connectedVehicles.length > 0 && (
            <div className="mb-4 space-y-2">
              {connectedVehicles.map((vehicle) => {
                const live = liveByImei.get(vehicle.bouncie_imei!);
                const stats = live?.stats;
                const engineHealthy = !stats?.mil?.milOn;
                const batteryHealthy = (stats?.battery?.status ?? "normal") === "normal";
                return (
                  <div
                    key={vehicle.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-[9px] border border-line px-3.5 py-2.5"
                  >
                    <div className="min-w-0 truncate text-[13px] font-medium">
                      {vehicle.make} {vehicle.model}
                    </div>
                    <div className="flex items-center gap-2">
                      {stats?.fuelLevel != null && (
                        <span
                          title="Fuel level"
                          className="flex items-center gap-1 font-mono text-[10.5px] text-muted"
                        >
                          <FuelIcon className="h-3 w-3" />
                          {Math.round(stats.fuelLevel)}%
                        </span>
                      )}
                      <span title={engineHealthy ? "Engine healthy" : "Check engine"}>
                        <StatusIcon healthy={engineHealthy} size="sm" />
                      </span>
                      <span title={batteryHealthy ? "Battery healthy" : "Battery issue"}>
                        <StatusIcon healthy={batteryHealthy} size="sm" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {!bouncieConnected ? (
            <div className="flex aspect-[16/9] items-center justify-center rounded-[9px] border border-dashed border-line bg-surface-2 text-center">
              <div className="max-w-xs px-4">
                <p className="text-sm font-medium">Bouncie isn&apos;t connected yet</p>
                <p className="mt-1.5 text-xs text-muted">
                  Connect it from{" "}
                  <Link href="/dashboard/settings" className="text-amber-text hover:underline">
                    Settings
                  </Link>{" "}
                  to bring live location and trips to life here.
                </p>
              </div>
            </div>
          ) : liveError ? (
            <p className="text-sm text-red-400">{liveError}</p>
          ) : connectedVehicles.length === 0 ? (
            <div className="flex aspect-[16/9] items-center justify-center rounded-[9px] border border-dashed border-line bg-surface-2 text-center">
              <div className="max-w-xs px-4">
                <p className="text-sm font-medium">No vehicles linked yet</p>
                <p className="mt-1.5 text-xs text-muted">
                  Add a Bouncie device IMEI to a vehicle to see it here.
                </p>
              </div>
            </div>
          ) : !mapsApiKey ? (
            <div className="space-y-2.5">
              {connectedVehicles.map((vehicle) => {
                const live = liveByImei.get(vehicle.bouncie_imei!);
                const location = live?.stats?.location;
                return (
                  <div
                    key={vehicle.id}
                    className="flex items-center justify-between rounded-[9px] border border-line px-3.5 py-3"
                  >
                    <div className="text-[13px] font-medium">
                      {vehicle.make} {vehicle.model}
                    </div>
                    <div className="text-right font-mono text-xs text-muted">
                      {location?.lat && location?.lon
                        ? `${location.lat.toFixed(4)}, ${location.lon.toFixed(4)}`
                        : "No location reported yet"}
                    </div>
                  </div>
                );
              })}
              <p className="pt-1 text-xs text-muted">
                Coordinates only for now — add{" "}
                <code className="font-mono">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to
                render these as pins on a map.
              </p>
            </div>
          ) : mapMarkers.length === 0 ? (
            <div className="flex aspect-[16/9] items-center justify-center rounded-[9px] border border-dashed border-line bg-surface-2 text-center">
              <p className="max-w-xs px-4 text-sm text-muted">
                Linked vehicles haven&apos;t reported a location yet.
              </p>
            </div>
          ) : (
            <LiveMap apiKey={mapsApiKey} markers={mapMarkers} />
          )}
        </div>
      </div>

      <div className="rounded-[14px] border border-line bg-surface p-6">
        <h2 className="mb-4 text-sm font-semibold">Recent trips</h2>
        {!bouncieConnected ? (
          <p className="text-sm text-muted">Connect Bouncie to see trip history.</p>
        ) : recentTrips.length === 0 ? (
          <p className="text-sm text-muted">No trips recorded yet.</p>
        ) : (
          <div className="space-y-4">
            {recentTrips.map((trip) => (
              <div key={trip.transactionId} className="flex items-center justify-between">
                <div>
                  <div className="text-[13px] font-medium">{formatTripRoute(trip)}</div>
                  <div className="text-xs text-muted">
                    {new Date(trip.startTime).toLocaleDateString()}
                  </div>
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
