import Link from "next/link";
import Image from "next/image";
import type { VehicleStatus } from "@/types/database";

const STATUS_LABEL: Record<VehicleStatus, string> = {
  draft: "Draft",
  published: "Available",
  archived: "Archived",
};

export function VehicleCard({
  id,
  make,
  model,
  color,
  status,
  photoUrl,
}: {
  id: string;
  make: string;
  model: string;
  color: string | null;
  status: VehicleStatus;
  photoUrl: string | null;
}) {
  return (
    <Link
      href={`/dashboard/vehicles/${id}`}
      className="group overflow-hidden rounded-[14px] border border-line bg-surface transition hover:-translate-y-0.5 hover:border-amber-text"
    >
      <div className="relative flex h-[132px] items-center justify-center bg-gradient-to-br from-surface-2 to-surface">
        {photoUrl ? (
          <Image src={photoUrl} alt="" fill sizes="33vw" className="object-cover" />
        ) : (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            className="h-14 w-14 text-muted opacity-40"
          >
            <path d="M3 13l1.8-6A2.4 2.4 0 017.1 5.5h9.8a2.4 2.4 0 012.3 1.8L21 13" />
            <rect x="2.5" y="13" width="19" height="5" rx="2" />
            <circle cx="7" cy="18.5" r="1.5" />
            <circle cx="17" cy="18.5" r="1.5" />
          </svg>
        )}
        <span
          className={`absolute right-2.5 top-2.5 rounded-full bg-gradient-to-br from-surface to-surface-2 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide ${
            status === "published" ? "text-amber-text" : "text-muted"
          }`}
        >
          {STATUS_LABEL[status]}
        </span>
      </div>
      <div className="px-4 py-3.5">
        <div className="mb-0.5 text-[14.5px] font-semibold">
          {make} {model}
        </div>
        <div className="font-mono text-[11px] tracking-wide text-muted">
          {color ?? "—"}
        </div>
      </div>
    </Link>
  );
}
