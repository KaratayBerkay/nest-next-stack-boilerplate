export function LazyLoadingFallback() {
  return (
    <div
      className="rounded border border-zinc-300 p-3 text-sm text-zinc-400"
      data-testid="lazy-loading"
    >
      Loading heavy component...
    </div>
  );
}
