"use client";

import { useEffect } from "react";

/**
 * Screen Wake Lock for active RTC sessions (1:1 calls, meetings, streams) —
 * prevents the OS from sleeping the screen and throttling the tab while
 * `active` is true. Re-acquires on visibility change because the browser
 * auto-releases the sentinel whenever the page is backgrounded.
 *
 * Extracted from the three identical copies that lived in useLiveKitRoom,
 * useLiveKitMeetingRoom, and useLiveKitStreamRoom.
 */
export function useWakeLock(active: boolean) {
  useEffect(() => {
    if (!active) return;

    const wakeLockRef: { current: WakeLockSentinel | null } = { current: null };

    const acquire = async () => {
      try {
        if (!("wakeLock" in navigator)) return;
        // Re-entrant: browser may auto-release on visibility change.
        if (wakeLockRef.current) return;
        const sentinel = await navigator.wakeLock.request("screen");
        wakeLockRef.current = sentinel;
        sentinel.addEventListener("release", () => {
          wakeLockRef.current = null;
        });
      } catch {
        // Wake Lock denied (permission policy, headless browser, etc.) —
        // non-fatal, the session still works without it.
      }
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") acquire();
    };

    void acquire();
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      void wakeLockRef.current?.release();
      wakeLockRef.current = null;
    };
  }, [active]);
}
