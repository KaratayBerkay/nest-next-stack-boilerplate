"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
import {
  useRealtime,
  useRealtimeStatus,
} from "@/lib/realtime/RealtimeProvider";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import {
  useLiveKitMeetingRoom,
  type MeetingParticipantView,
} from "@/hooks/rtc/useLiveKitMeetingRoom";
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

interface ChatItem {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: string;
}

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
  chat: ChatItem[];
  chatInput: string;
  onChatInputChange: (v: string) => void;
  onSendChat: () => void;
  t: Record<string, string>;
}) {
  return (
    <>
      <div className="flex-1 space-y-2 overflow-y-auto p-3">
        {chat.length === 0 ? (
          <p className="text-fg-muted text-sm">{t.noChatMessages}</p>
        ) : (
          chat.map((m) => (
            <div key={m.id} className="text-sm">
              <span className="font-medium">{m.senderName}: </span>
              <span>{m.text}</span>
            </div>
          ))
        )}
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
  muteParticipant: (slug: string, userId: string, mute: boolean) => void;
  removeParticipant: (slug: string, userId: string) => void;
  t: Record<string, string>;
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
                onClick={() => void muteParticipant(slug, p.identity, true)}
              />
              <IconButton
                size="icon-sm"
                variant="ghost"
                icon={<IconUserX size={14} />}
                label={t.removeParticipant}
                onClick={() => void removeParticipant(slug, p.identity)}
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
  const realtimeStatus = useRealtimeStatus();
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
  const [chat, setChat] = useState<ChatItem[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [sidebar, setSidebar] = useState<"chat" | "people" | null>(null);
  const seededChat = useRef(false);

  const { data: chatHistory } = useQuery(meetingChatQueryOptions(slug));

  useEffect(() => {
    if (!chatHistory || seededChat.current) return;
    seededChat.current = true;
    setChat([...chatHistory.messages].reverse());
  }, [chatHistory]);

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
        const status = (err as { exception?: { statusCode?: number } })
          .exception?.statusCode;
        setPhase(status === 404 ? "not-found" : "ended");
        toast({
          title: err instanceof Error ? err.message : "Failed to join meeting",
          variant: "destructive",
        });
      });
    return () => {
      cancelled = true;
    };
  }, [slug, joinMeeting, toast]);

  useEffect(() => {
    return () => {
      void leaveMeeting(slug);
    };
  }, [slug, leaveMeeting]);

  useEffect(() => {
    if (!realtime || realtimeStatus !== "open" || phase !== "active") return;
    realtime.send({ type: "rtc:join-room-chat", slug });
    return () => {
      realtime.send({ type: "rtc:leave-room-chat", slug });
    };
  }, [realtime, realtimeStatus, phase, slug]);

  useEffect(() => {
    if (!realtime) return;
    const unsubscribers = [
      realtime.subscribe("rtc:chat-message", (data) => {
        if (data.slug !== slug || !data.message) return;
        const m = data.message as ChatItem;
        setChat((prev) => [...prev, m]);
      }),
      realtime.subscribe("rtc:meeting-participant-joined", (data) => {
        if (data.slug !== slug || data.userId === user?.id) return;
        toast({ title: `${data.name ?? "Someone"} joined`, variant: "info" });
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
    t.meetingEndedNotice,
    t.meetingRemovedNotice,
    t.meetingLimitWarning,
  ]);

  const livekit = useLiveKitMeetingRoom(
    phase === "active" ? (join?.token ?? null) : null,
  );

  const sendChat = useCallback(() => {
    const text = chatInput.trim();
    if (!text || !realtime) return;
    realtime.send({ type: "rtc:chat-message", slug, text });
    setChatInput("");
  }, [chatInput, realtime, slug]);

  const isHost = join?.role === "HOST";

  const { data: recording, refetch: refetchRecording } = useQuery(
    meetingRecordingQueryOptions(slug, isHost && phase === "active"),
  );

  const handleLeave = () => {
    void leaveMeeting(slug);
    router.push(`/v1/${lang}/rtc/meetings`);
  };

  const handleEnd = async () => {
    await endMeeting(slug);
    router.push(`/v1/${lang}/rtc/meetings`);
  };

  const toggleSidebar = (panel: "chat" | "people") => {
    setSidebar((prev) => (prev === panel ? null : panel));
  };

  if (phase === "joining") {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <PulseBlockFallback />
        <span className="text-fg-muted ml-3">{t.joiningMeeting}</span>
      </div>
    );
  }

  if (phase === "not-found" || phase === "ended" || phase === "removed") {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-6">
        <p className="text-fg-muted">
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
            <div className="mx-1 h-6 w-px bg-gray-300" />
            <RtcInviteDialog
              onInvite={(userId) => inviteToMeeting(slug, userId)}
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
                reportMeeting(slug, reason, details)
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
            <div className="mx-1 h-6 w-px bg-gray-300" />
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
                  await startRecording(slug);
                  await refetchRecording();
                }}
                onStop={async () => {
                  await stopRecording(slug);
                  await refetchRecording();
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
                label="Close"
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
