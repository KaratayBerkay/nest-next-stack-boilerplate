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
  IconPlayerStop,
} from "@tabler/icons-react";
import { Button, IconButton } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Avatar } from "@/components/ui/Avatar";
import { useToast } from "@/components/ui/Toast";
import { TierGate } from "@/components/TierGate";
import { AccessDenied } from "@/components/AccessDenied";
import {
  useRealtime,
  useRealtimeStatus,
} from "@/lib/realtime/RealtimeProvider";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { useLiveKitStreamRoom } from "@/hooks/rtc/useLiveKitStreamRoom";
import { StreamPlayer } from "@/components/rtc/StreamPlayer";
import { RtcRecordingControl } from "@/components/rtc/RtcRecordingControl";
import { useStreamActions } from "@/api/client/rtc/streams-actions";
import { streamRecordingQueryOptions } from "@/api/client/rtc/streams-query";
import type { LiveStreamJoinResult } from "@/api/server/rtc/streams/types";

export function RtcGoLiveView() {
  const t = useMessages("rtc");
  return (
    <TierGate
      min="MEDIUM"
      fallback={
        <AccessDenied
          title={t.goLiveUpsellTitle}
          message={t.goLiveUpsellMessage}
          ctaLabel={t.upgradeButton}
        />
      }
    >
      <RtcGoLiveForm />
    </TierGate>
  );
}

interface ChatItem {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: string;
}

function BroadcasterChat({
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
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat.length]);

  return (
    <div className="flex h-full flex-col rounded-r-lg bg-neutral-900">
      <div className="border-b border-neutral-700 px-4 py-3">
        <h2 className="text-sm font-semibold text-white">Stream Chat</h2>
      </div>
      <div className="flex-1 space-y-0.5 overflow-y-auto px-4 py-2">
        {chat.length === 0 ? (
          <p className="py-8 text-center text-sm text-neutral-500">
            {t.noChatMessages}
          </p>
        ) : (
          chat.map((m) => (
            <div key={m.id} className="py-1 text-sm leading-snug">
              <span className="font-semibold text-white">{m.senderName}</span>
              <span className="ml-1.5 text-neutral-300">{m.text}</span>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
      <div className="border-t border-neutral-700 p-3">
        <div className="flex gap-2">
          <Input
            value={chatInput}
            onChange={(e) => onChatInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSendChat();
            }}
            placeholder={t.chatPlaceholder}
            aria-label={t.chatTitle}
            className="border-neutral-600 bg-neutral-800 text-white placeholder:text-neutral-500"
          />
          <Button size="sm" onClick={onSendChat} disabled={!chatInput.trim()}>
            {t.send}
          </Button>
        </div>
      </div>
    </div>
  );
}

function RtcGoLiveForm() {
  const t = useMessages("rtc");
  const params = useParams<{ lang: string }>();
  const lang = params?.lang ?? "en";
  const router = useRouter();
  const { toast } = useToast();
  const realtime = useRealtime();
  const realtimeStatus = useRealtimeStatus();
  const { goLive, endStream, startRecording, stopRecording } =
    useStreamActions();

  const [title, setTitle] = useState("");
  const [starting, setStarting] = useState(false);
  const [live, setLive] = useState<LiveStreamJoinResult | null>(null);
  const [viewerCount, setViewerCount] = useState(0);
  const [chat, setChat] = useState<ChatItem[]>([]);

  const handleGoLive = async () => {
    if (!title.trim()) return;
    setStarting(true);
    try {
      const result = await goLive(title.trim());
      setLive(result);
      setViewerCount(result.stream.viewerCount);
    } catch (err) {
      toast({
        title: err instanceof Error ? err.message : "Failed to go live",
        variant: "destructive",
      });
    } finally {
      setStarting(false);
    }
  };

  const slug = live?.stream.slug ?? "";

  const { data: recording, refetch: refetchRecording } = useQuery(
    streamRecordingQueryOptions(slug, Boolean(slug)),
  );

  useEffect(() => {
    if (!realtime || realtimeStatus !== "open" || !slug) return;
    realtime.send({ type: "rtc:join-room-chat", slug });
    return () => {
      realtime.send({ type: "rtc:leave-room-chat", slug });
    };
  }, [realtime, realtimeStatus, slug]);

  useEffect(() => {
    if (!realtime || !slug) return;
    const unsubscribers = [
      realtime.subscribe("rtc:chat-message", (data) => {
        if (data.slug !== slug || !data.message) return;
        setChat((prev) => [...prev, data.message as ChatItem]);
      }),
      realtime.subscribe("rtc:stream-viewer-joined", (data) => {
        if (data.slug !== slug) return;
        setViewerCount(Number(data.viewerCount ?? 0));
      }),
      realtime.subscribe("rtc:stream-viewer-left", (data) => {
        if (data.slug !== slug) return;
        setViewerCount(Number(data.viewerCount ?? 0));
      }),
    ];
    return () => unsubscribers.forEach((unsub) => unsub());
  }, [realtime, slug]);

  const livekit = useLiveKitStreamRoom(
    live?.token ?? null,
    live?.stream.broadcaster.id ?? "",
    true,
  );

  const [chatInput, setChatInput] = useState("");
  const sendChat = useCallback(() => {
    const text = chatInput.trim();
    if (!text || !realtime || !slug) return;
    realtime.send({ type: "rtc:chat-message", slug, text });
    setChatInput("");
  }, [chatInput, realtime, slug]);

  const handleEnd = async () => {
    if (!slug) return;
    await endStream(slug);
    router.push(`/v1/${lang}/rtc/live`);
  };

  if (!live) {
    return (
      <div className="flex h-full items-center justify-center bg-neutral-950 p-6">
        <div className="flex w-full max-w-md flex-col gap-4 rounded-lg border border-neutral-800 bg-neutral-900 p-6">
          <h1 className="text-2xl font-semibold text-white">{t.goLiveTitle}</h1>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t.streamTitlePlaceholder}
            aria-label={t.streamTitleLabel}
            className="border-neutral-600 bg-neutral-800 text-white placeholder:text-neutral-500"
          />
          <Button onClick={handleGoLive} disabled={starting || !title.trim()}>
            {starting ? t.startingStream : t.goLive}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-neutral-950">
      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-1 flex-col overflow-y-auto">
          <div className="relative">
            <StreamPlayer
              videoTrack={livekit.videoTrack}
              screenShareTrack={livekit.screenShareTrack}
              audioTrack={null}
              broadcasterName={live.stream.broadcaster.name || ""}
              offlineLabel={t.connectingTitle}
              isLive
            />

            <div className="absolute right-0 bottom-0 left-0 flex items-center justify-center gap-2 bg-neutral-900/80 px-4 py-3 backdrop-blur-sm">
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
                variant={
                  livekit.localCameraEnabled ? "secondary" : "destructive"
                }
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
              <ConfirmDialog
                title={t.endStream}
                description={t.endStreamConfirm}
                confirmLabel={t.endStream}
                cancelLabel={t.cancel}
                onConfirm={handleEnd}
              >
                {(open) => (
                  <IconButton
                    variant="destructive"
                    icon={<IconPlayerStop />}
                    label={t.endStream}
                    onClick={open}
                  />
                )}
              </ConfirmDialog>
            </div>
          </div>

          <div className="border-b border-neutral-800 px-4 py-3">
            <div className="flex items-start gap-3">
              <Avatar
                fallback={live.stream.broadcaster.name || "?"}
                size="md"
              />
              <div className="min-w-0 flex-1">
                <h1 className="truncate text-base font-semibold text-white">
                  {live.stream.title}
                </h1>
                <p className="mt-0.5 truncate text-sm text-neutral-400">
                  {live.stream.broadcaster.name}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-neutral-400">
                  {t.viewerCount.replace("{count}", String(viewerCount))}
                </span>
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
            </div>
          </div>
        </div>

        <div className="w-80 flex-shrink-0">
          <BroadcasterChat
            chat={chat}
            chatInput={chatInput}
            onChatInputChange={setChatInput}
            onSendChat={sendChat}
            t={t}
          />
        </div>
      </div>
    </div>
  );
}
