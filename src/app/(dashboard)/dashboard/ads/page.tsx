const inputClass =
  "mt-1 w-full cursor-not-allowed rounded-[9px] border border-line bg-surface-2 px-3 py-2 text-sm text-paper/50 outline-none";
const labelClass = "block text-xs text-muted";

export default function AdsPage() {
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Ads</h1>
        <span className="rounded-full bg-amber-soft px-2.5 py-1 font-mono text-[10.5px] font-bold uppercase tracking-wide text-amber-text">
          Coming soon
        </span>
      </div>

      <div className="mb-6 flex items-start gap-4 rounded-[14px] border border-line bg-surface p-6">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[10px] bg-amber-soft">
          <svg
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            className="h-5 w-5 text-amber-text"
          >
            <path d="M3 3v14M3 12l4-3 3 2 5-6" />
          </svg>
        </div>
        <div>
          <h2 className="text-base font-bold">Google &amp; Meta ads</h2>
          <p className="mt-1 max-w-lg text-sm leading-relaxed text-muted">
            Launch and manage ad campaigns for your listings straight from
            Ferro — just a link, a location, and a few specifics. Here&apos;s a
            preview of the campaign builder that&apos;s coming.
          </p>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-[14px] border border-dashed border-line bg-surface p-6">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-sm font-semibold">New campaign</h3>
          <span className="rounded-full border border-line px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-wide text-muted">
            Preview
          </span>
        </div>

        <div className="pointer-events-none grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelClass}>Listing link</label>
            <input
              disabled
              placeholder="https://ferro.app/apex-exotics/ferrari-488-spider"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Location</label>
            <input disabled placeholder="Miami, FL — 25mi radius" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Budget</label>
            <input disabled placeholder="$50/day" className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Campaign specifics</label>
            <textarea
              disabled
              rows={3}
              placeholder="Highlight the convertible top, weekend availability, and free delivery within 15 miles."
              className={inputClass}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass}>Launch mode</label>
            <div className="mt-1.5 flex gap-3">
              <div className="flex-1 rounded-[9px] border border-amber-text bg-amber-soft px-4 py-3">
                <div className="text-[13px] font-semibold text-amber-text">Review</div>
                <div className="mt-0.5 text-[11.5px] text-amber-text/80">
                  AI drafts the campaign — you approve and launch it.
                </div>
              </div>
              <div className="flex-1 rounded-[9px] border border-line px-4 py-3">
                <div className="text-[13px] font-semibold text-muted">Full control</div>
                <div className="mt-0.5 text-[11.5px] text-muted">
                  AI drafts and launches automatically.
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          disabled
          className="pointer-events-none mt-6 cursor-not-allowed rounded-[9px] bg-amber px-4 py-2 text-sm font-medium text-on-amber opacity-50"
        >
          Create campaign
        </button>
      </div>
    </div>
  );
}
