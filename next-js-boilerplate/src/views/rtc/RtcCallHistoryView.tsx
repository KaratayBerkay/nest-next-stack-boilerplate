"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import {
  IconPhoneIncoming,
  IconPhoneOutgoing,
  IconVideo,
  IconPhone,
  IconFlag,
} from "@tabler/icons-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button, IconButton } from "@/components/ui/Button";
import {
  participantInitials,
  participantPalette,
} from "@/lib/rtc/participant-color";
import { PulseBlockFallback } from "@/fallbacks";
import { RtcReportDialog } from "@/components/rtc/RtcReportDialog";
import { callHistoryQueryOptions } from "@/api/client/rtc/query";
import { useCallActions } from "@/api/client/rtc/calls-actions";
import type { CallHistoryEntry } from "@/api/server/rtc/call-history";
import { getRelativeTime, formatDurationShort } from "@/lib/date-time";
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
  const { reportCall } = useCallActions();
  const DirectionIcon =
    call.direction === "incoming" ? IconPhoneIncoming : IconPhoneOutgoing;
  const stateKey = STATE_KEY[call.state] ?? "stateEnded";
  const isMissed = call.state === "MISSED" && call.direction === "incoming";
  const palette = participantPalette(call.peer.id || call.peer.name);
  const talked =
    call.state === "ENDED" && call.acceptedAt && call.endedAt
      ? formatDurationShort(call.acceptedAt, call.endedAt)
      : null;

  return (
    <div className="hover:bg-surface-hover/50 flex items-center gap-3 border-b px-3 py-3 transition-colors last:border-b-0">
      <Avatar
        src={call.peer.avatarUrl ?? undefined}
        fallback={participantInitials(call.peer.name || "?")}
        size="md"
        style={{ background: palette.fill, color: palette.onFill }}
      />
      <div className="min-w-0 flex-1">
        <p
          className={`truncate text-sm font-medium ${isMissed ? "text-error" : ""}`}
        >
          {call.peer.name}
        </p>
        <div
          className={`mt-0.5 flex items-center gap-1.5 text-xs ${isMissed ? "text-error" : "text-muted"}`}
        >
          <DirectionIcon size={13} aria-hidden />
          {call.hasVideo && <IconVideo size={13} aria-hidden />}
          <span>{t[stateKey]}</span>
          {talked && (
            <>
              <span aria-hidden>·</span>
              <span>{talked}</span>
            </>
          )}
          <span aria-hidden>·</span>
          <span>{getRelativeTime(call.ringingAt)}</span>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <RtcReportDialog
          onSubmit={(reason, details) => reportCall(call.id, reason, details)}
        >
          {(open) => (
            <IconButton
              size="icon-sm"
              variant="ghost"
              icon={<IconFlag size={16} />}
              label={t.reportTitle}
              onClick={open}
            />
          )}
        </RtcReportDialog>
        <IconButton
          size="icon"
          variant="secondary"
          disabled={state.phase !== "idle"}
          onClick={() => startCall(call.peer, false)}
          icon={<IconPhone size={18} />}
          label={t.callButton}
        />
        <IconButton
          size="icon"
          variant="secondary"
          disabled={state.phase !== "idle"}
          onClick={() => startCall(call.peer, true)}
          icon={<IconVideo size={18} />}
          label={t.videoCallButton}
        />
      </div>
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
        <p className="text-muted text-sm">{t.noCallHistory}</p>
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
