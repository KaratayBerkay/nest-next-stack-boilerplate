"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import {
  IconPhoneIncoming,
  IconPhoneOutgoing,
  IconVideo,
  IconPhone,
} from "@tabler/icons-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { PulseBlockFallback } from "@/fallbacks";
import { callHistoryQueryOptions } from "@/api/client/rtc/query";
import type { CallHistoryEntry } from "@/api/server/rtc/call-history";
import { getRelativeTime } from "@/lib/date-time";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { useRtcCall } from "@/lib/rtc/RtcCallProvider";

const STATE_KEY: Record<
  string,
  | "stateEnded"
  | "stateRejected"
  | "stateCancelled"
  | "stateMissed"
  | "stateFailed"
> = {
  ENDED: "stateEnded",
  REJECTED: "stateRejected",
  CANCELLED: "stateCancelled",
  MISSED: "stateMissed",
  FAILED: "stateFailed",
};

function CallRow({ call }: { call: CallHistoryEntry }) {
  const t = useMessages("rtc");
  const { state, startCall } = useRtcCall();
  const DirectionIcon =
    call.direction === "incoming" ? IconPhoneIncoming : IconPhoneOutgoing;
  const stateKey = STATE_KEY[call.state] ?? "stateEnded";

  return (
    <div className="flex items-center gap-3 border-b px-2 py-3 last:border-b-0">
      <Avatar
        src={call.peer.avatarUrl ?? undefined}
        fallback={call.peer.name || "?"}
        size="md"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{call.peer.name}</p>
        <div className="text-fg-muted flex items-center gap-1.5 text-xs">
          <DirectionIcon size={14} aria-hidden />
          {call.hasVideo && <IconVideo size={14} aria-hidden />}
          <span>{t[stateKey]}</span>
          <span aria-hidden>·</span>
          <span>{getRelativeTime(call.ringingAt)}</span>
        </div>
      </div>
      <Button
        size="icon-sm"
        variant="ghost"
        disabled={state.phase !== "idle"}
        onClick={() => startCall(call.peer, call.hasVideo)}
        aria-label={call.hasVideo ? t.videoCallButton : t.callButton}
      >
        <IconPhone size={16} />
      </Button>
    </div>
  );
}

export function RtcCallHistoryView() {
  const t = useMessages("rtc");
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useInfiniteQuery(callHistoryQueryOptions());

  const calls = data?.pages.flatMap((page) => page.calls) ?? [];

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">{t.historyTitle}</h1>

      {isLoading ? (
        <PulseBlockFallback />
      ) : calls.length === 0 ? (
        <p className="text-fg-muted text-sm">{t.noCallHistory}</p>
      ) : (
        <div className="rounded-lg border">
          {calls.map((call) => (
            <CallRow key={call.id} call={call} />
          ))}
        </div>
      )}

      {hasNextPage && (
        <Button
          variant="outline"
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
        >
          {isFetchingNextPage ? "…" : t.loadMore}
        </Button>
      )}
    </div>
  );
}
