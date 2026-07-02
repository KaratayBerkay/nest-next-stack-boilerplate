"use client";

import { useState } from "react";
import { useWebSocket } from "@/hooks/useWebSocket";

const STATUS_LABEL: Record<string, string> = {
  connecting: "Connecting...",
  connected: "Connected",
  disconnected: "Disconnected",
};

const STATUS_COLOR: Record<string, string> = {
  connecting: "text-yellow-600",
  connected: "text-green-600",
  disconnected: "text-red-600",
};

export default function WsPage() {
  const { status, messages, send } = useWebSocket();
  const [input, setInput] = useState("");

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-brand text-sm font-semibold">WebSocket</h2>
      <p className="text-muted text-sm">
        Connects to the NestJS WebSocket gateway at{" "}
        <code className="text-brand">NEXT_PUBLIC_WS_URL</code>.
      </p>
      <p className="text-xs">
        Status:{" "}
        <span
          className={`font-semibold ${STATUS_COLOR[status]}`}
          data-testid="ws-status"
        >
          {STATUS_LABEL[status]}
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
          onClick={() => {
            send(input);
            setInput("");
          }}
          disabled={status !== "connected"}
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
        {messages.length === 0 && (
          <span className="text-zinc-400">No messages yet.</span>
        )}
        {messages.map((msg, i) => (
          <span key={i}>{msg}</span>
        ))}
      </div>
    </div>
  );
}
