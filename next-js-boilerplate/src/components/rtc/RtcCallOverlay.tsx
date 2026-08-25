"use client";

import { useEffect, useRef, useState } from "react";
import {
  IconMicrophone,
  IconMicrophoneOff,
  IconPhone,
  IconPhoneOff,
  IconVideo,
  IconVideoOff,
  IconSpeakerphone,
} from "@tabler/icons-react";
import { Avatar } from "@/components/ui/Avatar";
import { IconButton } from "@/components/ui/Button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { useRtcCall } from "@/lib/rtc/RtcCallProvider";
import { useLiveKitRoom } from "@/hooks/rtc/useLiveKitRoom";
import type {
  IncomingCallOverlayProps,
  ActiveCallOverlayProps,
} from "@/types/rtc/RtcCallOverlay-types";

function formatDuration(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function PulsingAvatar({
  avatarUrl,
  name,
}: {
  avatarUrl: string | null;
  name: string;
}) {
  return (
    <div className="relative flex items-center justify-center">
      <span className="bg-success/30 absolute size-36 animate-ping rounded-full" />
      <span className="bg-success/20 absolute size-32 animate-ping rounded-full [animation-delay:0.2s]" />
      <span className="bg-success/10 absolute size-28 animate-ping rounded-full [animation-delay:0.4s]" />
      <Avatar
        src={avatarUrl ?? undefined}
        fallback={name || "?"}
        size="xl"
        className="bg-brand/80 text-brand-fg ring-success/40 relative size-24 ring-4"
      />
    </div>
  );
}

function IncomingCallOverlay({
  peerName,
  peerAvatarUrl,
  hasVideo,
  onAccept,
  onDecline,
}: IncomingCallOverlayProps) {
  const t = useMessages("rtc");

  return (
    <div className="animate-fade-in fixed inset-0 z-[100] flex flex-col items-center justify-center gap-8 bg-gradient-to-b from-gray-900 via-gray-950 to-black">
      <div className="flex flex-col items-center gap-5">
        <PulsingAvatar avatarUrl={peerAvatarUrl} name={peerName} />
        <div className="text-center">
          <p className="text-success mb-1 text-sm font-medium">
            {hasVideo ? t.incomingVideoCallTitle : t.incomingCallTitle}
          </p>
          <p className="text-2xl font-semibold text-white">{peerName}</p>
        </div>
      </div>

      <div className="flex items-center gap-10">
        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={onDecline}
            className="bg-error hover:bg-error/80 flex size-16 items-center justify-center rounded-full shadow-lg transition-all active:scale-95"
          >
            <IconPhoneOff className="text-white" size={28} />
          </button>
          <span className="text-error-fg text-xs font-medium">{t.decline}</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={onAccept}
            className="bg-success hover:bg-success/80 flex size-16 items-center justify-center rounded-full shadow-lg transition-all active:scale-95"
          >
            <IconPhone className="text-white" size={28} />
          </button>
          <span className="text-success-fg text-xs font-medium">
            {t.accept}
          </span>
        </div>
      </div>
    </div>
  );
}

function ActiveCallOverlay({
  peerName,
  peerAvatarUrl,
  hasVideo,
  phase,
  micEnabled,
  cameraEnabled,
  speakerEnabled,
  livekitConnected,
  warningSecondsRemaining,
  remoteVideoRef,
  localVideoRef,
  remoteAudioRef,
  onToggleMic,
  onToggleCamera,
  onToggleSpeaker,
  onHangup,
}: ActiveCallOverlayProps) {
  const t = useMessages("rtc");
  const [duration, setDuration] = useState(0);
  const callStartRef = useRef<number>(0);

  useEffect(() => {
    if (phase !== "connected") return;
    callStartRef.current = Date.now();
    const id = setInterval(() => {
      setDuration(Math.floor((Date.now() - callStartRef.current) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [phase]);

  const isRinging = phase === "outgoing-ringing";
  const showVideo = phase === "connected" && hasVideo;

  const statusText = isRinging
    ? t.callingTitle.replace("{name}", peerName)
    : !livekitConnected
      ? t.connectingTitle
      : formatDuration(duration);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-gradient-to-b from-gray-900 via-gray-950 to-black">
      {showVideo ? (
        <div className="relative flex-1">
          {/* eslint-disable-next-line jsx-a11y/media-has-caption -- live P2P call video, no caption track exists */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />

          <div className="absolute top-0 right-0 left-0 flex items-center justify-between px-5 pt-4 pb-8">
            <p className="text-base font-semibold text-white drop-shadow-lg">
              {peerName}
            </p>
            <span className="rounded-full bg-black/40 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
              {statusText}
            </span>
          </div>

          <div className="absolute right-4 bottom-24">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="h-36 w-24 rounded-xl border-2 border-white/20 object-cover shadow-xl"
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6">
          {isRinging ? (
            <PulsingAvatar avatarUrl={peerAvatarUrl} name={peerName} />
          ) : (
            <Avatar
              src={peerAvatarUrl ?? undefined}
              fallback={peerName || "?"}
              size="xl"
              className="bg-brand/80 text-brand-fg size-28 ring-4 ring-white/10"
            />
          )}
          <div className="text-center">
            <p className="text-xl font-semibold text-white">{peerName}</p>
            <p className="mt-1 text-sm text-white/60">{statusText}</p>
          </div>
        </div>
      )}

      {/* eslint-disable-next-line jsx-a11y/media-has-caption -- live P2P call audio, no caption track exists */}
      <audio ref={remoteAudioRef} autoPlay />

      {warningSecondsRemaining != null && (
        <div className="mx-4 mb-2">
          <div className="bg-warning/15 border-warning/30 text-warning rounded-lg border px-4 py-2 text-center text-sm">
            {t.callLimitWarning.replace(
              "{seconds}",
              String(warningSecondsRemaining),
            )}
          </div>
        </div>
      )}

      <div className="bg-black/60 px-6 pt-4 pb-8 backdrop-blur-xl">
        <div className="flex items-center justify-center gap-6">
          {phase === "connected" && (
            <>
              <div className="flex flex-col items-center gap-1.5">
                <IconButton
                  variant={micEnabled ? "secondary" : "ghost"}
                  icon={micEnabled ? <IconMicrophone /> : <IconMicrophoneOff />}
                  label={micEnabled ? t.mute : t.unmute}
                  onClick={onToggleMic}
                  className={`size-12 rounded-full ${micEnabled ? "bg-white/15 text-white hover:bg-white/25" : "bg-error/80 hover:bg-error text-white"}`}
                />
                <span className="text-[10px] text-white/60">
                  {micEnabled ? t.mute : t.unmute}
                </span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <IconButton
                  variant="secondary"
                  icon={
                    speakerEnabled ? (
                      <IconSpeakerphone />
                    ) : (
                      <IconSpeakerphone className="opacity-50" />
                    )
                  }
                  label={speakerEnabled ? t.speakerOn : t.speakerOff}
                  onClick={onToggleSpeaker}
                  className={`size-12 rounded-full ${speakerEnabled ? "bg-white/15 text-white hover:bg-white/25" : "bg-white/10 text-white/50 hover:bg-white/20"}`}
                />
                <span className="text-[10px] text-white/60">
                  {speakerEnabled ? t.speakerOn : t.speakerOff}
                </span>
              </div>
              {hasVideo && (
                <div className="flex flex-col items-center gap-1.5">
                  <IconButton
                    variant="secondary"
                    icon={cameraEnabled ? <IconVideo /> : <IconVideoOff />}
                    label={cameraEnabled ? t.cameraOff : t.cameraOn}
                    onClick={onToggleCamera}
                    className={`size-12 rounded-full ${cameraEnabled ? "bg-white/15 text-white hover:bg-white/25" : "bg-error/80 hover:bg-error text-white"}`}
                  />
                  <span className="text-[10px] text-white/60">
                    {cameraEnabled ? t.cameraOff : t.cameraOn}
                  </span>
                </div>
              )}
            </>
          )}
          <div className="flex flex-col items-center gap-1.5">
            <button
              type="button"
              onClick={onHangup}
              className="bg-error hover:bg-error/80 flex size-14 items-center justify-center rounded-full shadow-lg transition-all active:scale-95"
            >
              <IconPhoneOff className="text-white" size={24} />
            </button>
            <span className="text-[10px] text-white/60">
              {phase === "connected" ? t.hangup : t.cancel}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Global overlay for the whole 1:1-call lifecycle — incoming-ring dialog,
 * outgoing-ring/connecting screen, and the in-call video/audio + controls.
 * Mounted once in V1Shell (same level as RtcCallProvider/RealtimeProvider),
 * not per-page, so a call survives navigation and can be answered from any
 * screen — mirrors how MessageDropdown/presence use app-shell-wide realtime
 * state rather than a page-scoped subscription.
 */
export function RtcCallOverlay() {
  const { state, acceptCall, rejectCall, cancelCall, hangupCall } =
    useRtcCall();
  const isConnected = state.phase === "connected";
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const [speakerEnabled, setSpeakerEnabled] = useState(true);
  const livekit = useLiveKitRoom(
    isConnected ? (state.livekit?.token ?? null) : null,
    state.hasVideo,
    { localVideoRef, remoteVideoRef, remoteAudioRef },
  );

  const handleToggleSpeaker = () => setSpeakerEnabled((s) => !s);

  if (state.phase === "idle") return null;

  if (state.phase === "incoming-ringing") {
    return (
      <IncomingCallOverlay
        peerName={state.peer?.name || "?"}
        peerAvatarUrl={state.peer?.avatarUrl ?? null}
        hasVideo={state.hasVideo}
        onAccept={acceptCall}
        onDecline={rejectCall}
      />
    );
  }

  return (
    <ActiveCallOverlay
      peerName={state.peer?.name || "?"}
      peerAvatarUrl={state.peer?.avatarUrl ?? null}
      hasVideo={state.hasVideo}
      phase={state.phase}
      micEnabled={livekit.micEnabled}
      cameraEnabled={livekit.cameraEnabled}
      speakerEnabled={speakerEnabled}
      remoteConnected={livekit.remoteConnected}
      livekitConnected={livekit.connected}
      warningSecondsRemaining={state.warningSecondsRemaining}
      remoteVideoRef={remoteVideoRef}
      localVideoRef={localVideoRef}
      remoteAudioRef={remoteAudioRef}
      onToggleMic={livekit.toggleMic}
      onToggleCamera={livekit.toggleCamera}
      onToggleSpeaker={handleToggleSpeaker}
      onHangup={isConnected ? hangupCall : cancelCall}
    />
  );
}
