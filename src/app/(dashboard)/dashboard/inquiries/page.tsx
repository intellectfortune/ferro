import { listInquiries } from "@/lib/queries/inquiries";
import { StatusButtons } from "./status-buttons";
import type { InquirySource, InquiryStatus } from "@/types/database";

const SOURCE_LABEL: Record<InquirySource, string> = {
  web_form: "Web form",
  call: "Call",
  instagram_dm: "Instagram DM",
};

const SOURCE_ICON: Record<InquirySource, React.ReactNode> = {
  web_form: (
    <path d="M2.5 5.5a2 2 0 012-2h11a2 2 0 012 2v9a2 2 0 01-2 2h-11a2 2 0 01-2-2v-9zM2.5 6l7.5 5 7.5-5" />
  ),
  call: (
    <path d="M4 3.5c.5 1.6 1.2 3 2.2 4.2l-1.3 1.8c1 1.8 2.5 3.3 4.3 4.3l1.8-1.3c1.2 1 2.6 1.7 4.2 2.2v2.3c0 .6-.5 1-1.1 1C8.5 17.5 2.5 11.5 2.2 5.6c0-.6.4-1.1 1-1.1H4z" />
  ),
  instagram_dm: (
    <path d="M6 2.5h8a3.5 3.5 0 013.5 3.5v8a3.5 3.5 0 01-3.5 3.5H6a3.5 3.5 0 01-3.5-3.5V6A3.5 3.5 0 016 2.5zM10 7a3 3 0 100 6 3 3 0 000-6zM14 6.2h.01" />
  ),
};

const STATUS_STYLE: Record<InquiryStatus, string> = {
  new: "bg-amber-soft text-amber-text",
  contacted: "bg-surface-2 text-paper",
  closed: "bg-surface-2 text-muted",
};

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export default async function InquiriesPage() {
  const inquiries = await listInquiries();

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold tracking-tight">Inquiries</h1>

      {inquiries.length === 0 ? (
        <div className="rounded-[14px] border border-dashed border-line bg-surface px-6 py-10 text-center text-sm text-muted">
          No inquiries yet. Web form submissions from your storefront will
          show up here.
        </div>
      ) : (
        <div className="overflow-hidden rounded-[14px] border border-line bg-surface">
          {inquiries.map((inquiry) => {
            const vehicle = inquiry.vehicles as unknown as {
              make: string;
              model: string;
            } | null;
            return (
              <div
                key={inquiry.id}
                className="flex flex-col gap-3 border-b border-line px-5 py-4 last:border-0 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-[6px] bg-amber-soft">
                      <svg
                        viewBox="0 0 20 20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        className="h-3.5 w-3.5 text-amber-text"
                      >
                        {SOURCE_ICON[inquiry.source]}
                      </svg>
                    </span>
                    <span className="font-mono text-[10.5px] uppercase tracking-wide text-muted">
                      {SOURCE_LABEL[inquiry.source]}
                    </span>
                    <span className="text-[11px] text-muted">
                      · {timeAgo(inquiry.occurred_at)}
                    </span>
                    {vehicle && (
                      <span className="text-[11px] text-muted">
                        · {vehicle.make} {vehicle.model}
                      </span>
                    )}
                  </div>
                  <div className="mt-1.5 text-[14.5px] font-semibold">
                    {inquiry.customer_name ?? "Unknown"}
                  </div>
                  <div className="mt-0.5 text-[12.5px] text-muted">
                    {[inquiry.customer_email, inquiry.customer_phone]
                      .filter(Boolean)
                      .join(" · ")}
                  </div>
                  {inquiry.message && (
                    <p className="mt-2 max-w-xl text-[13.5px] leading-relaxed text-paper/90">
                      {inquiry.message}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wide ${STATUS_STYLE[inquiry.status]}`}
                  >
                    {inquiry.status}
                  </span>
                  <StatusButtons inquiryId={inquiry.id} status={inquiry.status} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
