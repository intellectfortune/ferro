import Link from "next/link";
import { listBookings } from "@/lib/queries/bookings";

const STATUS_STYLE: Record<string, string> = {
  inquiry: "bg-surface-2 text-muted",
  confirmed: "bg-amber-soft text-amber-text",
  in_progress: "bg-amber-soft text-amber-text",
  completed: "bg-surface-2 text-muted",
  cancelled: "bg-surface-2 text-muted line-through",
};

const STATUS_LABEL: Record<string, string> = {
  inquiry: "Inquiry",
  confirmed: "Confirmed",
  in_progress: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

function formatRange(startAt: string, endAt: string) {
  const start = new Date(startAt);
  const end = new Date(endAt);
  const fmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
  return `${fmt.format(start)} – ${fmt.format(end)}`;
}

export default async function BookingsPage() {
  const bookings = await listBookings();

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Bookings</h1>
        <Link
          href="/dashboard/bookings/new"
          className="rounded-[9px] bg-amber px-3 py-2 text-sm font-medium text-on-amber transition hover:brightness-110"
        >
          New booking
        </Link>
      </div>

      {bookings.length === 0 ? (
        <div className="rounded-[14px] border border-dashed border-line bg-surface px-6 py-10 text-center text-sm text-muted">
          No bookings yet.{" "}
          <Link href="/dashboard/bookings/new" className="text-amber-text hover:underline">
            Create your first one
          </Link>
          .
        </div>
      ) : (
        <div className="overflow-hidden rounded-[14px] border border-line bg-surface">
          {bookings.map((booking) => {
            const vehicle = booking.vehicles as unknown as {
              make: string;
              model: string;
            } | null;
            return (
              <Link
                key={booking.id}
                href={`/dashboard/bookings/${booking.id}`}
                className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-4 transition last:border-0 hover:bg-surface-2 sm:flex-nowrap sm:gap-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[14.5px] font-semibold">
                    {booking.customer_name}
                  </div>
                  <div className="mt-0.5 truncate text-[12.5px] text-muted">
                    {vehicle ? `${vehicle.make} ${vehicle.model}` : ""} ·{" "}
                    {formatRange(booking.start_at, booking.end_at)}
                  </div>
                </div>
                <span
                  className={`flex-shrink-0 rounded-full px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wide ${
                    STATUS_STYLE[booking.status] ?? "bg-surface-2 text-muted"
                  }`}
                >
                  {STATUS_LABEL[booking.status] ?? booking.status}
                </span>
                {booking.total_price && (
                  <span className="flex-shrink-0 font-mono text-sm font-bold">
                    ${booking.total_price}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
