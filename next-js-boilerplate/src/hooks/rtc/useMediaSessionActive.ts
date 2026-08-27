"use client";

import { useEffect } from "react";

/**
 * Media Session marker for active RTC sessions — tells the OS this tab is
 * playing live media (no JS throttle, no WebSocket dormancy, foreground
 * priority) and labels the lock-screen / media-hub entry.
 *
 * Extracted from the three near-identical copies that lived in
 * useLiveKitRoom, useLiveKitMeetingRoom, and useLiveKitStreamRoom.
 */
export function useMediaSessionActive(
  active: boolean,
  title: string | (() => string),
  artist: string,
) {
  useEffect(() => {
    if (!active || !("mediaSession" in navigator)) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      // A function title is resolved inside the effect (callers memoize it on
      // whatever state should refresh the label, e.g. the peer joining).
      title: typeof title === "function" ? title() : title,
      artist,
      artwork: [],
    });
    // Indicate the session is "playing" so the OS treats it as active media.
    navigator.mediaSession.playbackState = "playing";

    return () => {
      navigator.mediaSession.metadata = null;
      navigator.mediaSession.playbackState = "none";
    };
  }, [active, title, artist]);
}
