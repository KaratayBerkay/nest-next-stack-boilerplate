"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PopupPhase } from "@/types/ui/PopupAlert-types";

const CLOSE_ANIMATION_MS = 300;

export function useAutoDismiss(totalSeconds: number) {
  const [phase, setPhase] = useState<PopupPhase>("closed");
  const [remainingMs, setRemainingMs] = useState(totalSeconds * 1000);
  const tickTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const deadlineRef = useRef(0);

  const clearTimers = useCallback(() => {
    if (tickTimerRef.current) {
      clearInterval(tickTimerRef.current);
      tickTimerRef.current = null;
    }
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const dismiss = useCallback(() => {
    clearTimers();
    setPhase("closing");
    closeTimerRef.current = setTimeout(
      () => setPhase("closed"),
      CLOSE_ANIMATION_MS,
    );
  }, [clearTimers]);

  const show = useCallback(() => {
    clearTimers();
    deadlineRef.current = Date.now() + totalSeconds * 1000;
    setRemainingMs(totalSeconds * 1000);
    setPhase("open");
    tickTimerRef.current = setInterval(() => {
      const remaining = Math.max(0, deadlineRef.current - Date.now());
      setRemainingMs(remaining);
      if (remaining <= 0) dismiss();
    }, 100);
  }, [clearTimers, dismiss, totalSeconds]);

  useEffect(() => clearTimers, [clearTimers]);

  return { phase, remainingMs, show, dismiss };
}
