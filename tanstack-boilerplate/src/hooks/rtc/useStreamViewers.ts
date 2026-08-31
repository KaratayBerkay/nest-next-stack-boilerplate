"use client";

import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  useRealtime,
  useRealtimeStatus,
} from "@/lib/realtime/RealtimeProvider";
import type { RealtimeStatus } from "@/lib/realtime/realtime-client";
import { streamViewersQueryOptions } from "@/api/client/rtc/streams-query";
import type { StreamViewerView } from "@/api/server/rtc/streams/types";

/** Trailing-debounce window for frame-driven list refetches. */
export const VIEWER_REFETCH_DEBOUNCE_MS = 400;

/**
 * Live watcher list for a stream — seeds from the viewers query and refetches
 * on joined/left frames for `slug` (the frames carry the authoritative count
 * but not avatars, so the list re-reads itself instead of patching). Also
 * refetches when the realtime socket comes back so joins/leaves that
 * happened during a WS gap aren't missed. Shared by the go-live and
 * stream-viewer views.
 */
export function useStreamViewers(slug: string): StreamViewerView[] {
  const realtime = useRealtime();
  const realtimeStatus = useRealtimeStatus();
  const { data, refetch } = useQuery(streamViewersQueryOptions(slug));

  useEffect(() => {
    if (!realtime || !slug) return;
    // One trailing refetch per burst: a busy stream's join/leave churn (or
    // the frame flood after a mass reconnect) otherwise makes EVERY watching
    // client re-query the list once per frame — N viewers × M frames of
    // BFF/backend load for a sidebar that only needs the settled state.
    let timer: ReturnType<typeof setTimeout> | null = null;
    const onChange = (data: Record<string, unknown>) => {
      if (data.slug !== slug) return;
      timer ??= setTimeout(() => {
        timer = null;
        void refetch();
      }, VIEWER_REFETCH_DEBOUNCE_MS);
    };
    const unsubscribers = [
      realtime.subscribe("rtc:stream-viewer-joined", onChange),
      realtime.subscribe("rtc:stream-viewer-left", onChange),
    ];
    return () => {
      if (timer) clearTimeout(timer);
      unsubscribers.forEach((unsub) => unsub());
    };
  }, [realtime, slug, refetch]);

  // Refetch only when the socket comes BACK (a non-open → open transition),
  // not on the initial already-open render — the query's own mount fetch
  // covers that moment, and refetch() on top of it just cancelled and
  // restarted the same request. refetch() also bypasses `enabled`, so the
  // no-slug guard matters here (the go-live page mounts this hook with
  // slug "" until the stream starts).
  const prevStatusRef = useRef<RealtimeStatus | null>(null);
  useEffect(() => {
    const prev = prevStatusRef.current;
    prevStatusRef.current = realtimeStatus;
    if (!slug || realtimeStatus !== "open") return;
    if (prev === null || prev === "open") return;
    void refetch();
  }, [realtimeStatus, slug, refetch]);

  return data ?? [];
}
