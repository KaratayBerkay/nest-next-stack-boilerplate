"use client";

import { useEffect, useRef } from "react";
import { IconMicrophoneOff } from "@tabler/icons-react";
import type { Track } from "livekit-client";
import { Avatar } from "@/components/ui/Avatar";

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
}: {
  videoTrack: Track | null;
  screenShareTrack: Track | null;
  audioTrack: Track | null;
  broadcasterName: string;
  offlineLabel: string;
}) {
  const activeVideoTrack = screenShareTrack ?? videoTrack;
  const videoRef = useTrackAttach(activeVideoTrack, "video");
  const audioRef = useTrackAttach(audioTrack, "audio");

  return (
    <div className="bg-surface relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg">
      {activeVideoTrack ? (
        // eslint-disable-next-line jsx-a11y/media-has-caption -- live stream video, no caption track exists
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="h-full w-full object-contain"
        />
      ) : (
        <div className="flex flex-col items-center gap-2">
          <Avatar fallback={broadcasterName || "?"} size="xl" />
          <span className="text-fg-muted text-sm">{offlineLabel}</span>
        </div>
      )}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption -- live stream audio, no caption track exists */}
      <audio ref={audioRef} autoPlay />

      {activeVideoTrack && !audioTrack && (
        <div className="bg-overlay/60 text-bg absolute right-2 bottom-2 rounded p-1.5">
          <IconMicrophoneOff size={16} aria-hidden />
        </div>
      )}
    </div>
  );
}
