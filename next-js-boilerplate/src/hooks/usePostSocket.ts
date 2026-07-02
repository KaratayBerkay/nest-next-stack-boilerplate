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

    const socket: Socket = io(clientEnv.NEXT_PUBLIC_APP_URL, {
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
