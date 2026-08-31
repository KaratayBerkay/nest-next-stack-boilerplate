export function ErrorBoundaryCustomFallback() {
  return (
    <div className="flex flex-col items-center gap-3 py-6">
      <p className="text-fg text-sm font-medium">Custom Error</p>
      <p className="text-muted text-xs">
        Something broke, but we handled it gracefully.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="bg-surface hover:bg-surface-hover rounded-md px-3 py-1 text-xs transition-colors"
      >
        Retry
      </button>
    </div>
  );
}
