"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { IconFlag } from "@tabler/icons-react";
import { Button, IconButton } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { PulseBlockFallback } from "@/fallbacks";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/hooks/useAuth";
import { useRealtime } from "@/lib/realtime/RealtimeProvider";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { useLiveKitStreamRoom } from "@/hooks/rtc/useLiveKitStreamRoom";
import { useRoomChat } from "@/hooks/rtc/useRoomChat";
import { useStreamViewerCount } from "@/hooks/rtc/useStreamViewerCount";
import { StreamPlayer } from "@/components/rtc/StreamPlayer";
import { StreamChatPanel } from "@/components/rtc/StreamChatPanel";
import { RtcReportDialog } from "@/components/rtc/RtcReportDialog";
import { streamChatQueryOptions } from "@/api/client/rtc/streams-query";
import { useStreamActions } from "@/api/client/rtc/streams-actions";
import type { LiveStreamJoinResult } from "@/api/server/rtc/streams/types";
import { logRtcEvent } from "@/lib/rtc/rtc-telemetry";

export function RtcLiveViewerView() {
  const t = useMessages("rtc");
  const params = useParams<{ lang: string; slug: string }>();
  const lang = params?.lang ?? "en";
  const slug = params?.slug ?? "";
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const realtime = useRealtime();
  const { joinStream, leaveStream, reportStream } = useStreamActions();

  const [phase, setPhase] = useState<
    "joining" | "active" | "ended" | "not-found" | "own-stream"
  >("joining");
  const [join, setJoin] = useState<LiveStreamJoinResult | null>(null);

  const { data: chatHistory } = useQuery(
    streamChatQueryOptions(phase === "active" ? slug : ""),
  );
  const { chat, chatInput, setChatInput, sendChat } = useRoomChat(
    slug,
    phase === "active",
    chatHistory,
  );
  const viewerCount = useStreamViewerCount(slug, join?.stream.viewerCount ?? 0);

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
        setPhase("active");
      })
      .catch((err) => {
        if (cancelled) return;
        logRtcEvent({
          event: "stream.join_failed",
          rtcKind: "stream",
          rtcId: slug,
          exceptionType: "CLIENT_REQUEST_ERROR",
          error: err,
          phase: "joining",
        });
        const status = (err as { exception?: { statusCode?: number } })
          .exception?.statusCode;
        setPhase(status === 404 ? "not-found" : "ended");
        toast({
          title: err instanceof Error ? err.message : t.joinStreamFailed,
          variant: "destructive",
        });
      });
    return () => {
      cancelled = true;
    };
  }, [slug, joinStream, toast, user?.id, t.joinStreamFailed]);

  useEffect(() => {
    return () => {
      void leaveStream(slug).catch((error) =>
        logRtcEvent({
          event: "stream.leave_failed",
          rtcKind: "stream",
          rtcId: slug,
          exceptionType: "CLIENT_REQUEST_ERROR",
          error,
          phase: "unmount",
        }),
      );
    };
  }, [slug, leaveStream]);

  useEffect(() => {
    if (!realtime) return;
    return realtime.subscribe("rtc:stream-ended", (data) => {
      if (data.slug !== slug) return;
      setPhase("ended");
      toast({ title: t.streamEndedNotice });
    });
  }, [realtime, slug, toast, t.streamEndedNotice]);

  const livekit = useLiveKitStreamRoom(
    phase === "active" ? (join?.token ?? null) : null,
    join?.stream.broadcaster.id ?? "",
    false,
    slug,
    join?.roomName,
  );

  const handleLeave = () => {
    // Navigating away unmounts this view, and the unmount cleanup above
    // already sends leaveStream — calling it here too sent every manual
    // leave twice.
    router.push(`/v1/${lang}/rtc/live`);
  };

  if (phase === "joining") {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <PulseBlockFallback />
        <span className="text-muted ml-3">{t.joiningStream}</span>
      </div>
    );
  }

  if (phase === "own-stream") {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-6">
        <p className="text-muted">{t.ownStreamNotice}</p>
        <Button onClick={() => router.push(`/v1/${lang}/rtc/live/go-live`)}>
          {t.manageStream}
        </Button>
      </div>
    );
  }

  if (phase === "not-found" || phase === "ended") {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-6">
        <p className="text-muted">
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
            liveLabel={t.liveBadge}
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
                    ).catch((error) => {
                      logRtcEvent({
                        event: "stream.report_failed",
                        rtcKind: "stream",
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
          <StreamChatPanel
            title={t.streamChatTitle}
            chat={chat}
            chatInput={chatInput}
            onChatInputChange={setChatInput}
            onSendChat={sendChat}
            emptyLabel={t.noChatMessages}
            placeholder={t.chatPlaceholder}
            inputLabel={t.chatTitle}
            sendLabel={t.send}
          />
        </div>
      </div>
    </div>
  );
}
