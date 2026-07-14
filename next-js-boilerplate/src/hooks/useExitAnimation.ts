"use client";

import { useState, useLayoutEffect, useCallback, useMemo } from "react";

interface UseExitAnimationOptions {
  open: boolean;
  enterAnimation?: string;
  exitAnimation?: string;
  exitDuration?: number;
}

interface UseExitAnimationResult {
  shouldRender: boolean;
  animationClass: string;
  onAnimationEnd: () => void;
}

type AnimationState = "closed" | "entering" | "open" | "exiting";

export function useExitAnimation({
  open,
  enterAnimation = "animate-scale-in",
  exitAnimation = "animate-scale-out",
  exitDuration = 150,
}: UseExitAnimationOptions): UseExitAnimationResult {
  const [state, setState] = useState<AnimationState>(open ? "open" : "closed");
  const [prevOpen, setPrevOpen] = useState(open);

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open && state === "closed") {
      setState("entering");
    } else if (!open && (state === "open" || state === "entering")) {
      setState("exiting");
    }
  }

  useLayoutEffect(() => {
    if (state === "exiting") {
      const timer = setTimeout(() => setState("closed"), exitDuration);
      return () => clearTimeout(timer);
    }
  }, [state, exitDuration]);

  const onAnimationEnd = useCallback(() => {
    if (state === "exiting") {
      setState("closed");
    } else if (state === "entering") {
      setState("open");
    }
  }, [state]);

  const shouldRender = state !== "closed";
  const animationClass = useMemo(
    () =>
      state === "entering" || state === "open"
        ? enterAnimation
        : state === "exiting"
          ? exitAnimation
          : "",
    [state, enterAnimation, exitAnimation],
  );

  return { shouldRender, animationClass, onAnimationEnd };
}
