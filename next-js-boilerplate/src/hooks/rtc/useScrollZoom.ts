"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent, RefObject } from "react";

const MIN_ZOOM = 1;
const MAX_ZOOM = 1.75;
const ZOOM_STEP = 0.25;

export interface UseScrollZoomResult {
  /** 1 = fit-to-container (no zoom). Drive a content box's width/height as
   *  `${zoom * 100}%` of the scroll container to make it scrollable. */
  zoom: number;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  canZoomIn: boolean;
  canZoomOut: boolean;
  /** True once zoomed past fit-to-container — the signal for showing the
   *  grab cursor and enabling click-drag panning; at 1x there's nothing to
   *  pan since the content exactly fills the container. */
  isPannable: boolean;
  /** True while a pan drag is in progress — swap the cursor from "grab" to
   *  "grabbing" while this is true. */
  isPanning: boolean;
  /** Spread onto the scroll container to enable click-and-drag panning
   *  (mouse, touch, and pen alike, via the Pointer Events API). No-ops
   *  while `isPannable` is false. */
  panHandlers: {
    onPointerDown: (e: PointerEvent<HTMLDivElement>) => void;
    onPointerMove: (e: PointerEvent<HTMLDivElement>) => void;
    onPointerUp: (e: PointerEvent<HTMLDivElement>) => void;
    onPointerCancel: (e: PointerEvent<HTMLDivElement>) => void;
  };
}

interface DragStart {
  pointerId: number;
  x: number;
  y: number;
  scrollLeft: number;
  scrollTop: number;
}

/**
 * Discrete-step zoom for a scrollable content box (a shared-screen video,
 * say). Panning works two ways once zoomed in: native browser scroll
 * (mouse wheel, trackpad, scrollbar drag) needs no code at all here, and
 * click-and-drag ("grab the content and move it") is handled below via the
 * Pointer Events API — one code path for mouse, touch, and pen, using
 * `setPointerCapture` so the drag keeps tracking even if the pointer
 * leaves the container mid-gesture, instead of window-level listeners.
 * Zooming keeps whatever point was at the container's center stable
 * instead of always snapping back to the top-left corner, computed as a
 * scroll-position ratio so it works regardless of the container's actual
 * pixel size.
 *
 * `scrollRef` — created by the caller (`useRef`) and attached to the
 * scrollable container in its own JSX, same reasoning as
 * useLiveKitRoom/useLiveKitMeetingRoom's element refs: react-compiler
 * flags any hook return that mixes a ref with plain reactive state, so
 * this hook only ever returns numbers/booleans/functions.
 *
 * `resetKey` — pass whatever value identifies "this is fresh content now"
 * (e.g. the active MediaStreamTrack): a new screen-share session should
 * start at 1x, not carry over the zoom level from whatever was shared
 * before it.
 */
export function useScrollZoom(
  scrollRef: RefObject<HTMLDivElement | null>,
  resetKey?: unknown,
): UseScrollZoomResult {
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [isPanning, setIsPanning] = useState(false);
  const pendingCenterRatioRef = useRef<{ x: number; y: number } | null>(null);
  const dragStartRef = useRef<DragStart | null>(null);

  // Reset during render (React's documented pattern for "adjust state when
  // a prop changes") rather than in an effect — an effect here would let
  // one extra frame render at the STALE zoom level before snapping back,
  // and trips this repo's react-hooks/set-state-in-effect lint besides.
  const [prevResetKey, setPrevResetKey] = useState(resetKey);
  if (resetKey !== prevResetKey) {
    setPrevResetKey(resetKey);
    setZoom(MIN_ZOOM);
  }

  // Takes an updater (not a raw value) so two clicks fired before a
  // re-render lands (fast real clicks, or a test batching two calls in one
  // act()) each build on the pending value instead of both computing from
  // the same stale `zoom` closure — the latter would make "zoom in twice"
  // silently collapse into "zoom in once".
  const applyZoom = useCallback(
    (updater: (current: number) => number) => {
      const el = scrollRef.current;
      if (el && el.scrollWidth > 0 && el.scrollHeight > 0) {
        pendingCenterRatioRef.current = {
          x: (el.scrollLeft + el.clientWidth / 2) / el.scrollWidth,
          y: (el.scrollTop + el.clientHeight / 2) / el.scrollHeight,
        };
      }
      setZoom(updater);
    },
    [scrollRef],
  );

  // Runs after the zoom-driven resize has painted (scrollWidth/scrollHeight
  // reflect the NEW size here), so the ratio captured above lands on the
  // same content point rather than the container's raw top-left corner.
  useEffect(() => {
    const el = scrollRef.current;
    const ratio = pendingCenterRatioRef.current;
    if (el && ratio) {
      // Imperative DOM scroll-position update on the caller's own element —
      // the standard use for a ref, but react-compiler can't tell that from
      // a direct property assignment on `scrollRef.current` (an opaque
      // method call like `el.scrollTo()` wouldn't trip this, but jsdom
      // doesn't implement it, which this repo's tests rely on).
      // eslint-disable-next-line react-compiler/react-compiler
      el.scrollLeft = ratio.x * el.scrollWidth - el.clientWidth / 2;
      el.scrollTop = ratio.y * el.scrollHeight - el.clientHeight / 2;
      pendingCenterRatioRef.current = null;
    }
  }, [scrollRef, zoom]);

  const zoomIn = useCallback(() => {
    applyZoom((current) =>
      Math.min(MAX_ZOOM, Math.round((current + ZOOM_STEP) * 100) / 100),
    );
  }, [applyZoom]);

  const zoomOut = useCallback(() => {
    applyZoom((current) =>
      Math.max(MIN_ZOOM, Math.round((current - ZOOM_STEP) * 100) / 100),
    );
  }, [applyZoom]);

  const resetZoom = useCallback(() => {
    applyZoom(() => MIN_ZOOM);
  }, [applyZoom]);

  const isPannable = zoom > MIN_ZOOM;

  const onPointerDown = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      const el = scrollRef.current;
      // Left button only for mouse — a right-click drag shouldn't hijack
      // the context menu. Touch/pen carry no `button` distinction.
      if (!el || !isPannable || (e.pointerType === "mouse" && e.button !== 0)) {
        return;
      }
      // Guarded, not assumed: jsdom (this repo's test environment) has no
      // Pointer Capture implementation, and it's not universal in embedded
      // WebViews either — the drag still works without it, just without
      // the "keeps tracking past the element's edge" guarantee.
      el.setPointerCapture?.(e.pointerId);
      dragStartRef.current = {
        pointerId: e.pointerId,
        x: e.clientX,
        y: e.clientY,
        scrollLeft: el.scrollLeft,
        scrollTop: el.scrollTop,
      };
      setIsPanning(true);
    },
    [scrollRef, isPannable],
  );

  const onPointerMove = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      const el = scrollRef.current;
      const start = dragStartRef.current;
      if (!el || !start || start.pointerId !== e.pointerId) return;
      // Dragging right moves the *content* right — the classic "grab and
      // move the paper" feel — so scrollLeft moves the opposite way.
      el.scrollLeft = start.scrollLeft - (e.clientX - start.x);
      el.scrollTop = start.scrollTop - (e.clientY - start.y);
    },
    [scrollRef],
  );

  const endDrag = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      const el = scrollRef.current;
      if (el && dragStartRef.current?.pointerId === e.pointerId) {
        el.releasePointerCapture?.(e.pointerId);
      }
      dragStartRef.current = null;
      setIsPanning(false);
    },
    [scrollRef],
  );

  return {
    zoom,
    zoomIn,
    zoomOut,
    resetZoom,
    canZoomIn: zoom < MAX_ZOOM,
    canZoomOut: zoom > MIN_ZOOM,
    isPannable,
    isPanning,
    panHandlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: endDrag,
      onPointerCancel: endDrag,
    },
  };
}
