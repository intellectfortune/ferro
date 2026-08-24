import { redirect } from "next/navigation";
import { getCurrentProfile, canManageVehicles } from "@/lib/actions/profile";
import {
  listInvoices,
  listInvoiceableBookings,
  getRevenueSeries,
  getOutstandingVsPaid,
  getUpcomingPayments,
  getTopVehiclesByRevenue,
  countInvoicesByStatusThisMonth,
} from "@/lib/queries/invoices";
import { NewInvoiceButton } from "./new-invoice-button";
import { RevenueChart } from "./revenue-chart";

const STATUS_STYLE: Record<string, string> = {
  paid: "bg-amber-soft text-amber-text",
  open: "bg-surface-2 text-muted",
  draft: "bg-surface-2 text-muted",
  void: "bg-surface-2 text-muted line-through",
  uncollectible: "bg-surface-2 text-red-400",
};

function dueDateLabel(dueDate: string) {
  const diffMs = new Date(dueDate).getTime() - Date.now();
  const days = Math.round(diffMs / (1000 * 60 * 60 * 24));
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return "Due today";
  return `Due in ${days}d`;
}

function SectionCard({
  title,
  children,
  className = "",
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-[14px] border border-line bg-surface p-6 ${className}`}>
      {title && <h2 className="mb-5 text-sm font-semibold">{title}</h2>}
      {children}
    </div>
  );
}

export default async function BillingPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (!canManageVehicles(profile.role)) redirect("/dashboard");

  const [invoices, bookings, revenueSeries, breakdown, upcoming, topVehicles, statusCounts] =
    await Promise.all([
      listInvoices(),
      listInvoiceableBookings(),
      getRevenueSeries("30d"),
      getOutstandingVsPaid(),
      getUpcomingPayments(5),
      getTopVehiclesByRevenue(5),
      countInvoicesByStatusThisMonth(),
    ]);

  const breakdownTotal = breakdown.paid + breakdown.outstanding || 1;
  const topVehicleMax = Math.max(...topVehicles.map((v) => v.amount), 1);

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Billing</h1>
        <div className="flex items-center gap-3">
          {/* Downloads a file (Content-Disposition: attachment), not a page — a plain anchor is correct here. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a
            href="/api/invoices/export"
            className="rounded-[9px] border border-line px-3 py-2 text-sm font-medium text-muted transition hover:border-amber-text hover:text-amber-text"
          >
            Export CSV
          </a>
          <NewInvoiceButton bookings={bookings} />
        </div>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <SectionCard className="lg:col-span-2">
          <RevenueChart initialData={revenueSeries} />
        </SectionCard>

        <SectionCard title="Outstanding vs. paid">
          <div className="flex h-3 overflow-hidden rounded-full bg-line">
            <div
              className="bg-amber"
              style={{
                width: `${(breakdown.paid / breakdownTotal) * 100}%`,
              }}
            />
            <div className="w-0.5 bg-surface" />
            <div
              className="bg-surface-2"
              style={{
                width: `${(breakdown.outstanding / breakdownTotal) * 100}%`,
              }}
            />
          </div>
          <div className="mt-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm">
                <span className="h-2 w-2 rounded-full bg-amber" /> Paid
              </span>
              <span className="text-right">
                <span className="block font-mono text-sm font-bold">
                  ${breakdown.paid.toLocaleString()}
                </span>
                <span className="block font-mono text-[10.5px] text-muted">
                  {statusCounts.paid} this month
                </span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm">
                <span className="h-2 w-2 rounded-full bg-surface-2" /> Outstanding
              </span>
              <span className="text-right">
                <span className="block font-mono text-sm font-bold">
                  ${breakdown.outstanding.toLocaleString()}
                </span>
                <span className="block font-mono text-[10.5px] text-muted">
                  {statusCounts.outstanding} this month
                </span>
              </span>
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <SectionCard title="Upcoming payments">
          {upcoming.length === 0 ? (
            <p className="text-sm text-muted">No open invoices with a due date.</p>
          ) : (
            <div className="space-y-4">
              {upcoming.map((inv) => {
                const booking = inv.bookings as unknown as {
                  customer_name: string;
                  vehicles: { make: string; model: string } | null;
                } | null;
                return (
                  <div key={inv.id} className="flex items-center justify-between">
                    <div>
                      <div className="text-[13px] font-medium">
                        {booking?.customer_name ?? "Unknown"}
                      </div>
                      <div className="text-xs text-muted">
                        {booking?.vehicles
                          ? `${booking.vehicles.make} ${booking.vehicles.model}`
                          : ""}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-sm font-bold">
                        ${inv.amount.toLocaleString()}
                      </div>
                      <div className="font-mono text-[10.5px] text-muted">
                        {inv.due_date ? dueDateLabel(inv.due_date) : ""}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Top vehicles by revenue">
          {topVehicles.length === 0 ? (
            <p className="text-sm text-muted">No paid invoices yet.</p>
          ) : (
            <div className="space-y-3.5">
              {topVehicles.map((vehicle, i) => (
                <div key={vehicle.label + i}>
                  <div className="mb-1 flex items-center justify-between text-[13px]">
                    <span className="font-medium">{vehicle.label}</span>
                    <span className="font-mono font-bold">
                      ${vehicle.amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-line">
                    <div
                      className="h-full rounded-full bg-amber"
                      style={{ width: `${(vehicle.amount / topVehicleMax) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      {invoices.length === 0 ? (
        <div className="rounded-[14px] border border-dashed border-line bg-surface px-6 py-10 text-center text-sm text-muted">
          No invoices yet.
          {bookings.length === 0
            ? " Confirm a booking first, then invoice it here."
            : " Create your first one."}
        </div>
      ) : (
        <div className="overflow-hidden rounded-[14px] border border-line bg-surface">
          {invoices.map((invoice) => {
            const booking = invoice.bookings as unknown as {
              customer_name: string;
              vehicles: { make: string; model: string } | null;
            } | null;

            return (
              <div
                key={invoice.id}
                className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-4 last:border-0 sm:flex-nowrap sm:gap-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13.5px] font-semibold">
                    {booking?.customer_name ?? "Unknown customer"}
                  </div>
                  <div className="truncate text-xs text-muted">
                    {booking?.vehicles
                      ? `${booking.vehicles.make} ${booking.vehicles.model}`
                      : ""}
                  </div>
                </div>
                <span
                  className={`flex-shrink-0 rounded-full px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wide ${
                    STATUS_STYLE[invoice.status] ?? "bg-surface-2 text-muted"
                  }`}
                >
                  {invoice.status}
                </span>
                <span className="flex-shrink-0 font-mono text-sm font-bold">
                  ${invoice.amount}
                </span>
                {invoice.hosted_invoice_url && (
                  <a
                    href={invoice.hosted_invoice_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-shrink-0 font-mono text-xs text-muted hover:text-amber-text"
                  >
                    View →
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
