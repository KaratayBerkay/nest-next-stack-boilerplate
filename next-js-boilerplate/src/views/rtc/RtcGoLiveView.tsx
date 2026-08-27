"use client";

import { useState } from "react";
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
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { useLiveKitStreamRoom } from "@/hooks/rtc/useLiveKitStreamRoom";
import { useRoomChat } from "@/hooks/rtc/useRoomChat";
import { useStreamViewerCount } from "@/hooks/rtc/useStreamViewerCount";
import { StreamPlayer } from "@/components/rtc/StreamPlayer";
import { StreamChatPanel } from "@/components/rtc/StreamChatPanel";
import { RtcRecordingControl } from "@/components/rtc/RtcRecordingControl";
import { useStreamActions } from "@/api/client/rtc/streams-actions";
import {
  streamChatQueryOptions,
  streamRecordingQueryOptions,
} from "@/api/client/rtc/streams-query";
import type { LiveStreamJoinResult } from "@/api/server/rtc/streams/types";
import { logRtcEvent } from "@/lib/rtc/rtc-telemetry";

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

function RtcGoLiveForm() {
  const t = useMessages("rtc");
  const params = useParams<{ lang: string }>();
  const lang = params?.lang ?? "en";
  const router = useRouter();
  const { toast } = useToast();
  const { goLive, endStream, startRecording, stopRecording } =
    useStreamActions();

  const [title, setTitle] = useState("");
  const [starting, setStarting] = useState(false);
  const [live, setLive] = useState<LiveStreamJoinResult | null>(null);

  const handleGoLive = async () => {
    if (!title.trim()) return;
    setStarting(true);
    try {
      const result = await goLive(title.trim());
      setLive(result);
    } catch (err) {
      logRtcEvent({
        event: "stream.start_failed",
        rtcKind: "stream",
        exceptionType: "CLIENT_REQUEST_ERROR",
        error: err,
        phase: "starting",
      });
      toast({
        title: err instanceof Error ? err.message : t.goLiveFailed,
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

  const { data: chatHistory } = useQuery(streamChatQueryOptions(slug));
  const { chat, chatInput, setChatInput, sendChat } = useRoomChat(
    slug,
    Boolean(slug),
    chatHistory,
  );
  const viewerCount = useStreamViewerCount(slug, live?.stream.viewerCount ?? 0);

  const livekit = useLiveKitStreamRoom(
    live?.token ?? null,
    live?.stream.broadcaster.id ?? "",
    true,
    slug,
    live?.roomName,
  );

  const handleEnd = async () => {
    if (!slug) return;
    try {
      await endStream(slug);
      router.push(`/v1/${lang}/rtc/live`);
    } catch (error) {
      logRtcEvent({
        event: "stream.end_failed",
        rtcKind: "stream",
        rtcId: slug,
        exceptionType: "CLIENT_REQUEST_ERROR",
        error,
        phase: "active",
      });
      toast({
        title: error instanceof Error ? error.message : t.endStreamFailed,
        variant: "destructive",
      });
    }
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
              liveLabel={t.liveBadge}
              isLive
              showNoAudioIndicator={false}
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
                    try {
                      await startRecording(slug);
                      await refetchRecording();
                    } catch (error) {
                      logRtcEvent({
                        event: "stream.recording_start_failed",
                        rtcKind: "stream",
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
                        event: "stream.recording_stop_failed",
                        rtcKind: "stream",
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
