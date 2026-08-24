"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PulseBlockFallback } from "@/fallbacks";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/hooks/useAuth";
import {
  useRealtime,
  useRealtimeStatus,
} from "@/lib/realtime/RealtimeProvider";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { useLiveKitStreamRoom } from "@/hooks/rtc/useLiveKitStreamRoom";
import { StreamPlayer } from "@/components/rtc/StreamPlayer";
import { streamChatQueryOptions } from "@/api/client/rtc/streams-query";
import { useStreamActions } from "@/api/client/rtc/streams-actions";
import type { LiveStreamJoinResult } from "@/api/server/rtc/streams/types";

interface ChatItem {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: string;
}

export function RtcLiveViewerView() {
  const t = useMessages("rtc");
  const params = useParams<{ lang: string; slug: string }>();
  const lang = params?.lang ?? "en";
  const slug = params?.slug ?? "";
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const realtime = useRealtime();
  const realtimeStatus = useRealtimeStatus();
  const { joinStream, leaveStream } = useStreamActions();

  const [phase, setPhase] = useState<
    "joining" | "active" | "ended" | "not-found" | "own-stream"
  >("joining");
  const [join, setJoin] = useState<LiveStreamJoinResult | null>(null);
  const [viewerCount, setViewerCount] = useState(0);
  const [chat, setChat] = useState<ChatItem[]>([]);
  const [chatInput, setChatInput] = useState("");
  const seededChat = useRef(false);

  const { data: chatHistory } = useQuery(
    streamChatQueryOptions(phase === "active" ? slug : ""),
  );

  useEffect(() => {
    if (!chatHistory || seededChat.current) return;
    seededChat.current = true;
    setChat([...chatHistory.messages].reverse());
  }, [chatHistory]);

  useEffect(() => {
    let cancelled = false;
    void joinStream(slug)
      .then((result) => {
        if (cancelled) return;
        if (result.stream.broadcaster.id === user?.id) {
          setPhase("own-stream");
          return;
        }
        setJoin(result);
        setViewerCount(result.stream.viewerCount);
        setPhase("active");
      })
      .catch((err) => {
        if (cancelled) return;
        const status = (err as { exception?: { statusCode?: number } })
          .exception?.statusCode;
        setPhase(status === 404 ? "not-found" : "ended");
        toast({
          title: err instanceof Error ? err.message : "Failed to join stream",
          variant: "destructive",
        });
      });
    return () => {
      cancelled = true;
    };
  }, [slug, joinStream, toast, user?.id]);

  useEffect(() => {
    return () => {
      void leaveStream(slug);
    };
  }, [slug, leaveStream]);

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
      realtime.subscribe("rtc:stream-ended", (data) => {
        if (data.slug !== slug) return;
        setPhase("ended");
        toast({ title: t.streamEndedNotice });
      }),
    ];
    return () => unsubscribers.forEach((unsub) => unsub());
  }, [realtime, slug, toast, t.streamEndedNotice]);

  const livekit = useLiveKitStreamRoom(
    phase === "active" ? (join?.token ?? null) : null,
    join?.stream.broadcaster.id ?? "",
    false,
  );

  const sendChat = useCallback(() => {
    const text = chatInput.trim();
    if (!text || !realtime) return;
    realtime.send({ type: "rtc:chat-message", slug, text });
    setChatInput("");
  }, [chatInput, realtime, slug]);

  const handleLeave = () => {
    void leaveStream(slug);
    router.push(`/v1/${lang}/rtc/live`);
  };

  if (phase === "joining") {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <PulseBlockFallback />
        <span className="text-fg-muted ml-3">{t.joiningStream}</span>
      </div>
    );
  }

  if (phase === "own-stream") {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-6">
        <p className="text-fg-muted">{t.ownStreamNotice}</p>
        <Button onClick={() => router.push(`/v1/${lang}/rtc/live/go-live`)}>
          {t.manageStream}
        </Button>
      </div>
    );
  }

  if (phase === "not-found" || phase === "ended") {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-6">
        <p className="text-fg-muted">
          {phase === "not-found" ? t.streamNotFound : t.streamEndedNotice}
        </p>
        <Button onClick={() => router.push(`/v1/${lang}/rtc/live`)}>
          {t.backToLive}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-[600px] w-full flex-col gap-4 p-4 lg:flex-row">
      <div className="flex flex-1 flex-col gap-3">
        <div className="flex items-center justify-between">
          <h1 className="truncate text-lg font-semibold">
            {join?.stream.title}
          </h1>
          <span className="text-fg-muted text-sm">
            {t.viewerCount.replace("{count}", String(viewerCount))}
          </span>
        </div>

        <StreamPlayer
          videoTrack={livekit.videoTrack}
          screenShareTrack={livekit.screenShareTrack}
          audioTrack={livekit.audioTrack}
          broadcasterName={join?.stream.broadcaster.name || ""}
          offlineLabel={t.broadcasterOffline}
        />

        <div className="flex items-center justify-center pt-2">
          <Button variant="ghost" onClick={handleLeave}>
            {t.leaveStream}
          </Button>
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
