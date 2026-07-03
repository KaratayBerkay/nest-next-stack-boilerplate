import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { clientEnv } from "@/lib/env";

export function usePostSocket(postId: string | null, onUpdate: () => void) {
  const onUpdateRef = useRef(onUpdate);

  useEffect(() => {
    onUpdateRef.current = onUpdate;
  });

  useEffect(() => {
    if (!postId) return;

    // Socket.io lives on the backend origin (NEXT_PUBLIC_WS_URL), not the
    // frontend origin — socket.io-client normalizes ws(s):// to http(s)://.
    const socket: Socket = io(clientEnv.NEXT_PUBLIC_REALTIME_WS_URL, {
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      socket.emit("join-post", postId);
    });

    socket.on("post-updated", (data: { postId: string }) => {
      if (data.postId === postId) onUpdateRef.current();
    });

    return () => {
      socket.emit("leave-post", postId);
      socket.disconnect();
    };
  }, [postId]);
}
