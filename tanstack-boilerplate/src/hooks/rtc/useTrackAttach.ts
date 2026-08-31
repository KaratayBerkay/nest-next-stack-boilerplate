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
/**
 * `resetKey` forces a full detach/attach cycle when it changes even though
 * the Track object is the same reference. Needed for mute cycles: when a
 * remote camera mutes, the tile unmounts its <video> (avatar takes over);
 * on unmute the element remounts against the SAME track, and with
 * adaptiveStream the paused layer does not reliably resume for the
 * re-attached element — the tile stayed black until a page reload. Passing
 * the enabled-flags as resetKey re-runs the attach (and its visibility
 * recalculation) on every flip.
 */
export function useTrackAttach(
  track: Track | null,
  kind: "video" | "audio",
  resetKey?: unknown,
) {
  const ref = useRef<HTMLVideoElement & HTMLAudioElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!track || !el) return;
    track.attach(el);
    // Mobile browsers pause media elements while the page is hidden and
    // never resume them — the tile came back black until a manual reload.
    // attach() is re-entrant in livekit-client: on an already-attached
    // element it re-syncs srcObject and calls element.play() again, which
    // is exactly the un-pause nudge needed on return to the foreground.
    const reattach = () => {
      if (document.visibilityState !== "visible") return;
      const current = ref.current;
      if (current) track.attach(current);
    };
    document.addEventListener("visibilitychange", reattach);
    window.addEventListener("pageshow", reattach);
    return () => {
      document.removeEventListener("visibilitychange", reattach);
      window.removeEventListener("pageshow", reattach);
      track.detach(el);
    };
  }, [track, kind, resetKey]);
  return ref;
}
