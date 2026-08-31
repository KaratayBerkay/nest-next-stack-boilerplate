"use client";

import { useEffect } from "react";

/**
 * Detects the device input capability on mount and sets
 * `touch-device` / `mouse-device` classes on `<html>`.
 *
 * This runs before hydration so the classes are present from the first
 * paint. Consumers use `touch:` / `mouse:` Tailwind variants or the
 * `.touch-only` / `.mouse-only` utilities.
 */
export function DeviceTypeInit() {
  useEffect(() => {
    const root = document.documentElement;
    const isCoarse = window.matchMedia("(pointer: coarse)").matches;
    const isFine = window.matchMedia("(pointer: fine)").matches;

    if (isCoarse && !isFine) {
      root.classList.add("touch-device");
    } else {
      root.classList.add("mouse-device");
    }
  }, []);

  return null;
}
