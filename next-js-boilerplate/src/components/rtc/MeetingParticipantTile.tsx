"use client";

import { IconMicrophoneOff, IconScreenShare } from "@tabler/icons-react";
import { Avatar } from "@/components/ui/Avatar";
import { useTrackAttach } from "@/hooks/rtc/useTrackAttach";
import type { MeetingParticipantTileProps } from "@/types/rtc/MeetingParticipantTile-types";

export function MeetingParticipantTile({
  participant,
  youLabel,
}: MeetingParticipantTileProps) {
  const activeVideoTrack =
    participant.screenShareTrack ?? participant.videoTrack;
  const videoRef = useTrackAttach(activeVideoTrack, "video");
  const audioRef = useTrackAttach(
    participant.isLocal ? null : participant.audioTrack,
    "audio",
  );
  const showVideo = Boolean(activeVideoTrack) && participant.cameraEnabled;

  return (
    <div
      className={`bg-surface relative flex aspect-video items-center justify-center overflow-hidden rounded-lg transition-shadow ${
        participant.isSpeaking
          ? "ring-success shadow-md ring-2"
          : "ring-1 ring-transparent"
      }`}
    >
      {showVideo ? (
        // eslint-disable-next-line jsx-a11y/media-has-caption -- live meeting video, no caption track exists
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={participant.isLocal}
          className="h-full w-full object-cover"
        />
      ) : (
        <Avatar fallback={participant.name || "?"} size="lg" />
      )}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption -- live meeting audio, no caption track exists */}
      <audio ref={audioRef} autoPlay />

      <div className="bg-overlay/60 text-overlay-fg absolute right-2 bottom-2 left-2 flex items-center justify-between rounded px-2 py-1 text-xs">
        <span className="truncate">
          {participant.isLocal ? youLabel : participant.name}
        </span>
        <span className="flex items-center gap-1">
          {participant.screenShareTrack && (
            <IconScreenShare size={14} aria-hidden />
          )}
          {!participant.micEnabled && (
            <IconMicrophoneOff size={14} aria-hidden />
          )}
        </span>
      </div>
    </div>
  );
}
