"use client";

import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

/**
 * Animates a number from 0 up to `target` using requestAnimationFrame with an
 * ease-out curve. Respects prefers-reduced-motion by jumping straight to the
 * final value instead of animating.
 */
export function useCountUp(target: number, durationMs = 1400): number {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [value, setValue] = useState<number>(0);

  useEffect(() => {
    if (prefersReducedMotion) {
      setTimeout(() => setValue(target), 0);
      return;
    }

    let frame: number;
    let start: number | null = null;

    const tick = (timestamp: number) => {
      if (start === null) start = timestamp;
      const elapsed = timestamp - start;
      const progress = Math.min(1, elapsed / durationMs);
      const eased = 1 - (1 - progress) * (1 - progress);
      setValue(target * eased);
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, durationMs, prefersReducedMotion]);

  return value;
}

/** Formats a count-up value with fixed decimals and thousands separators. */
export function formatCountValue(value: number, decimals = 0): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}
