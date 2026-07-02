"use client";

// Segment error boundary. Must be a Client Component. It catches errors thrown
// while rendering this segment's page and renders a fallback; `reset()` retries
// rendering the segment from scratch.
export default function BoomError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div
      data-testid="error-boundary"
      className="surface flex flex-col gap-2 p-5"
    >
      <h2 className="text-sm font-semibold text-red-600">
        Something went wrong
      </h2>
      <p data-testid="error-message" className="text-muted text-sm">
        {error.message}
      </p>
      <button
        type="button"
        data-testid="error-reset"
        className="text-brand underline"
        onClick={() => reset()}
      >
        Try again
      </button>
    </div>
  );
}
