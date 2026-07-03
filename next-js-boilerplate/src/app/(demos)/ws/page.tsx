"use client";

import { useState, useCallback } from "react";
import { useRealtime } from "@/lib/realtime/RealtimeProvider";

const STATUS_LABEL: Record<string, string> = {
  idle: "Idle",
  connecting: "Connecting...",
  authenticating: "Authenticating...",
  open: "Connected",
};

const STATUS_COLOR: Record<string, string> = {
  idle: "text-gray-600",
  connecting: "text-yellow-600",
  authenticating: "text-yellow-600",
  open: "text-green-600",
};

export default function WsPage() {
  const realtime = useRealtime();
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<string[]>([]);

  const handleSend = useCallback(() => {
    if (!input.trim() || !realtime) return;
    realtime.send({ type: "echo", body: input.trim() });
    setMsgs((prev) => [...prev, `> ${input.trim()}`]);
    setInput("");
  }, [input, realtime]);

  if (!realtime) {
    return (
      <div className="flex flex-col gap-2">
        <h2 className="text-brand text-sm font-semibold">WebSocket</h2>
        <p className="text-muted text-sm">Realtime not available.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-brand text-sm font-semibold">WebSocket</h2>
      <p className="text-muted text-sm">
        Connects via the RealtimeProvider layer.
      </p>
      <p className="text-xs">
        Status:{" "}
        <span
          className={`font-semibold ${STATUS_COLOR[realtime.status]}`}
          data-testid="ws-status"
        >
          {STATUS_LABEL[realtime.status]}
        </span>
      </p>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 rounded border px-2 py-1 text-sm"
          data-testid="ws-input"
        />
        <button
          onClick={handleSend}
          disabled={realtime.status !== "open"}
          className="bg-brand rounded px-3 py-1 text-xs text-white disabled:opacity-50"
          data-testid="ws-send"
        >
          Send
        </button>
      </div>
      <div
        className="flex max-h-48 flex-col gap-0.5 overflow-y-auto rounded border p-2 font-mono text-xs"
        data-testid="ws-messages"
      >
        {msgs.length === 0 && (
          <span className="text-zinc-400">No messages yet.</span>
        )}
        {msgs.map((msg, i) => (
          <span key={i}>{msg}</span>
        ))}
      </div>
    </div>
  );
}
