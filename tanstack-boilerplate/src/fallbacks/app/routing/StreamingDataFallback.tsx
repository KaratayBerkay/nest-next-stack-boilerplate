export function StreamingDataFallback() {
  return (
    <p
      data-testid="suspense-fallback"
      className="text-muted animate-pulse text-sm"
    >
      Streaming data…
    </p>
  );
}
