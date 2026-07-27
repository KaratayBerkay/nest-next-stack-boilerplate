"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRealtime } from "@/lib/realtime/RealtimeProvider";

const TYPING_TIMEOUT_MS = 3000;

export function useTypingUsers(): {
  typingUsers: Set<string>;
  sendTypingStart: (recipientId: string) => void;
  sendTypingStop: (recipientId: string) => void;
} {
  const realtime = useRealtime();
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const typingRef = useRef<Set<string>>(new Set());
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  useEffect(() => {
    if (!realtime) return;
    const timers = timersRef.current;

    const unsub1 = realtime.subscribe("typing-start", (frame) => {
      const senderId = (frame as { senderId: string }).senderId;
      if (!senderId) return;
      const next = new Set(typingRef.current);
      next.add(senderId);
      typingRef.current = next;
      setTypingUsers(next);

      // Auto-expire after timeout
      const existing = timers.get(senderId);
      if (existing) clearTimeout(existing);
      timers.set(
        senderId,
        setTimeout(() => {
          const updated = new Set(typingRef.current);
          updated.delete(senderId);
          typingRef.current = updated;
          setTypingUsers(updated);
          timers.delete(senderId);
        }, TYPING_TIMEOUT_MS),
      );
    });

    const unsub2 = realtime.subscribe("typing-stop", (frame) => {
      const senderId = (frame as { senderId: string }).senderId;
      if (!senderId) return;
      const timer = timers.get(senderId);
      if (timer) {
        clearTimeout(timer);
        timers.delete(senderId);
      }
      const next = new Set(typingRef.current);
      next.delete(senderId);
      typingRef.current = next;
      setTypingUsers(next);
    });

    return () => {
      unsub1();
      unsub2();
      for (const timer of timers.values()) clearTimeout(timer);
      timers.clear();
    };
  }, [realtime]);

  const sendTypingStart = useCallback(
    (recipientId: string) => {
      realtime?.send({ type: "typing-start", recipientId });
    },
    [realtime],
  );

  const sendTypingStop = useCallback(
    (recipientId: string) => {
      realtime?.send({ type: "typing-stop", recipientId });
    },
    [realtime],
  );

  return { typingUsers, sendTypingStart, sendTypingStop };
}
