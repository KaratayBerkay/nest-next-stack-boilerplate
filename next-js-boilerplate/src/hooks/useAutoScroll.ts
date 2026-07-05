"use client";

import { useRef, useLayoutEffect, useState, useCallback } from "react";

export function useAutoScroll<T extends { id: string }>(
  items: T[],
  enabled = true,
) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastIdRef = useRef<string | null>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  useLayoutEffect(() => {
    const el = bottomRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsAtBottom(entry?.isIntersecting ?? false);
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [enabled]);

  useLayoutEffect(() => {
    if (!enabled || items.length === 0) return;
    const lastId = items[items.length - 1]?.id;
    if (lastId && lastId !== lastIdRef.current && isAtBottom) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    lastIdRef.current = lastId ?? null;
  }, [items, enabled, isAtBottom]);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    });
  }, []);

  return { bottomRef, scrollToBottom, isAtBottom };
}
