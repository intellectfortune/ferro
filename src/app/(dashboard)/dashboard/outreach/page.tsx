const inputClass =
  "mt-1 w-full cursor-not-allowed rounded-[9px] border border-line bg-surface-2 px-3 py-2 text-sm text-paper/50 outline-none";
const labelClass = "block text-xs text-muted";

export default function OutreachPage() {
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Outreach</h1>
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
            <path d="M17.5 2.5l-15 6.2 5.7 2.3 2.3 5.7 7-14.2z" />
            <path d="M10.5 9.5l3-3" />
          </svg>
        </div>
        <div>
          <h2 className="text-base font-bold">Instagram DM automation</h2>
          <p className="mt-1 max-w-lg text-sm leading-relaxed text-muted">
            Auto-reply to inquiries on your listings&apos; posts and turn
            Instagram comments/DMs into bookings — without leaving Ferro.
            This needs Meta Developer API access, which isn&apos;t set up
            yet. Here&apos;s a preview of what&apos;s coming.
          </p>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-[14px] border border-dashed border-line bg-surface p-6">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Auto-reply rule</h3>
          <span className="rounded-full border border-line px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-wide text-muted">
            Preview
          </span>
        </div>

        <div className="pointer-events-none grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelClass}>Connected account</label>
            <input disabled placeholder="@apexexotics" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Trigger</label>
            <input disabled placeholder="Comment or DM contains &quot;price&quot;" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Response delay</label>
            <input disabled placeholder="Instant" className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Auto-reply message</label>
            <textarea
              disabled
              rows={3}
              placeholder="Hey! Thanks for reaching out — I've sent you our availability and pricing in your DMs."
              className={inputClass}
            />
          </div>
        </div>

        <button
          disabled
          className="pointer-events-none mt-6 cursor-not-allowed rounded-[9px] bg-amber px-4 py-2 text-sm font-medium text-on-amber opacity-50"
        >
          Save rule
        </button>
      </div>
    </div>
  );
}
