import Link from "next/link";
import {
  listVehiclesWithCoverPhoto,
  countVehiclesAddedThisMonth,
  countActiveVehicles,
} from "@/lib/queries/vehicles";
import {
  countUpcomingBookings,
  countBookingsStartingThisWeek,
  listRecentBookings,
} from "@/lib/queries/bookings";
import { countDocuments, countDocumentsAddedThisWeek } from "@/lib/queries/documents";
import { sumRevenueThisMonth, sumRevenueLastMonth } from "@/lib/queries/invoices";
import { getCurrentProfile, canManageVehicles } from "@/lib/actions/profile";
import { VehicleCard } from "@/components/vehicle-card";

function StatCard({
  label,
  value,
  caption,
  trend = "neutral",
}: {
  label: string;
  value: React.ReactNode;
  caption?: string;
  trend?: "up" | "neutral";
}) {
  return (
    <div className="bg-surface p-5">
      <div className="mb-2.5 font-mono text-[11px] uppercase tracking-wide text-muted">
        {label}
      </div>
      <div className="mb-1.5 text-[30px] font-bold tracking-tight">{value}</div>
      {caption && (
        <div
          className={`text-[12.5px] font-medium ${trend === "up" ? "text-amber-text" : "text-muted"}`}
        >
          {caption}
        </div>
      )}
    </div>
  );
}

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default async function DashboardPage() {
  const profile = await getCurrentProfile();
  const canSeeRevenue = canManageVehicles(profile?.role);

  const [
    vehicles,
    activeFleet,
    vehiclesAddedThisMonth,
    upcomingBookings,
    bookingsThisWeek,
    recentBookings,
    documentCount,
    documentsThisWeek,
    revenue,
    revenueLastMonth,
  ] = await Promise.all([
    listVehiclesWithCoverPhoto(6),
    countActiveVehicles(),
    countVehiclesAddedThisMonth(),
    countUpcomingBookings(),
    countBookingsStartingThisWeek(),
    listRecentBookings(5),
    countDocuments(),
    countDocumentsAddedThisWeek(),
    canSeeRevenue ? sumRevenueThisMonth() : Promise.resolve(null),
    canSeeRevenue ? sumRevenueLastMonth() : Promise.resolve(null),
  ]);

  const revenueChangePct =
    canSeeRevenue && revenueLastMonth
      ? Math.round((((revenue ?? 0) - revenueLastMonth) / revenueLastMonth) * 100)
      : null;

  return (
    <div>
      <div className="mb-10 grid grid-cols-2 gap-px overflow-hidden rounded-[14px] border border-line bg-line sm:grid-cols-4">
        <StatCard
          label="Active fleet"
          value={activeFleet}
          caption={
            vehiclesAddedThisMonth > 0 ? `+${vehiclesAddedThisMonth} this month` : undefined
          }
          trend="up"
        />
        <StatCard
          label="Upcoming bookings"
          value={upcomingBookings}
          caption={bookingsThisWeek > 0 ? `${bookingsThisWeek} this week` : "None this week"}
        />
        {canSeeRevenue ? (
          <StatCard
            label="Revenue this month"
            value={`$${(revenue ?? 0).toLocaleString()}`}
            caption={
              revenueChangePct !== null
                ? `${revenueChangePct >= 0 ? "+" : ""}${revenueChangePct}% vs last`
                : "First month of revenue"
            }
            trend={revenueChangePct !== null && revenueChangePct >= 0 ? "up" : "neutral"}
          />
        ) : (
          <StatCard label="Revenue this month" value="—" caption="Owner/broker only" />
        )}
        <StatCard
          label="Documents on file"
          value={documentCount}
          caption={documentsThisWeek > 0 ? `+${documentsThisWeek} this week` : undefined}
          trend="up"
        />
      </div>

      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-[17px] font-bold tracking-tight">Fleet</h2>
        <Link
          href="/dashboard/vehicles"
          className="font-mono text-xs text-muted hover:text-amber-text"
        >
          View all →
        </Link>
      </div>

      {vehicles.length === 0 ? (
        <div className="rounded-[14px] border border-dashed border-line bg-surface px-6 py-10 text-center text-sm text-muted">
          No vehicles yet.{" "}
          <Link href="/dashboard/vehicles/new" className="text-amber-text hover:underline">
            Add your first one
          </Link>
          .
        </div>
      ) : (
        <div className="mb-11 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {vehicles.map((vehicle) => (
            <VehicleCard key={vehicle.id} {...vehicle} />
          ))}
        </div>
      )}

      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-[17px] font-bold tracking-tight">Recent activity</h2>
        {recentBookings.length > 0 && (
          <Link
            href="/dashboard/bookings"
            className="font-mono text-xs text-muted hover:text-amber-text"
          >
            View all →
          </Link>
        )}
      </div>
      {recentBookings.length === 0 ? (
        <div className="rounded-[14px] border border-line bg-surface px-6 py-10 text-center text-sm text-muted">
          No activity yet — bookings and check-ins will show up here.
        </div>
      ) : (
        <div className="overflow-hidden rounded-[14px] border border-line bg-surface">
          {recentBookings.map((booking) => {
            const vehicle = booking.vehicles as unknown as {
              make: string;
              model: string;
            } | null;
            return (
              <Link
                key={booking.id}
                href={`/dashboard/bookings/${booking.id}`}
                className="flex items-center gap-3.5 border-b border-line px-5 py-3.5 transition last:border-0 hover:bg-surface-2"
              >
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[9px] bg-amber-soft">
                  <svg
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-[15px] w-[15px] text-amber-text"
                  >
                    <rect x="2.5" y="3.5" width="15" height="14" rx="2" />
                    <path d="M2.5 8h15M6.5 2v3M13.5 2v3" />
                    <path d="M6.5 12l1.8 1.8L11 10.5" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13.5px] font-medium">
                    {booking.status === "inquiry" ? "Inquiry" : "Booking"} —{" "}
                    {booking.customer_name}
                  </div>
                  <div className="truncate text-xs text-muted">
                    {vehicle ? `${vehicle.make} ${vehicle.model}` : ""}
                  </div>
                </div>
                <div className="flex-shrink-0 font-mono text-[11.5px] text-muted">
                  {timeAgo(booking.created_at)}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
