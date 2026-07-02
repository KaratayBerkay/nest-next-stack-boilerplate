// Route-level loading UI. Next wraps the page in a Suspense boundary and shows
// this instantly while the page's async work runs (on navigation and on the
// initial streamed render), then swaps in the page once it resolves.
export default function Loading() {
  return (
    <p data-testid="route-loading" className="text-muted animate-pulse text-sm">
      Loading the slow route…
    </p>
  );
}
