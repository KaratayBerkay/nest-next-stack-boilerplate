"use client";

import { useRef, useState, useEffect } from "react";
import { DEFAULT_WINDOW_MS, DEFAULT_MAX_HITS } from "@/constants/ui";

export function useRateLimiter(
  windowMs = DEFAULT_WINDOW_MS,
  maxHits = DEFAULT_MAX_HITS,
) {
  const timestamps = useRef<number[]>([]);
  const [rateLimited, setRateLimited] = useState(false);

  useEffect(() => {
    if (!rateLimited) return;
    const now = Date.now();
    const active = timestamps.current.filter((t) => now - t < windowMs);
    if (active.length < maxHits) {
      setRateLimited(false);
      return;
    }
    const timer = setTimeout(
      () => {
        const n = Date.now();
        timestamps.current = timestamps.current.filter((t) => n - t < windowMs);
        setRateLimited(timestamps.current.length >= maxHits);
      },
      active[0] + windowMs - now,
    );
    return () => clearTimeout(timer);
  }, [rateLimited, windowMs, maxHits]);

  function checkRateLimit(): boolean {
    const now = Date.now();
    timestamps.current = timestamps.current.filter((t) => now - t < windowMs);
    if (timestamps.current.length >= maxHits) {
      setRateLimited(true);
      return true;
    }
    timestamps.current.push(now);
    if (timestamps.current.length >= maxHits) {
      setRateLimited(true);
    }
    return false;
  }

  return { rateLimited, checkRateLimit };
}
