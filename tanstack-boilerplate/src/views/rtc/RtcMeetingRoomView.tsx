"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  IconMicrophone,
  IconMicrophoneOff,
  IconVideo,
  IconVideoOff,
  IconScreenShare,
  IconScreenShareOff,
  IconPhoneOff,
  IconMicrophoneOff as IconMuteAction,
  IconUserX,
  IconUserPlus,
  IconFlag,
  IconMessageCircle,
  IconUsers,
  IconX,
  IconSend,
  IconCopy,
} from "@tabler/icons-react";
import { Button, IconButton } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { PulseBlockFallback } from "@/fallbacks";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/hooks/useAuth";
import { useAutoScroll } from "@/hooks/useAutoScroll";
import { useRealtime } from "@/lib/realtime/RealtimeProvider";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { I18nMessages } from "@/generated/i18n-messages";
import {
  useLiveKitMeetingRoom,
  type MeetingParticipantView,
} from "@/hooks/rtc/useLiveKitMeetingRoom";
import { useRoomChat, type RoomChatMessage } from "@/hooks/rtc/useRoomChat";
import { MeetingParticipantTile } from "@/components/rtc/MeetingParticipantTile";
import { formatCallTimer } from "@/components/rtc/RtcCallOverlay";
import { ChatLinkCard } from "@/components/ChatLinkCard";
import { extractLinks } from "@/lib/chat/link-preview";
import {
  participantInitials,
  participantPalette,
} from "@/lib/rtc/participant-color";
import { formatTimeShort } from "@/lib/date-time";
import { RtcInviteDialog } from "@/components/rtc/RtcInviteDialog";
import { RtcReportDialog } from "@/components/rtc/RtcReportDialog";
import { RtcRecordingControl } from "@/components/rtc/RtcRecordingControl";
import {
  meetingChatQueryOptions,
  meetingRecordingQueryOptions,
} from "@/api/client/rtc/meetings-query";
import { useMeetingActions } from "@/api/client/rtc/meetings-actions";
import type { JoinMeetingResult } from "@/api/server/rtc/meetings/types";
import { logRtcEvent } from "@/lib/rtc/rtc-telemetry";

type RtcMessages = I18nMessages["rtc"];

/** Grid of equal tiles, or — when a participant is focused — a Meet-style
 *  spotlight: the focused person fills the stage and everyone else shrinks
 *  into a horizontal filmstrip below. Clicking a tile focuses it; clicking
 *  the spotlighted tile exits focus. */
function VideoStage({
  participants,
  youLabel,
  focusedIdentity,
  onFocusChange,
  t,
}: {
  participants: MeetingParticipantView[];
  youLabel: string;
  focusedIdentity: string | null;
  onFocusChange: (identity: string | null) => void;
  t: RtcMessages;
}) {
  // Derived, never trusted from state alone: if the focused participant left
  // the meeting, fall back to the grid instead of a blank spotlight.
  const focused =
    participants.find((p) => p.identity === focusedIdentity) ?? null;

  if (focused) {
    const others = participants.filter((p) => p.identity !== focused.identity);
    return (
      <div className="flex min-h-0 flex-1 flex-col gap-2 p-2">
        <div className="min-h-0 flex-1">
          <MeetingParticipantTile
            participant={focused}
            youLabel={youLabel}
            onClick={() => onFocusChange(null)}
            clickLabel={t.unfocusParticipant}
          />
        </div>
        {others.length > 0 && (
          <div className="flex h-20 shrink-0 gap-2 overflow-x-auto sm:h-24">
            {others.map((p) => (
              <div key={p.identity} className="aspect-video h-full shrink-0">
                <MeetingParticipantTile
                  participant={p}
                  youLabel={youLabel}
                  onClick={() => onFocusChange(p.identity)}
                  clickLabel={t.focusParticipant}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  const count = participants.length;
  const cols =
    count <= 1
      ? "grid-cols-1"
      : count <= 2
        ? "grid-cols-1 sm:grid-cols-2"
        : count <= 4
          ? "grid-cols-2"
          : count <= 6
            ? "grid-cols-2 lg:grid-cols-3"
            : "grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

  return (
    <div
      className={`grid min-h-0 flex-1 gap-2 ${cols} auto-rows-fr overflow-hidden p-2`}
    >
      {participants.map((p) => (
        <MeetingParticipantTile
          key={p.identity}
          participant={p}
          youLabel={youLabel}
          onClick={() => onFocusChange(p.identity)}
          clickLabel={t.focusParticipant}
        />
      ))}
    </div>
  );
}

function ChatPanel({
  chat,
  chatInput,
  onChatInputChange,
  onSendChat,
  myId,
  t,
}: {
  chat: RoomChatMessage[];
  chatInput: string;
  onChatInputChange: (v: string) => void;
  onSendChat: () => void;
  myId: string | undefined;
  t: RtcMessages;
}) {
  // Keeps the pane pinned to the newest message while the reader is at the
  // bottom — this panel previously had no auto-scroll at all, so incoming
  // messages piled up below the fold invisibly.
  const { bottomRef } = useAutoScroll(chat);

  return (
    <>
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {chat.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2">
            <IconMessageCircle className="text-muted size-8" aria-hidden />
            <p className="text-muted text-sm">{t.noChatMessages}</p>
          </div>
        ) : (
          chat.map((m) => {
            const isMe = m.senderId === myId;
            const palette = participantPalette(m.senderId);
            return (
              <div
                key={m.id}
                className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : ""}`}
              >
                {!isMe && (
                  <span
                    aria-hidden
                    className="mb-4 flex size-7 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold"
                    style={{ background: palette.fill, color: palette.onFill }}
                  >
                    {participantInitials(m.senderName)}
                  </span>
                )}
                <div
                  className={`flex max-w-[75%] min-w-0 flex-col gap-0.5 ${isMe ? "items-end" : "items-start"}`}
                >
                  {!isMe && (
                    <span className="text-muted px-1 text-[10px] font-medium">
                      {m.senderName}
                    </span>
                  )}
                  <div
                    className={`rounded-2xl px-3 py-2 text-sm leading-relaxed break-words ${
                      isMe
                        ? "bg-brand text-brand-fg rounded-br-md"
                        : "bg-bg text-fg rounded-bl-md border"
                    }`}
                  >
                    {m.text}
                  </div>
                  {extractLinks(m.text).map((link) => (
                    <ChatLinkCard
                      key={link.url}
                      url={link.url}
                      clickable={link.clickable}
                    />
                  ))}
                  <span className="text-muted px-1 text-[10px]">
                    {formatTimeShort(m.createdAt)}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>
      <div className="flex gap-2 border-t p-3">
        <Input
          value={chatInput}
          onChange={(e) => onChatInputChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSendChat();
          }}
          placeholder={t.chatPlaceholder}
          aria-label={t.chatTitle}
        />
        <IconButton
          variant="primary"
          icon={<IconSend size={16} />}
          label={t.send}
          onClick={onSendChat}
          disabled={!chatInput.trim()}
        />
      </div>
    </>
  );
}

function PeoplePanel({
  participants,
  isHost,
  hostId,
  slug,
  youLabel,
  muteParticipant,
  removeParticipant,
  t,
}: {
  participants: MeetingParticipantView[];
  isHost: boolean;
  hostId: string | null;
  slug: string;
  youLabel: string;
  muteParticipant: (
    slug: string,
    userId: string,
    mute: boolean,
  ) => Promise<unknown>;
  removeParticipant: (slug: string, userId: string) => Promise<unknown>;
  t: RtcMessages;
}) {
  return (
    <div className="flex-1 space-y-2 overflow-y-auto p-3">
      {participants.map((p) => {
        const palette = participantPalette(p.identity);
        return (
          <div
            key={p.identity}
            className="border-border bg-bg flex items-center gap-3 rounded-lg border p-2.5 shadow-xs"
          >
            <span
              aria-hidden
              className="flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
              style={{
                background: palette.fill,
                color: palette.onFill,
                boxShadow: p.isSpeaking
                  ? `0 0 0 2px ${palette.ring}`
                  : undefined,
              }}
            >
              {participantInitials(p.name)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 text-sm font-medium">
                <span className="truncate">
                  {p.isLocal ? youLabel : p.name}
                </span>
                {hostId !== null && p.identity === hostId && (
                  <Badge variant="secondary">{t.hostLabel}</Badge>
                )}
              </p>
              <p
                className={`mt-0.5 flex items-center gap-1 text-xs ${
                  p.micEnabled ? "text-muted" : "text-error"
                }`}
              >
                {p.micEnabled ? (
                  <IconMicrophone size={12} aria-hidden />
                ) : (
                  <IconMicrophoneOff size={12} aria-hidden />
                )}
                {p.micEnabled ? t.micOnStatus : t.micOffStatus}
              </p>
            </div>
            {isHost && !p.isLocal && (
              <span className="flex shrink-0 gap-1.5">
                <IconButton
                  size="icon"
                  variant="secondary"
                  icon={<IconMuteAction size={18} />}
                  label={t.muteParticipant}
                  disabled={!p.micEnabled}
                  onClick={() =>
                    void muteParticipant(slug, p.identity, true).catch(
                      (error) =>
                        logRtcEvent({
                          event: "meeting.participant_mute_failed",
                          rtcKind: "meeting",
                          rtcId: slug,
                          exceptionType: "CLIENT_REQUEST_ERROR",
                          error,
                          metadata: { participantId: p.identity },
                        }),
                    )
                  }
                />
                <ConfirmDialog
                  title={t.removeParticipant}
                  description={t.removeParticipantConfirm.replace(
                    "{name}",
                    p.name,
                  )}
                  confirmLabel={t.removeParticipant}
                  cancelLabel={t.cancel}
                  onConfirm={() =>
                    void removeParticipant(slug, p.identity).catch((error) =>
                      logRtcEvent({
                        event: "meeting.participant_remove_failed",
                        rtcKind: "meeting",
                        rtcId: slug,
                        exceptionType: "CLIENT_REQUEST_ERROR",
                        error,
                        metadata: { participantId: p.identity },
                      }),
                    )
                  }
                >
                  {(openRemove) => (
                    <IconButton
                      size="icon"
                      variant="destructive"
                      icon={<IconUserX size={18} />}
                      label={t.removeParticipant}
                      onClick={openRemove}
                    />
                  )}
                </ConfirmDialog>
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

/** Meeting counterpart of the 1:1 call's "elapsed / limit" readout — the
 *  backend sweep force-ends the meeting at maxDurationMinutes after
 *  room.startedAt, so this counts against the same server clock. Isolated
 *  in its own component so the 1s tick doesn't rerender the video grid. */
function MeetingTimer({
  startedAt,
  maxDurationMinutes,
  label,
}: {
  startedAt: string | null;
  maxDurationMinutes: number | null;
  label: string;
}) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!startedAt) return;
    const startMs = new Date(startedAt).getTime();
    const tick = () =>
      setElapsedSeconds(Math.max(0, Math.floor((Date.now() - startMs) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  if (!startedAt) return null;

  const remaining =
    maxDurationMinutes != null
      ? maxDurationMinutes * 60 - elapsedSeconds
      : null;
  const urgencyClasses =
    remaining != null && remaining <= 60
      ? "border-error text-error"
      : remaining != null && remaining <= 300
        ? "border-warning text-warning"
        : "border-border text-fg";

  return (
    <span
      aria-label={label}
      className={`bg-surface/80 rounded-full border px-3 py-1 text-xs font-medium tabular-nums shadow-xs backdrop-blur-sm ${urgencyClasses}`}
    >
      {formatCallTimer(elapsedSeconds, maxDurationMinutes)}
    </span>
  );
}

export function RtcMeetingRoomView() {
  const t = useMessages("rtc");
  const params = useParams<{ lang: string; slug: string }>();
  const lang = params?.lang ?? "en";
  const slug = params?.slug ?? "";
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const realtime = useRealtime();
  const {
    joinMeeting,
    leaveMeeting,
    endMeeting,
    muteParticipant,
    removeParticipant,
    inviteToMeeting,
    reportMeeting,
    startRecording,
    stopRecording,
  } = useMeetingActions();

  const [phase, setPhase] = useState<
    "joining" | "active" | "ended" | "removed" | "not-found" | "join-failed"
  >("joining");
  // Set when LiveKit kicked this connection because the same user joined
  // again from another window/device. The superseded tab must NOT send
  // leaveMeeting on unmount — the newest join owns the participant row,
  // and a late leave from here would stamp leftAt while they're still in.
  const supersededRef = useRef(false);
  const [join, setJoin] = useState<JoinMeetingResult | null>(null);
  const [sidebar, setSidebar] = useState<"chat" | "people" | null>(null);
  // Identity of the spotlighted participant; null = equal grid. The stage
  // falls back to the grid on its own if this participant leaves.
  const [focusedIdentity, setFocusedIdentity] = useState<string | null>(null);

  // Gated on the join having landed (same trick the stream viewer uses):
  // the history endpoint 403s until this user's participant row exists, so
  // fetching at mount made every FIRST-time join race its own chat seed.
  const { data: chatHistory } = useQuery(
    meetingChatQueryOptions(phase === "active" ? slug : ""),
  );
  const { chat, chatInput, setChatInput, sendChat } = useRoomChat(
    slug,
    phase === "active",
    chatHistory,
  );

  useEffect(() => {
    let cancelled = false;
    void joinMeeting(slug)
      .then((result) => {
        if (cancelled) return;
        setJoin(result);
        setPhase("active");
      })
      .catch((err) => {
        if (cancelled) return;
        logRtcEvent({
          event: "meeting.join_failed",
          rtcKind: "meeting",
          rtcId: slug,
          exceptionType: "CLIENT_REQUEST_ERROR",
          error: err,
          phase: "joining",
        });
        const status = (err as { exception?: { statusCode?: number } })
          .exception?.statusCode;
        // Only a 404 means the meeting is genuinely gone/over. Any other
        // failure (500, capacity 403, network) previously rendered the
        // "meeting has ended" screen, which is a lie — show a join-failure
        // screen instead so the user knows a retry can work.
        setPhase(status === 404 ? "not-found" : "join-failed");
        toast({
          title: err instanceof Error ? err.message : t.joinMeetingFailed,
          variant: "destructive",
        });
      });
    return () => {
      cancelled = true;
    };
  }, [slug, joinMeeting, toast, t.joinMeetingFailed]);

  useEffect(() => {
    return () => {
      if (supersededRef.current) return;
      void leaveMeeting(slug).catch((error) =>
        logRtcEvent({
          event: "meeting.leave_failed",
          rtcKind: "meeting",
          rtcId: slug,
          exceptionType: "CLIENT_REQUEST_ERROR",
          error,
          phase: "unmount",
        }),
      );
    };
  }, [slug, leaveMeeting]);

  useEffect(() => {
    if (!realtime) return;
    const unsubscribers = [
      realtime.subscribe("rtc:meeting-participant-joined", (data) => {
        if (data.slug !== slug || data.userId === user?.id) return;
        toast({
          title: t.participantJoined.replace(
            "{name}",
            (data.name as string | undefined) ?? t.someone,
          ),
          variant: "info",
        });
      }),
      realtime.subscribe("rtc:meeting-ended", (data) => {
        if (data.slug !== slug) return;
        setPhase("ended");
        toast({ title: t.meetingEndedNotice });
      }),
      realtime.subscribe("rtc:meeting-removed", (data) => {
        if (data.slug !== slug) return;
        setPhase("removed");
        toast({ title: t.meetingRemovedNotice, variant: "destructive" });
      }),
      realtime.subscribe("rtc:meeting-limit-warning", (data) => {
        if (data.slug !== slug) return;
        toast({
          title: t.meetingLimitWarning.replace(
            "{seconds}",
            String(data.secondsRemaining ?? 60),
          ),
          variant: "warning",
        });
      }),
    ];
    return () => unsubscribers.forEach((unsub) => unsub());
  }, [
    realtime,
    slug,
    user?.id,
    toast,
    t.participantJoined,
    t.someone,
    t.meetingEndedNotice,
    t.meetingRemovedNotice,
    t.meetingLimitWarning,
  ]);

  const livekit = useLiveKitMeetingRoom(
    phase === "active" ? (join?.token ?? null) : null,
    slug,
    join?.roomName,
  );

  useEffect(() => {
    if (livekit.duplicateKicked) supersededRef.current = true;
  }, [livekit.duplicateKicked]);

  // Derived, not synced into state: the kick arrives from the LiveKit
  // event loop and the react-compiler lint rightly rejects a sync
  // setState-in-effect mirror of it.
  const effectivePhase: typeof phase | "elsewhere" = livekit.duplicateKicked
    ? "elsewhere"
    : phase;

  const isHost = join?.role === "HOST";

  const { data: recording, refetch: refetchRecording } = useQuery(
    meetingRecordingQueryOptions(slug, isHost && phase === "active"),
  );

  const handleLeave = () => {
    // Navigating away unmounts this view, and the unmount cleanup above
    // already sends leaveMeeting — calling it here too sent every manual
    // leave twice.
    router.push(`/v1/${lang}/rtc/meetings`);
  };

  const handleEnd = async () => {
    try {
      await endMeeting(slug);
      router.push(`/v1/${lang}/rtc/meetings`);
    } catch (error) {
      logRtcEvent({
        event: "meeting.end_failed",
        rtcKind: "meeting",
        rtcId: slug,
        exceptionType: "CLIENT_REQUEST_ERROR",
        error,
        phase: "active",
      });
      toast({
        title: error instanceof Error ? error.message : t.endMeetingFailed,
        variant: "destructive",
      });
    }
  };

  const toggleSidebar = (panel: "chat" | "people") => {
    setSidebar((prev) => (prev === panel ? null : panel));
  };

  const shareMeetingLink = () => {
    const url = `${window.location.origin}/v1/${lang}/rtc/meetings/${slug}`;
    navigator.clipboard
      .writeText(url)
      .then(() => toast({ title: t.linkCopied }))
      .catch(() => toast({ title: t.linkCopyFailed, variant: "destructive" }));
  };

  if (effectivePhase === "joining") {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <PulseBlockFallback />
        <span className="text-muted ml-3">{t.joiningMeeting}</span>
      </div>
    );
  }

  if (
    effectivePhase === "not-found" ||
    effectivePhase === "ended" ||
    effectivePhase === "removed" ||
    effectivePhase === "join-failed" ||
    effectivePhase === "elsewhere"
  ) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-6">
        <p className="text-muted">
          {effectivePhase === "not-found"
            ? t.meetingNotFound
            : effectivePhase === "removed"
              ? t.meetingRemovedNotice
              : effectivePhase === "join-failed"
                ? t.joinMeetingFailed
                : effectivePhase === "elsewhere"
                  ? t.meetingOpenedElsewhere
                  : t.meetingEndedNotice}
        </p>
        <Button onClick={() => router.push(`/v1/${lang}/rtc/meetings`)}>
          {t.backToMeetings}
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-surface flex h-full flex-col overflow-hidden">
      {/* relative: on phones the chat/people panel overlays this box
          full-screen instead of squeezing the video area into a sliver. */}
      <div className="relative flex flex-1 overflow-hidden">
        <div className="flex min-w-0 flex-1 flex-col">
          {/* The stage is its own relative box so the timer/recording chips
              overlay the video area only — the control bar sits BELOW in
              normal flow (it used to be absolutely positioned over the grid,
              which clipped the bottom tile row and, on phones, spilled its
              unwrappable buttons across the whole screen). */}
          <div className="relative flex min-h-0 flex-1 flex-col">
            <VideoStage
              participants={livekit.participants}
              youLabel={t.youLabel}
              focusedIdentity={focusedIdentity}
              onFocusChange={setFocusedIdentity}
              t={t}
            />

            <div className="absolute top-3 left-3">
              <MeetingTimer
                startedAt={join?.meeting.room.startedAt ?? null}
                maxDurationMinutes={join?.meeting.maxDurationMinutes ?? null}
                label={t.meetingTimerLabel}
              />
            </div>

            {isHost && (
              <div className="absolute top-3 right-3">
                <RtcRecordingControl
                  recording={recording}
                  onStart={async () => {
                    try {
                      await startRecording(slug);
                      await refetchRecording();
                    } catch (error) {
                      logRtcEvent({
                        event: "meeting.recording_start_failed",
                        rtcKind: "meeting",
                        rtcId: slug,
                        exceptionType: "CLIENT_REQUEST_ERROR",
                        error,
                        phase: "active",
                      });
                      throw error;
                    }
                  }}
                  onStop={async () => {
                    try {
                      await stopRecording(slug);
                      await refetchRecording();
                    } catch (error) {
                      logRtcEvent({
                        event: "meeting.recording_stop_failed",
                        rtcKind: "meeting",
                        rtcId: slug,
                        exceptionType: "CLIENT_REQUEST_ERROR",
                        error,
                        phase: "active",
                      });
                      throw error;
                    }
                  }}
                />
              </div>
            )}
          </div>

          <div className="bg-surface/80 flex flex-wrap items-center justify-center gap-2 border-t px-2 py-2.5 backdrop-blur-sm sm:gap-3 sm:px-4 sm:py-3.5">
            <IconButton
              size="icon-lg"
              variant={livekit.localMicEnabled ? "secondary" : "destructive"}
              icon={
                livekit.localMicEnabled ? (
                  <IconMicrophone />
                ) : (
                  <IconMicrophoneOff />
                )
              }
              label={livekit.localMicEnabled ? t.mute : t.unmute}
              onClick={livekit.toggleMic}
            />
            <IconButton
              size="icon-lg"
              variant={livekit.localCameraEnabled ? "secondary" : "destructive"}
              icon={
                livekit.localCameraEnabled ? <IconVideo /> : <IconVideoOff />
              }
              label={livekit.localCameraEnabled ? t.cameraOff : t.cameraOn}
              onClick={livekit.toggleCamera}
            />
            <IconButton
              size="icon-lg"
              variant={
                livekit.localScreenShareEnabled ? "destructive" : "secondary"
              }
              icon={
                livekit.localScreenShareEnabled ? (
                  <IconScreenShareOff />
                ) : (
                  <IconScreenShare />
                )
              }
              label={
                livekit.localScreenShareEnabled
                  ? t.screenShareOff
                  : t.screenShareOn
              }
              onClick={livekit.toggleScreenShare}
            />
            <div className="bg-border mx-1 hidden h-8 w-px sm:block" />
            <RtcInviteDialog
              onInvite={(userId) =>
                inviteToMeeting(slug, userId).catch((error) => {
                  logRtcEvent({
                    event: "meeting.invite_failed",
                    rtcKind: "meeting",
                    rtcId: slug,
                    exceptionType: "CLIENT_REQUEST_ERROR",
                    error,
                    metadata: { participantId: userId },
                  });
                  throw error;
                })
              }
            >
              {(open) => (
                <IconButton
                  size="icon-lg"
                  variant="secondary"
                  icon={<IconUserPlus />}
                  label={t.inviteToMeeting}
                  onClick={open}
                />
              )}
            </RtcInviteDialog>
            <IconButton
              size="icon-lg"
              variant="secondary"
              icon={<IconCopy />}
              label={t.shareMeeting}
              onClick={shareMeetingLink}
            />
            <RtcReportDialog
              onSubmit={(reason, details) =>
                reportMeeting(slug, reason, details).catch((error) => {
                  logRtcEvent({
                    event: "meeting.report_failed",
                    rtcKind: "meeting",
                    rtcId: slug,
                    exceptionType: "CLIENT_REQUEST_ERROR",
                    error,
                    metadata: { reason },
                  });
                  throw error;
                })
              }
            >
              {(open) => (
                <IconButton
                  size="icon-lg"
                  variant="secondary"
                  icon={<IconFlag />}
                  label={t.reportTitle}
                  onClick={open}
                />
              )}
            </RtcReportDialog>
            <IconButton
              size="icon-lg"
              variant={sidebar === "chat" ? "primary" : "secondary"}
              icon={<IconMessageCircle />}
              label={t.chatTitle}
              onClick={() => toggleSidebar("chat")}
            />
            <IconButton
              size="icon-lg"
              variant={sidebar === "people" ? "primary" : "secondary"}
              icon={<IconUsers />}
              label={`${t.participantsTitle} (${livekit.participants.length})`}
              onClick={() => toggleSidebar("people")}
            />
            <div className="bg-border mx-1 hidden h-8 w-px sm:block" />
            {isHost ? (
              <ConfirmDialog
                title={t.endMeeting}
                description={t.endMeetingConfirm}
                confirmLabel={t.endMeeting}
                cancelLabel={t.cancel}
                onConfirm={handleEnd}
              >
                {(open) => (
                  <IconButton
                    size="icon-lg"
                    variant="destructive"
                    icon={<IconPhoneOff />}
                    label={t.endMeeting}
                    onClick={open}
                  />
                )}
              </ConfirmDialog>
            ) : (
              <IconButton
                size="icon-lg"
                variant="destructive"
                icon={<IconPhoneOff />}
                label={t.leaveMeeting}
                onClick={handleLeave}
              />
            )}
          </div>
        </div>

        {sidebar && (
          <div
            className={`bg-surface flex flex-col border-l max-sm:absolute max-sm:inset-0 max-sm:z-20 max-sm:w-full max-sm:max-w-none max-sm:border-l-0 ${
              sidebar === "chat" ? "w-[min(40rem,85vw)]" : "w-96 max-w-[85vw]"
            }`}
          >
            <div className="flex items-center justify-between border-b px-3 py-2">
              <span className="text-sm font-medium">
                {sidebar === "chat" ? t.chatTitle : t.participantsTitle}
              </span>
              <IconButton
                variant="ghost"
                icon={<IconX size={16} />}
                label={t.close}
                onClick={() => setSidebar(null)}
              />
            </div>
            {sidebar === "chat" ? (
              <ChatPanel
                chat={chat}
                chatInput={chatInput}
                onChatInputChange={setChatInput}
                onSendChat={sendChat}
                myId={user?.id}
                t={t}
              />
            ) : (
              <PeoplePanel
                participants={livekit.participants}
                isHost={isHost}
                hostId={join?.meeting.host.id ?? null}
                slug={slug}
                youLabel={t.youLabel}
                muteParticipant={muteParticipant}
                removeParticipant={removeParticipant}
                t={t}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
