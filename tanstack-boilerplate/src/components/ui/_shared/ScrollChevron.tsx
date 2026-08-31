"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";
import type { ScrollChevronProps } from "@/types/ui/ScrollChevron-types";

const SCROLL_REPEAT_MS = 60;

export function ScrollChevron({ direction, onScroll }: ScrollChevronProps) {
  const repeatRef = useRef<ReturnType<typeof setInterval> | undefined>(
    undefined,
  );
  const onScrollRef = useRef(onScroll);
  useEffect(() => {
    onScrollRef.current = onScroll;
  });

  const start = () => {
    onScrollRef.current();
    repeatRef.current = setInterval(
      () => onScrollRef.current(),
      SCROLL_REPEAT_MS,
    );
  };
  const stop = () => {
    if (repeatRef.current) clearInterval(repeatRef.current);
    repeatRef.current = undefined;
  };

  useEffect(() => stop, []);

  return (
    <div
      onMouseEnter={start}
      onMouseLeave={stop}
      className={cn(
        "bg-bg text-muted hover:text-fg absolute inset-x-0 z-10 flex h-8 items-center justify-center transition-colors",
        direction === "up" ? "top-0" : "bottom-0",
      )}
      aria-hidden="true"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={direction === "up" ? "m6 15 6-6 6 6" : "m6 9 6 6 6-6"} />
      </svg>
    </div>
  );
}
