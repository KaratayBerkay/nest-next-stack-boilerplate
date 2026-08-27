"use client";

import { useEffect, useRef } from "react";
import type { Track } from "livekit-client";

/**
 * Attaches a LiveKit track to a media element for its lifetime — each tile /
 * player owns its own ref + attach/detach pair (hook returns that never mix
 * refs with reactive state stay react-compiler-safe).
 *
 * Extracted from the identical copies in StreamPlayer and
 * MeetingParticipantTile.
 */
export function useTrackAttach(track: Track | null, kind: "video" | "audio") {
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
