"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void): () => void {
  if (typeof window.matchMedia !== "function") return () => {};
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

function getSnapshot(): boolean {
  return (
    typeof window.matchMedia === "function" && window.matchMedia(QUERY).matches
  );
}

/**
 * Whether the user asks for reduced motion. SSR renders as `false` and the
 * real value applies right after hydration — gate JS-driven animation
 * (auto-advancing carousels, timed reveals) with this; pure CSS animation
 * should use `motion-reduce:animate-none` instead.
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
