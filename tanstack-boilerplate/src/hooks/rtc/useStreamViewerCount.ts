"use client";

import { useEffect, useState } from "react";
import { useRealtime } from "@/lib/realtime/RealtimeProvider";

/**
 * Live viewer count for a stream — subscribes to the joined/left frames the
 * gateway pushes for `slug`. `initial` seeds the count from the join/go-live
 * response; the effect re-seeds whenever it changes (a new join result).
 * Shared by the go-live and stream-viewer views, which had identical copies.
 */
export function useStreamViewerCount(slug: string, initial: number) {
  const realtime = useRealtime();
  const [viewerCount, setViewerCount] = useState(initial);
  // Re-seed during render when `initial` changes (a fresh join result) —
  // React's adjust-state-on-prop-change pattern, not an effect.
  const [prevInitial, setPrevInitial] = useState(initial);
  if (prevInitial !== initial) {
    setPrevInitial(initial);
    setViewerCount(initial);
  }

  useEffect(() => {
    if (!realtime || !slug) return;
    const onCount = (data: Record<string, unknown>) => {
      if (data.slug !== slug) return;
      // Only trust frames that actually carry a count — a joined/left frame
      // without one (older backend builds omitted it on the webhook-driven
      // leave path) used to coerce to 0 and zero the visible count for
      // everyone still watching.
      if (typeof data.viewerCount !== "number") return;
      setViewerCount(data.viewerCount);
    };
    const unsubscribers = [
      realtime.subscribe("rtc:stream-viewer-joined", onCount),
      realtime.subscribe("rtc:stream-viewer-left", onCount),
    ];
    return () => unsubscribers.forEach((unsub) => unsub());
  }, [realtime, slug]);

  return viewerCount;
}
