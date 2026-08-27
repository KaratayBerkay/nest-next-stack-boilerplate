"use client";

import { IconMicrophoneOff, IconVolume } from "@tabler/icons-react";
import { Avatar } from "@/components/ui/Avatar";
import { useTrackAttach } from "@/hooks/rtc/useTrackAttach";
import type { StreamPlayerProps } from "@/types/rtc/StreamPlayer-types";

// The player canvas is deliberately a fixed dark stage in every theme (video
// chrome, Twitch-style) — but painted with the overlay tokens (black scrim +
// near-white text in all seven themes) rather than hardcoded palette colors.
export function StreamPlayer({
  videoTrack,
  screenShareTrack,
  audioTrack,
  broadcasterName,
  offlineLabel,
  liveLabel,
  isLive = false,
  showNoAudioIndicator = true,
}: StreamPlayerProps) {
  const activeVideoTrack = screenShareTrack ?? videoTrack;
  const videoRef = useTrackAttach(activeVideoTrack, "video");
  const audioRef = useTrackAttach(audioTrack, "audio");

  return (
    <div className="bg-overlay relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-t-lg">
      {activeVideoTrack ? (
        // eslint-disable-next-line jsx-a11y/media-has-caption -- live stream video, no caption track exists
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="h-full w-full object-contain"
        />
      ) : (
        <div className="flex flex-col items-center gap-3">
          <Avatar fallback={broadcasterName || "?"} size="xl" />
          <span className="text-overlay-fg/70 text-sm">{offlineLabel}</span>
        </div>
      )}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption -- live stream audio, no caption track exists */}
      <audio ref={audioRef} autoPlay />

      {isLive && liveLabel && (
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className="bg-error text-error-fg rounded px-1.5 py-0.5 text-xs font-bold tracking-wide uppercase">
            {liveLabel}
          </span>
        </div>
      )}

      {showNoAudioIndicator && activeVideoTrack && !audioTrack && (
        <div className="bg-overlay/60 text-overlay-fg/70 absolute right-3 bottom-3 flex items-center gap-1 rounded px-2 py-1">
          <IconVolume size={14} aria-hidden />
          <IconMicrophoneOff size={14} aria-hidden />
        </div>
      )}
    </div>
  );
}
