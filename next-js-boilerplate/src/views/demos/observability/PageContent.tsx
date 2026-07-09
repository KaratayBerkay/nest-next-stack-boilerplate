"use client";

import { useEffect, useState, type Dispatch, type SetStateAction } from "react";

type ObservabilitySnapshot = {
  startedAt: number | null;
  runtime: string | null;
  uptimeMs: number | null;
  spanCount: number;
  recentSpans: string[];
  customSpanExported: boolean;
  errors: { message: string; routerKind?: string; route?: string }[];
};

import { OBSERVABILITY_URL } from "@/constants/api/urls";

function loadSnapshot(): Promise<ObservabilitySnapshot> {
  return fetch(OBSERVABILITY_URL, { cache: "no-store" }).then(
    (r) => r.json() as Promise<ObservabilitySnapshot>,
  );
}

function refresh(
  setData: Dispatch<SetStateAction<ObservabilitySnapshot | null>>,
  setError: Dispatch<SetStateAction<string | null>>,
) {
  loadSnapshot()
    .then(setData)
    .catch((e: unknown) =>
      setError(e instanceof Error ? e.message : "request failed"),
    );
}

export default function ObservabilityPage() {
  const [data, setData] = useState<ObservabilitySnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSnapshot()
      .then(setData)
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : "request failed"),
      );
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-brand text-sm font-semibold">
        Instrumentation &amp; OpenTelemetry
      </h2>
      <p className="text-muted text-sm">
        The <code className="text-brand">register()</code> startup hook in{" "}
        <code className="text-brand">instrumentation.ts</code> records a boot
        marker and wires up OpenTelemetry via{" "}
        <code className="text-brand">@vercel/otel</code>. An in-memory span
        processor mirrors every exported trace so it can be inspected here.
      </p>

      {error && (
        <p className="text-sm text-red-500" data-testid="obs-error">
          Error: {error}
        </p>
      )}

      {data && (
        <div
          className="flex flex-col gap-1 rounded border p-3 text-sm"
          data-testid="obs-data"
        >
          <span>
            startup hook ran:{" "}
            <span className="font-mono" data-testid="obs-started">
              {data.startedAt ? "yes" : "no"}
            </span>
          </span>
          <span>
            runtime:{" "}
            <span className="font-mono" data-testid="obs-runtime">
              {data.runtime ?? "unknown"}
            </span>
          </span>
          <span>
            spans exported:{" "}
            <span className="font-mono" data-testid="obs-span-count">
              {data.spanCount}
            </span>
          </span>
          <span>
            custom span exported:{" "}
            <span className="font-mono" data-testid="obs-custom-span">
              {data.customSpanExported ? "yes" : "no"}
            </span>
          </span>
          {data.recentSpans.length > 0 && (
            <span className="text-xs text-zinc-500">
              recent: {data.recentSpans.join(", ")}
            </span>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={() => refresh(setData, setError)}
        className="self-start rounded border px-3 py-1 text-xs"
        data-testid="obs-refresh"
      >
        Refresh
      </button>
    </div>
  );
}
