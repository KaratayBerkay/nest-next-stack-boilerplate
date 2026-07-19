"use client";

import { usePageNavigation } from "@/hooks/usePageNavigation";
import { useSwipeGesture } from "@/hooks/useSwipeGesture";
import { useCallback, useEffect } from "react";
import Image from "next/image";

const FINGER_IMAGES = [
  "/app/finger-1.png",
  "/app/finger-2.png",
  "/app/finger-3.png",
  "/app/finger-4.png",
  "/app/finger-5.png",
];

function getFingerImage(progress: number): string {
  const index = Math.min(
    Math.floor(progress * FINGER_IMAGES.length),
    FINGER_IMAGES.length - 1,
  );
  return FINGER_IMAGES[index];
}

export function NavigationOverlay() {
  const {
    suggestion,
    suggestNavigation,
    commitNavigation,
    cancelSuggestion,
    currentPage: _currentPage,
    backPage,
    forwardPage,
  } = usePageNavigation();

  const { direction, progress, isSwiping, cancelGesture } = useSwipeGesture({
    threshold: 50,
    onSwipeLeft: useCallback(() => {
      if (backPage) commitNavigation("back");
    }, [backPage, commitNavigation]),
    onSwipeRight: useCallback(() => {
      if (forwardPage) commitNavigation("forward");
    }, [forwardPage, commitNavigation]),
    onSwipeCancel: useCallback(() => {
      cancelSuggestion();
    }, [cancelSuggestion]),
  });

  useEffect(() => {
    if (direction && isSwiping) {
      const sd = direction === "left" ? "back" : "forward";
      suggestNavigation(sd, progress);
    }
    if (!isSwiping) {
      suggestNavigation(null, 0);
    }
  }, [direction, progress, isSwiping, suggestNavigation]);

  useEffect(() => {
    if (!suggestion) return;
    const onMouseDown = () => {
      cancelSuggestion();
      cancelGesture();
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [suggestion, cancelSuggestion, cancelGesture]);

  if (!suggestion && !isSwiping) return null;

  const targetPage = suggestion?.targetPage ?? null;
  const showOverlay = !!suggestion || isSwiping;
  const fingerSrc = getFingerImage(
    suggestion?.progress ?? (isSwiping ? progress : 0),
  );

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-200 ${
        showOverlay ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className="flex flex-col items-center gap-3 rounded-2xl px-8 py-6 shadow-2xl backdrop-blur-md"
        style={{
          background: "rgba(0,0,0,0.7)",
          transform:
            suggestion?.direction === "back"
              ? `translateX(${-20 - (1 - (suggestion?.progress ?? 0)) * 80}px)`
              : suggestion?.direction === "forward"
                ? `translateX(${20 + (1 - (suggestion?.progress ?? 0)) * 80}px)`
                : "translateX(0)",
        }}
      >
        {showOverlay && (
          <div className="relative h-36 w-28">
            <Image
              src={fingerSrc}
              alt=""
              fill
              className="object-contain opacity-80"
              style={{
                transform:
                  suggestion?.direction === "back" ? "scaleX(-1)" : "none",
              }}
              sizes="112px"
            />
          </div>
        )}

        {targetPage && (
          <div className="flex flex-col items-center gap-1">
            <span className="text-muted text-sm">
              {suggestion?.direction === "back" ? "← Back to" : "Forward to →"}
            </span>
            <span className="text-lg font-semibold text-white">
              {targetPage.title}
            </span>
          </div>
        )}

        {!targetPage && isSwiping && !suggestion && (
          <span className="text-muted text-sm">Release to navigate</span>
        )}

        {suggestion && suggestion.progress >= 1 && suggestion.direction && (
          <div className="mt-1 flex flex-col items-center gap-2">
            <div className="h-1 w-20 animate-pulse overflow-hidden rounded-full bg-white" />
            <span className="text-muted text-xs">Click to cancel</span>
          </div>
        )}
      </div>
    </div>
  );
}
