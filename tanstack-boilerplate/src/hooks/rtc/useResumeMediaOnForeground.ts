"use client";

import { useEffect } from "react";
import type { RefObject } from "react";
import type { Room } from "livekit-client";

/**
 * Mobile browsers (iOS Safari especially) pause every media element — and may
 * suspend WebRTC playback entirely — while the page is backgrounded. Nothing
 * un-pauses them when the user comes back, so remote tiles stay black until a
 * manual reload. When the page returns to the foreground (visibilitychange /
 * pageshow), nudge the SDK: startVideo()/startAudio() replay every attached
 * media element, and onResume lets each room hook rebuild its participant
 * snapshot so tracks that changed while hidden are re-rendered.
 *
 * Shared by useLiveKitRoom (1:1 calls), useLiveKitMeetingRoom, and
 * useLiveKitStreamRoom.
 */
export function useResumeMediaOnForeground(
  roomRef: RefObject<Room | null>,
  connected: boolean,
  onResume?: () => void,
) {
  useEffect(() => {
    if (!connected) return;
    const resume = () => {
      if (document.visibilityState !== "visible") return;
      const room = roomRef.current;
      if (!room) return;
      void room.startVideo().catch(() => {});
      void room.startAudio().catch(() => {});
      onResume?.();
    };
    document.addEventListener("visibilitychange", resume);
    window.addEventListener("pageshow", resume);
    return () => {
      document.removeEventListener("visibilitychange", resume);
      window.removeEventListener("pageshow", resume);
    };
  }, [roomRef, connected, onResume]);
}
