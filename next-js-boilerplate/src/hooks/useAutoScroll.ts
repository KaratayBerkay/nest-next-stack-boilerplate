"use client";

import { useRef, useLayoutEffect } from "react";

export function useAutoScroll<T extends { id: string }>(
  items: T[],
  enabled = true,
) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastIdRef = useRef<string | null>(null);

  useLayoutEffect(() => {
    if (!enabled || items.length === 0) return;
    const lastId = items[items.length - 1]?.id;
    if (lastId && lastId !== lastIdRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    lastIdRef.current = lastId ?? null;
  }, [items, enabled]);

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    });
  };

  return { bottomRef, scrollToBottom };
}
