"use client";

import { useEcho } from "@/hooks/useApi";

export default function ClientDataPage() {
  const { data, isLoading, error } = useEcho("TanStack Query");

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-brand text-sm font-semibold">
        Client Data (TanStack Query)
      </h2>
      <p className="text-muted text-sm">
        This data is fetched and cached on the client using{" "}
        <code className="text-brand">@tanstack/react-query</code>.
      </p>
      {isLoading && (
        <p className="text-sm text-zinc-500" data-testid="tq-loading">
          Loading...
        </p>
      )}
      {error && (
        <p className="text-sm text-red-500" data-testid="tq-error">
          Error: {error.message}
        </p>
      )}
      {data && (
        <div
          className="flex flex-col gap-1 rounded border p-3 text-sm"
          data-testid="tq-data"
        >
          <span>
            method: <span className="font-mono">{data.method}</span>
          </span>
          <span>
            hello: <span className="font-mono">{data.hello}</span>
          </span>
        </div>
      )}
    </div>
  );
}
