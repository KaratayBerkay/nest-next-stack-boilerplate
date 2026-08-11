"use client";
import { useState } from "react";
import { Toggle } from "@/components/ui/Toggle";

export function NotificationMuteTab() {
  const [muted, setMuted] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Notification Mute</h3>
        <div className="flex gap-2">
          <Toggle pressed={muted} onPressedChange={setMuted}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
              {muted && <line x1="3" x2="21" y1="3" y2="21" />}
            </svg>
            {muted ? "Muted" : "Mute"}
          </Toggle>
        </div>
        <div className="bg-surface border-border flex items-center justify-between rounded border px-3 py-2">
          <span className="text-sm">
            Status:{" "}
            <strong>
              {muted ? "Notifications muted" : "Notifications on"}
            </strong>
          </span>
          <button
            type="button"
            onClick={() => setMuted(false)}
            className="text-muted hover:text-fg p-0.5"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>
      </section>
    </div>
  );
}
