"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  useRealtime,
  useRealtimeStatus,
} from "@/lib/realtime/RealtimeProvider";

/** Shared shape of meeting/stream room-chat messages — matches
 *  MeetingChatMessageView / StreamChatMessageView from the server layer. */
export interface RoomChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: string;
}

/**
 * Room-scoped realtime chat state shared by the meeting room, go-live, and
 * stream-viewer views — this exact block (seed + merge-on-refetch, join/leave
 * frames, rtc:chat-message subscription, input state, send) was copy-pasted
 * across all three.
 *
 * `chatHistory` is the view's own chat query result (each view has its own
 * query options); the merge keeps WS-pushed messages that a refetch hasn't
 * caught up to yet, and re-runs after reconnect-triggered refetches so
 * messages sent during a WS gap aren't lost.
 */
export function useRoomChat(
  slug: string,
  active: boolean,
  chatHistory: { messages: RoomChatMessage[] } | undefined,
) {
  const realtime = useRealtime();
  const realtimeStatus = useRealtimeStatus();
  const [chat, setChat] = useState<RoomChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const seededChat = useRef(false);

  useEffect(() => {
    if (!chatHistory) return;
    if (!seededChat.current) {
      seededChat.current = true;
      setChat([...chatHistory.messages].reverse());
      return;
    }
    setChat((prev) => {
      const known = new Set(prev.map((m) => m.id));
      const missing = chatHistory.messages.filter((m) => !known.has(m.id));
      if (missing.length === 0) return prev;
      return [...prev, ...missing].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
    });
  }, [chatHistory]);

  useEffect(() => {
    if (!realtime || realtimeStatus !== "open" || !active || !slug) return;
    realtime.send({ type: "rtc:join-room-chat", slug });
    return () => {
      realtime.send({ type: "rtc:leave-room-chat", slug });
    };
  }, [realtime, realtimeStatus, active, slug]);

  useEffect(() => {
    if (!realtime || !slug) return;
    return realtime.subscribe("rtc:chat-message", (data) => {
      if (data.slug !== slug || !data.message) return;
      const m = data.message as RoomChatMessage;
      // A message can arrive both via this push and via a merge-on-refetch —
      // never append a message the list already has.
      setChat((prev) =>
        prev.some((it) => it.id === m.id) ? prev : [...prev, m],
      );
    });
  }, [realtime, slug]);

  const sendChat = useCallback(() => {
    const text = chatInput.trim();
    if (!text || !realtime || !slug) return;
    realtime.send({ type: "rtc:chat-message", slug, text });
    setChatInput("");
  }, [chatInput, realtime, slug]);

  return { chat, chatInput, setChatInput, sendChat };
}
