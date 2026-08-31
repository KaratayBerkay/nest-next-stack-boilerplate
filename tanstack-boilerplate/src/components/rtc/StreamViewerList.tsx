"use client";

import { Avatar } from "@/components/ui/Avatar";
import type { StreamViewerView } from "@/api/server/rtc/streams/types";

interface StreamViewerListProps {
  title: string;
  viewers: StreamViewerView[];
  emptyLabel: string;
}

/**
 * Watcher list section stacked above StreamChatPanel in the stream sidebar —
 * same dark neutral chrome as the chat (the streaming pages' committed
 * Twitch-style look, independent of the app theme). Height is capped with
 * its own scroll so a busy audience can't squeeze the chat out of the
 * column.
 */
export function StreamViewerList({
  title,
  viewers,
  emptyLabel,
}: StreamViewerListProps) {
  return (
    <div className="flex max-h-64 flex-shrink-0 flex-col border-b border-neutral-700 bg-neutral-900">
      <div className="flex items-center justify-between px-4 py-3">
        <h2 className="text-sm font-semibold text-white">{title}</h2>
        <span className="rounded-full bg-neutral-800 px-2 py-0.5 text-xs font-medium text-neutral-300">
          {viewers.length}
        </span>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
        {viewers.length === 0 ? (
          <p className="px-2 pb-2 text-center text-sm text-neutral-500">
            {emptyLabel}
          </p>
        ) : (
          <ul className="space-y-0.5">
            {viewers.map((viewer) => (
              <li
                key={viewer.userId}
                className="flex items-center gap-2.5 rounded px-2 py-1"
              >
                <Avatar
                  src={viewer.avatarUrl ?? undefined}
                  fallback={viewer.name || "?"}
                  size="xs"
                />
                <span className="truncate text-sm text-neutral-200">
                  {viewer.name}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
