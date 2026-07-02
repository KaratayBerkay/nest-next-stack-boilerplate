"use client";

import { useEffect, useRef } from "react";

export type EdgeSwipeOptions = {
  edgeWidth?: number;
  swipeThreshold?: number;
  onSwipeRight?: () => void;
  onSwipeLeft?: () => void;
  enabled?: boolean;
};

export function useEdgeSwipe({
  edgeWidth = 24,
  swipeThreshold = 60,
  onSwipeRight,
  onSwipeLeft,
  enabled = true,
}: EdgeSwipeOptions) {
  const stateRef = useRef({
    isDragging: false,
    startX: 0,
    currentX: 0,
    cursor: "",
  });

  const overEdgeRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    const isNearEdge = (clientX: number) => clientX <= edgeWidth;

    const onTouchStart = (e: TouchEvent) => {
      const x = e.touches[0].clientX;
      if (!isNearEdge(x)) return;
      stateRef.current = {
        isDragging: true,
        startX: x,
        currentX: x,
        cursor: document.body.style.cursor,
      };
      document.body.style.cursor = "grabbing";
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!stateRef.current.isDragging) return;
      stateRef.current.currentX = e.touches[0].clientX;
    };

    const onTouchEnd = () => {
      if (!stateRef.current.isDragging) return;
      const dx = stateRef.current.currentX - stateRef.current.startX;
      document.body.style.cursor = stateRef.current.cursor;
      stateRef.current.isDragging = false;
      if (dx > swipeThreshold) onSwipeRight?.();
    };

    const onMouseMove = (e: MouseEvent) => {
      if (stateRef.current.isDragging) {
        stateRef.current.currentX = e.clientX;
        return;
      }
      if (isNearEdge(e.clientX)) {
        if (!overEdgeRef.current) {
          overEdgeRef.current = true;
          stateRef.current.cursor = document.body.style.cursor;
          document.body.style.cursor = "grab";
        }
      } else if (overEdgeRef.current) {
        overEdgeRef.current = false;
        document.body.style.cursor = stateRef.current.cursor;
      }
    };

    const onMouseDown = (e: MouseEvent) => {
      if (!isNearEdge(e.clientX)) return;
      stateRef.current = {
        isDragging: true,
        startX: e.clientX,
        currentX: e.clientX,
        cursor: document.body.style.cursor,
      };
      document.body.style.cursor = "grabbing";
    };

    const onMouseUp = () => {
      if (!stateRef.current.isDragging) return;
      const dx = stateRef.current.currentX - stateRef.current.startX;
      document.body.style.cursor = stateRef.current.cursor;
      stateRef.current.isDragging = false;
      if (dx > swipeThreshold) onSwipeRight?.();
      else if (dx < -swipeThreshold) onSwipeLeft?.();
    };

    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchmove", onTouchMove, { passive: true });
    document.addEventListener("touchend", onTouchEnd);
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mouseup", onMouseUp);

    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mouseup", onMouseUp);
      document.body.style.cursor = stateRef.current.cursor;
    };
  }, [enabled, edgeWidth, swipeThreshold, onSwipeRight, onSwipeLeft]);
}
