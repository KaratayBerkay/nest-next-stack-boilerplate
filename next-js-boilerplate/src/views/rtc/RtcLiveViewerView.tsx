"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { IconFlag } from "@tabler/icons-react";
import { Button, IconButton } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Avatar } from "@/components/ui/Avatar";
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
import { RtcReportDialog } from "@/components/rtc/RtcReportDialog";
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

function StreamChat({
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
  const { joinStream, leaveStream, reportStream } = useStreamActions();

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
    <div className="flex h-full flex-col overflow-hidden bg-neutral-950">
      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-1 flex-col overflow-y-auto">
          <StreamPlayer
            videoTrack={livekit.videoTrack}
            screenShareTrack={livekit.screenShareTrack}
            audioTrack={livekit.audioTrack}
            broadcasterName={join?.stream.broadcaster.name || ""}
            offlineLabel={t.broadcasterOffline}
            isLive
          />

          <div className="border-b border-neutral-800 px-4 py-3">
            <div className="flex items-start gap-3">
              <Avatar
                fallback={join?.stream.broadcaster.name || "?"}
                size="md"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="truncate text-base font-semibold text-white">
                    {join?.stream.title}
                  </h1>
                </div>
                <p className="mt-0.5 truncate text-sm text-neutral-400">
                  {join?.stream.broadcaster.name}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-neutral-400">
                  {t.viewerCount.replace("{count}", String(viewerCount))}
                </span>
                <RtcReportDialog
                  onSubmit={(reason, details) =>
                    reportStream(
                      slug,
                      reason,
                      details,
                      join?.stream.broadcaster.id,
                    )
                  }
                >
                  {(open) => (
                    <IconButton
                      variant="ghost"
                      icon={<IconFlag />}
                      label={t.reportTitle}
                      onClick={open}
                    />
                  )}
                </RtcReportDialog>
                <Button variant="ghost" size="sm" onClick={handleLeave}>
                  {t.leaveStream}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="w-80 flex-shrink-0">
          <StreamChat
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
