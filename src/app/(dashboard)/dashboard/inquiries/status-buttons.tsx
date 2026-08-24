"use client";

import { updateInquiryStatus } from "@/lib/actions/inquiries";
import type { InquiryStatus } from "@/types/database";

const btnClass =
  "rounded-[7px] border border-line px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-wide text-muted transition hover:border-amber-text hover:text-amber-text";

export function StatusButtons({
  inquiryId,
  status,
}: {
  inquiryId: string;
  status: InquiryStatus;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {status === "new" && (
        <form action={updateInquiryStatus.bind(null, inquiryId, "contacted")}>
          <button type="submit" className={btnClass}>
            Mark contacted
          </button>
        </form>
      )}
      {status !== "closed" && (
        <form action={updateInquiryStatus.bind(null, inquiryId, "closed")}>
          <button type="submit" className={btnClass}>
            Close
          </button>
        </form>
      )}
    </div>
  );
}
