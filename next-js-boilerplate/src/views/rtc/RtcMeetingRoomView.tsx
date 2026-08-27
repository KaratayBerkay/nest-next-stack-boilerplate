"use client";

import { useEffect, useState } from "react";
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
} from "@tabler/icons-react";
import { Button, IconButton } from "@/components/ui/Button";
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

function VideoGrid({
  participants,
  youLabel,
}: {
  participants: MeetingParticipantView[];
  youLabel: string;
}) {
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
    <div className={`grid flex-1 gap-2 ${cols} auto-rows-fr p-2`}>
      {participants.map((p) => (
        <MeetingParticipantTile
          key={p.identity}
          participant={p}
          youLabel={youLabel}
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
  t,
}: {
  chat: RoomChatMessage[];
  chatInput: string;
  onChatInputChange: (v: string) => void;
  onSendChat: () => void;
  t: RtcMessages;
}) {
  // Keeps the pane pinned to the newest message while the reader is at the
  // bottom — this panel previously had no auto-scroll at all, so incoming
  // messages piled up below the fold invisibly.
  const { bottomRef } = useAutoScroll(chat);

  return (
    <>
      <div className="flex-1 space-y-2 overflow-y-auto p-3">
        {chat.length === 0 ? (
          <p className="text-muted text-sm">{t.noChatMessages}</p>
        ) : (
          chat.map((m) => (
            <div key={m.id} className="text-sm">
              <span className="font-medium">{m.senderName}: </span>
              <span>{m.text}</span>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
      <div className="flex gap-2 border-t p-2">
        <Input
          value={chatInput}
          onChange={(e) => onChatInputChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSendChat();
          }}
          placeholder={t.chatPlaceholder}
          aria-label={t.chatTitle}
        />
        <Button size="sm" onClick={onSendChat} disabled={!chatInput.trim()}>
          {t.send}
        </Button>
      </div>
    </>
  );
}

function PeoplePanel({
  participants,
  isHost,
  slug,
  youLabel,
  muteParticipant,
  removeParticipant,
  t,
}: {
  participants: { identity: string; isLocal: boolean; name: string }[];
  isHost: boolean;
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
    <div className="flex-1 space-y-1 overflow-y-auto p-3">
      {participants.map((p) => (
        <div
          key={p.identity}
          className="flex items-center justify-between text-sm"
        >
          <span className="truncate">{p.isLocal ? youLabel : p.name}</span>
          {isHost && !p.isLocal && (
            <span className="flex gap-1">
              <IconButton
                size="icon-sm"
                variant="ghost"
                icon={<IconMuteAction size={14} />}
                label={t.muteParticipant}
                onClick={() =>
                  void muteParticipant(slug, p.identity, true).catch((error) =>
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
              <IconButton
                size="icon-sm"
                variant="ghost"
                icon={<IconUserX size={14} />}
                label={t.removeParticipant}
                onClick={() =>
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
              />
            </span>
          )}
        </div>
      ))}
    </div>
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
    "joining" | "active" | "ended" | "removed" | "not-found"
  >("joining");
  const [join, setJoin] = useState<JoinMeetingResult | null>(null);
  const [sidebar, setSidebar] = useState<"chat" | "people" | null>(null);

  const { data: chatHistory } = useQuery(meetingChatQueryOptions(slug));
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
        setPhase(status === 404 ? "not-found" : "ended");
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

  if (phase === "joining") {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <PulseBlockFallback />
        <span className="text-muted ml-3">{t.joiningMeeting}</span>
      </div>
    );
  }

  if (phase === "not-found" || phase === "ended" || phase === "removed") {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-6">
        <p className="text-muted">
          {phase === "not-found"
            ? t.meetingNotFound
            : phase === "removed"
              ? t.meetingRemovedNotice
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
      <div className="flex flex-1 overflow-hidden">
        <div className="relative flex flex-1 flex-col">
          <VideoGrid
            participants={livekit.participants}
            youLabel={t.youLabel}
          />

          <div className="bg-surface/80 absolute right-0 bottom-0 left-0 flex items-center justify-center gap-2 border-t px-4 py-3 backdrop-blur-sm sm:gap-3">
            <IconButton
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
              variant={livekit.localCameraEnabled ? "secondary" : "destructive"}
              icon={
                livekit.localCameraEnabled ? <IconVideo /> : <IconVideoOff />
              }
              label={livekit.localCameraEnabled ? t.cameraOff : t.cameraOn}
              onClick={livekit.toggleCamera}
            />
            <IconButton
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
            <div className="bg-border mx-1 h-6 w-px" />
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
                  variant="secondary"
                  icon={<IconUserPlus />}
                  label={t.inviteToMeeting}
                  onClick={open}
                />
              )}
            </RtcInviteDialog>
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
                  variant="secondary"
                  icon={<IconFlag />}
                  label={t.reportTitle}
                  onClick={open}
                />
              )}
            </RtcReportDialog>
            <IconButton
              variant={sidebar === "chat" ? "primary" : "secondary"}
              icon={<IconMessageCircle />}
              label={t.chatTitle}
              onClick={() => toggleSidebar("chat")}
            />
            <IconButton
              variant={sidebar === "people" ? "primary" : "secondary"}
              icon={<IconUsers />}
              label={`${t.participantsTitle} (${livekit.participants.length})`}
              onClick={() => toggleSidebar("people")}
            />
            <div className="bg-border mx-1 h-6 w-px" />
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
                    variant="destructive"
                    icon={<IconPhoneOff />}
                    label={t.endMeeting}
                    onClick={open}
                  />
                )}
              </ConfirmDialog>
            ) : (
              <IconButton
                variant="destructive"
                icon={<IconPhoneOff />}
                label={t.leaveMeeting}
                onClick={handleLeave}
              />
            )}
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

        {sidebar && (
          <div className="flex w-80 flex-col border-l">
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
                t={t}
              />
            ) : (
              <PeoplePanel
                participants={livekit.participants}
                isHost={isHost}
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
