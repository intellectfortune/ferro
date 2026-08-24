export function PageLoading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="flex items-center gap-2.5 text-sm text-muted">
        <svg
          className="h-4 w-4 animate-spin"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M10 2.5a7.5 7.5 0 105.6 12.5" strokeLinecap="round" />
        </svg>
        Loading…
      </div>
    </div>
  );
}
