"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SWIPE_THRESHOLD } from "@/constants/ui";

type SwipeDirection = "left" | "right" | null;

type SwipeState = {
  direction: SwipeDirection;
  progress: number;
  isSwiping: boolean;
  startX: number;
  currentX: number;
};

type UseSwipeOptions = {
  threshold?: number;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeCancel?: () => void;
  enabled?: boolean;
};

export function useSwipeGesture(options: UseSwipeOptions = {}) {
  const {
    threshold = SWIPE_THRESHOLD,
    onSwipeLeft,
    onSwipeRight,
    onSwipeCancel,
    enabled = true,
  } = options;

  const [state, setState] = useState<SwipeState>({
    direction: null,
    progress: 0,
    isSwiping: false,
    startX: 0,
    currentX: 0,
  });

  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const gestureEndedRef = useRef(false);
  const keysRef = useRef({ ctrl: false, shift: false });
  const keyboardStartXRef = useRef<number | null>(null);
  const ctrlCursorRef = useRef<string | null>(null);
  const touchOriginRef = useRef({ x: 0, y: 0 });
  const touchAxisLockedRef = useRef(false);

  const handleStart = useCallback(
    (clientX: number) => {
      if (!enabled) return;
      gestureEndedRef.current = false;
      setState((prev) => ({
        ...prev,
        isSwiping: true,
        startX: clientX,
        currentX: clientX,
        direction: null,
        progress: 0,
      }));
    },
    [enabled],
  );

  const handleMove = useCallback(
    (clientX: number) => {
      if (!stateRef.current.isSwiping) return;
      const deltaX = clientX - stateRef.current.startX;
      const progress = Math.min(Math.abs(deltaX) / threshold, 1);
      const direction: SwipeDirection = deltaX < 0 ? "left" : "right";

      setState((prev) => ({
        ...prev,
        currentX: clientX,
        direction,
        progress,
      }));
    },
    [threshold],
  );

  const handleEnd = useCallback(() => {
    if (gestureEndedRef.current) return;
    if (!stateRef.current.isSwiping) return;
    gestureEndedRef.current = true;
    const { direction, progress } = stateRef.current;

    setState((prev) => ({
      ...prev,
      isSwiping: false,
      direction: null,
      progress: 0,
    }));

    if (progress >= 1) {
      if (direction === "left" && onSwipeLeft) {
        onSwipeLeft();
      } else if (direction === "right" && onSwipeRight) {
        onSwipeRight();
      }
    } else {
      onSwipeCancel?.();
    }
  }, [onSwipeLeft, onSwipeRight, onSwipeCancel]);

  const handleEndRef = useRef(handleEnd);
  useEffect(() => {
    handleEndRef.current = handleEnd;
  }, [handleEnd]);

  const cancelGesture = useCallback(() => {
    keyboardStartXRef.current = null;
    // eslint-disable-next-line react-compiler/react-compiler
    document.body.style.cursor = ctrlCursorRef.current ?? "";
    ctrlCursorRef.current = null;
    gestureEndedRef.current = true;
    stateRef.current = {
      ...stateRef.current,
      isSwiping: false,
      direction: null,
      progress: 0,
    };
    setState((prev) => ({
      ...prev,
      isSwiping: false,
      direction: null,
      progress: 0,
    }));
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const isKeyboardMode = () => keysRef.current.ctrl && keysRef.current.shift;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.key === "Control") keysRef.current.ctrl = true;
      if (e.key === "Shift") {
        keysRef.current.shift = true;
        e.preventDefault();
      }

      if (isKeyboardMode() && keyboardStartXRef.current === null) {
        if (ctrlCursorRef.current === null) {
          ctrlCursorRef.current = document.body.style.cursor;
        }
        document.body.style.cursor = "grab";
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Control") keysRef.current.ctrl = false;
      if (e.key === "Shift") keysRef.current.shift = false;

      if (!isKeyboardMode()) {
        document.body.style.cursor = ctrlCursorRef.current ?? "";
        ctrlCursorRef.current = null;

        if (keyboardStartXRef.current !== null) {
          handleEndRef.current();
          keyboardStartXRef.current = null;
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);

    const onTouchStart = (e: TouchEvent) => {
      if (isKeyboardMode() || !e.touches.length) return;
      touchOriginRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
      touchAxisLockedRef.current = false;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (isKeyboardMode() || !e.touches.length) return;

      if (!stateRef.current.isSwiping) {
        const dx = e.touches[0].clientX - touchOriginRef.current.x;
        const dy = e.touches[0].clientY - touchOriginRef.current.y;

        if (Math.abs(dx) > Math.abs(dy) * 2 && Math.abs(dx) > 5) {
          gestureEndedRef.current = false;
          stateRef.current = {
            ...stateRef.current,
            isSwiping: true,
            startX: touchOriginRef.current.x,
            currentX: touchOriginRef.current.x,
            direction: null,
            progress: 0,
          };
          setState((prev) => ({
            ...prev,
            isSwiping: true,
            startX: touchOriginRef.current.x,
            currentX: touchOriginRef.current.x,
            direction: null,
            progress: 0,
          }));
          touchAxisLockedRef.current = true;
        } else if (Math.abs(dy) > Math.abs(dx) * 2 && Math.abs(dy) > 10) {
          touchAxisLockedRef.current = true;
          return;
        } else {
          return;
        }
      }

      if (!touchAxisLockedRef.current) return;
      handleMove(e.touches[0].clientX);
    };
    const onTouchEnd = () => {
      if (isKeyboardMode()) return;
      touchAxisLockedRef.current = false;
      handleEnd();
    };

    const onMouseMove = (e: MouseEvent) => {
      if (isKeyboardMode()) {
        if (keyboardStartXRef.current === null) {
          keyboardStartXRef.current = e.clientX;
          handleStart(e.clientX);
          document.body.style.cursor = "grabbing";
          return;
        }
        const deltaX = e.clientX - keyboardStartXRef.current;
        const progress = Math.min(Math.abs(deltaX) / threshold, 1);
        const direction: SwipeDirection = deltaX < 0 ? "right" : "left";

        stateRef.current = {
          ...stateRef.current,
          direction,
          progress,
          currentX: e.clientX,
        };
        setState((prev) => ({
          ...prev,
          direction,
          progress,
          currentX: e.clientX,
        }));
        return;
      }

      handleMove(e.clientX);
    };

    const onMouseUp = () => {
      if (keyboardStartXRef.current !== null) return;
      handleEnd();
      document.body.style.cursor = ctrlCursorRef.current ?? "";
    };

    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchmove", onTouchMove, { passive: true });
    document.addEventListener("touchend", onTouchEnd);
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keyup", onKeyUp);
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      document.body.style.cursor = ctrlCursorRef.current ?? "";
    };
  }, [enabled, handleStart, handleMove, handleEnd, threshold]);

  return { ...state, cancelGesture };
}
