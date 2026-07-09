"use client";

import type { MessagesErrorProps } from "@/types/messages/MessagesError-types";

export default function MessagesError({
  error,
  reset,
}: MessagesErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20">
      <p className="text-sm text-red-500">Failed to load messages</p>
      <p className="text-muted text-xs">{error.message}</p>
      <button
        onClick={reset}
        className="bg-surface hover:bg-surface-hover rounded px-3 py-1.5 text-xs"
      >
        Try again
      </button>
    </div>
  );
}
