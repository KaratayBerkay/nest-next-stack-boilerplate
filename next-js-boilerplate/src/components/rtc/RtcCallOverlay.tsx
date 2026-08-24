"use client";

import { useRef } from "react";
import {
  IconMicrophone,
  IconMicrophoneOff,
  IconPhoneOff,
  IconVideo,
  IconVideoOff,
} from "@tabler/icons-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button, IconButton } from "@/components/ui/Button";
import { Dialog, DialogContent } from "@/components/ui/Dialog";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { useRtcCall } from "@/lib/rtc/RtcCallProvider";
import { useLiveKitRoom } from "@/hooks/rtc/useLiveKitRoom";

/**
 * Global overlay for the whole 1:1-call lifecycle — incoming-ring dialog,
 * outgoing-ring/connecting screen, and the in-call video/audio + controls.
 * Mounted once in V1Shell (same level as RtcCallProvider/RealtimeProvider),
 * not per-page, so a call survives navigation and can be answered from any
 * screen — mirrors how MessageDropdown/presence use app-shell-wide realtime
 * state rather than a page-scoped subscription.
 */
export function RtcCallOverlay() {
  const t = useMessages("rtc");
  const { state, acceptCall, rejectCall, cancelCall, hangupCall } =
    useRtcCall();
  const isConnected = state.phase === "connected";
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const livekit = useLiveKitRoom(
    isConnected ? (state.livekit?.token ?? null) : null,
    state.hasVideo,
    { localVideoRef, remoteVideoRef, remoteAudioRef },
  );

  if (state.phase === "idle") return null;

  if (state.phase === "incoming-ringing") {
    return (
      <Dialog open onOpenChange={(open) => !open && rejectCall()}>
        <DialogContent size="sm">
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <Avatar
              src={state.peer?.avatarUrl ?? undefined}
              fallback={state.peer?.name || "?"}
              size="xl"
            />
            <div>
              <p className="text-fg-muted text-sm">
                {state.hasVideo
                  ? t.incomingVideoCallTitle
                  : t.incomingCallTitle}
              </p>
              <p className="text-lg font-semibold">{state.peer?.name}</p>
            </div>
            <div className="flex gap-3">
              <Button variant="destructive" onClick={rejectCall}>
                {t.decline}
              </Button>
              <Button variant="primary" onClick={acceptCall}>
                {t.accept}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const showVideo = isConnected && state.hasVideo;

  return (
    <div className="bg-overlay/95 fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 p-6">
      {showVideo ? (
        <div className="relative w-full max-w-2xl">
          {/* eslint-disable-next-line jsx-a11y/media-has-caption -- live P2P call video, no caption track exists */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="bg-surface aspect-video w-full rounded-lg object-cover"
          />
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="border-bg absolute right-3 bottom-3 aspect-video w-32 rounded-md border-2 object-cover"
          />
        </div>
      ) : (
        <Avatar
          src={state.peer?.avatarUrl ?? undefined}
          fallback={state.peer?.name || "?"}
          size="xl"
          className="size-24"
        />
      )}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption -- live P2P call audio, no caption track exists */}
      <audio ref={remoteAudioRef} autoPlay />

      <div className="text-bg text-center">
        <p className="text-lg font-semibold">{state.peer?.name}</p>
        <p className="text-sm opacity-80">
          {state.phase === "outgoing-ringing"
            ? t.callingTitle.replace("{name}", state.peer?.name || "")
            : !livekit.connected
              ? t.connectingTitle
              : null}
        </p>
        {state.warningSecondsRemaining != null && (
          <p className="text-warning mt-1 text-sm">
            {t.callLimitWarning.replace(
              "{seconds}",
              String(state.warningSecondsRemaining),
            )}
          </p>
        )}
      </div>

      <div className="flex items-center gap-4">
        {isConnected && (
          <>
            <IconButton
              variant="secondary"
              icon={
                livekit.micEnabled ? <IconMicrophone /> : <IconMicrophoneOff />
              }
              label={livekit.micEnabled ? t.mute : t.unmute}
              onClick={livekit.toggleMic}
            />
            {state.hasVideo && (
              <IconButton
                variant="secondary"
                icon={livekit.cameraEnabled ? <IconVideo /> : <IconVideoOff />}
                label={livekit.cameraEnabled ? t.cameraOff : t.cameraOn}
                onClick={livekit.toggleCamera}
              />
            )}
          </>
        )}
        <IconButton
          variant="destructive"
          icon={<IconPhoneOff />}
          label={isConnected ? t.hangup : t.cancel}
          onClick={isConnected ? hangupCall : cancelCall}
        />
      </div>
    </div>
  );
}
