"use client";

import { useEffect, useRef, useState } from "react";

export type PointerType = "mouse" | "touch" | "keyboard" | "pen";

/**
 * Detects the user's current input device in real time.
 *
 * - Sets `touch-device` / `mouse-device` classes on `<html>`.
 * - Returns the current `PointerType` so components can branch on it.
 * - CSS consumers can use `touch:` / `mouse:` variants or the `.touch-only`
 *   / `.mouse-only` utilities defined in globals.css.
 *
 * @example
 * ```tsx
 * const pointer = useDeviceType();
 * if (pointer === "touch") {
 *   // render touch-friendly UI (larger targets, no hover-only elements)
 * }
 * ```
 */
export function useDeviceType(): PointerType {
  const [pointerType, setPointerType] = useState<PointerType>("mouse");

  const lastPointerType = useRef<PointerType>("mouse");

  useEffect(() => {
    const root = document.documentElement;

    function update(type: PointerType) {
      if (type === lastPointerType.current) return;
      lastPointerType.current = type;
      setPointerType(type);
      root.classList.toggle("touch-device", type === "touch");
      root.classList.toggle(
        "mouse-device",
        type === "mouse" || type === "keyboard",
      );
    }

    const onPointerDown = (e: PointerEvent) => {
      const t = e.pointerType as PointerType;
      if (t === "touch" || t === "mouse" || t === "pen") {
        update(t);
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "Tab" ||
        e.key === "Enter" ||
        e.key === "Escape" ||
        e.key.startsWith("Arrow")
      ) {
        update("keyboard");
      }
    };

    const mqlCoarse = window.matchMedia("(pointer: coarse)");
    const mqlFine = window.matchMedia("(pointer: fine)");

    function matchMediaInit() {
      if (mqlCoarse.matches && !mqlFine.matches) {
        update("touch");
      }
    }

    matchMediaInit();

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return pointerType;
}
