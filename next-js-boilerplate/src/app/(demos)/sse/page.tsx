"use client";

import { useSSE } from "@/hooks/useSSE";

export default function SsePage() {
  const { events, connected } = useSSE("/api/sse");

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-brand text-sm font-semibold">
        Server-Sent Events (SSE)
      </h2>
      <p className="text-muted text-sm">
        Live events streamed from a Route Handler via{" "}
        <code className="text-brand">text/event-stream</code>.
      </p>
      <p className="text-xs">
        Status:{" "}
        <span
          className={`font-semibold ${connected ? "text-green-600" : "text-red-600"}`}
          data-testid="sse-status"
        >
          {connected ? "Connected" : "Disconnected"}
        </span>
      </p>
      <div
        className="flex max-h-48 flex-col gap-0.5 overflow-y-auto rounded border p-2 font-mono text-xs"
        data-testid="sse-events"
      >
        {events.length === 0 && (
          <span className="text-zinc-400">Waiting for events...</span>
        )}
        {events.map((ev, i) => (
          <span key={ev.time}>
            #{i + 1} value={ev.value.toFixed(4)}
          </span>
        ))}
      </div>
    </div>
  );
}
