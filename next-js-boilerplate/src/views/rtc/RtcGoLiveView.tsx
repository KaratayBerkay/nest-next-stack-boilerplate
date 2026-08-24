"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { useStreamActions } from "@/api/client/rtc/streams-actions";
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

function RtcGoLiveForm() {
  const t = useMessages("rtc");
  const params = useParams<{ lang: string }>();
  const lang = params?.lang ?? "en";
  const router = useRouter();
  const { toast } = useToast();
  const realtime = useRealtime();
  const realtimeStatus = useRealtimeStatus();
  const { goLive, endStream } = useStreamActions();

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
      <div className="mx-auto flex w-full max-w-md flex-col gap-4 p-6">
        <h1 className="text-2xl font-semibold">{t.goLiveTitle}</h1>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t.streamTitlePlaceholder}
          aria-label={t.streamTitleLabel}
        />
        <Button onClick={handleGoLive} disabled={starting || !title.trim()}>
          {starting ? t.startingStream : t.goLive}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-[600px] w-full flex-col gap-4 p-4 lg:flex-row">
      <div className="flex flex-1 flex-col gap-3">
        <div className="flex items-center justify-between">
          <h1 className="truncate text-lg font-semibold">
            {live.stream.title}
          </h1>
          <span className="text-fg-muted text-sm">
            {t.viewerCount.replace("{count}", String(viewerCount))}
          </span>
        </div>

        <StreamPlayer
          videoTrack={livekit.videoTrack}
          screenShareTrack={livekit.screenShareTrack}
          audioTrack={null}
          broadcasterName={live.stream.broadcaster.name || ""}
          offlineLabel={t.connectingTitle}
        />

        <div className="flex items-center justify-center gap-3 pt-2">
          <IconButton
            variant="secondary"
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
            variant="secondary"
            icon={livekit.localCameraEnabled ? <IconVideo /> : <IconVideoOff />}
            label={livekit.localCameraEnabled ? t.cameraOff : t.cameraOn}
            onClick={livekit.toggleCamera}
          />
          <IconButton
            variant="secondary"
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

      <div className="flex w-full flex-col rounded-lg border lg:w-80">
        <div className="border-b px-3 py-2 text-sm font-medium">
          {t.chatTitle}
        </div>
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
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendChat();
            }}
            placeholder={t.chatPlaceholder}
            aria-label={t.chatTitle}
          />
          <Button size="sm" onClick={sendChat} disabled={!chatInput.trim()}>
            {t.send}
          </Button>
        </div>
      </div>
    </div>
  );
}
