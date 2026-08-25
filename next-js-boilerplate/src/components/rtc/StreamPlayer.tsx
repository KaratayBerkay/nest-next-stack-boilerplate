"use client";

import { useEffect, useRef } from "react";
import { IconMicrophoneOff, IconVolume } from "@tabler/icons-react";
import type { Track } from "livekit-client";
import { Avatar } from "@/components/ui/Avatar";
import type { StreamPlayerProps } from "@/types/rtc/StreamPlayer-types";

function useTrackAttach(track: Track | null, kind: "video" | "audio") {
  const ref = useRef<HTMLVideoElement & HTMLAudioElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!track || !el) return;
    track.attach(el);
    return () => {
      track.detach(el);
    };
  }, [track, kind]);
  return ref;
}

export function StreamPlayer({
  videoTrack,
  screenShareTrack,
  audioTrack,
  broadcasterName,
  offlineLabel,
  isLive = false,
}: StreamPlayerProps) {
  const activeVideoTrack = screenShareTrack ?? videoTrack;
  const videoRef = useTrackAttach(activeVideoTrack, "video");
  const audioRef = useTrackAttach(audioTrack, "audio");

  return (
    <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-t-lg bg-black">
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
          <span className="text-sm text-neutral-400">{offlineLabel}</span>
        </div>
      )}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption -- live stream audio, no caption track exists */}
      <audio ref={audioRef} autoPlay />

      {isLive && (
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className="rounded bg-red-600 px-1.5 py-0.5 text-xs font-bold tracking-wide text-white uppercase">
            Live
          </span>
        </div>
      )}

      {activeVideoTrack && !audioTrack && (
        <div className="absolute right-3 bottom-3 flex items-center gap-1 rounded bg-black/60 px-2 py-1 text-neutral-400">
          <IconVolume size={14} aria-hidden />
          <IconMicrophoneOff size={14} aria-hidden />
        </div>
      )}
    </div>
  );
}
