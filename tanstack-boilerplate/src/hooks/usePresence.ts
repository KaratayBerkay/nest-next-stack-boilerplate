"use client";

import { useEffect, useRef, useState } from "react";
import { useRealtime } from "@/lib/realtime/RealtimeProvider";

export function usePresence(): Set<string> {
  const realtime = useRealtime();
  // Seed from the provider's always-on cache rather than starting empty: the
  // server's one-time online-users snapshot (sent at WS connect, which
  // usually happens before this hook ever mounts) would otherwise be lost,
  // leaving already-online peers stuck looking offline until they happen to
  // toggle after this hook subscribes.
  const [online, setOnline] = useState<Set<string>>(
    () => realtime?.getOnlineUsers() ?? new Set(),
  );
  const onlineRef = useRef<Set<string>>(online);

  useEffect(() => {
    if (!realtime) return;

    const unsub1 = realtime.subscribe("online-users", (frame) => {
      const users = (frame as { users: { id: string }[] }).users ?? [];
      const next = new Set(users.map((u) => u.id));
      onlineRef.current = next;
      setOnline(next);
    });

    const unsub2 = realtime.subscribe("user-online", (frame) => {
      const user = (frame as { user: { id: string } }).user;
      if (!user?.id) return;
      const next = new Set(onlineRef.current);
      next.add(user.id);
      onlineRef.current = next;
      setOnline(next);
    });

    const unsub3 = realtime.subscribe("user-offline", (frame) => {
      const userId = (frame as { userId: string }).userId;
      if (!userId) return;
      const next = new Set(onlineRef.current);
      next.delete(userId);
      onlineRef.current = next;
      setOnline(next);
    });

    return () => {
      unsub1();
      unsub2();
      unsub3();
    };
  }, [realtime]);

  return online;
}
