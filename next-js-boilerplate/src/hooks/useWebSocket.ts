"use client";

import { useEffect, useRef, useState } from "react";
import { clientEnv } from "@/lib/env";

export type WsStatus = "connecting" | "connected" | "disconnected";

export function useWebSocket() {
  const [status, setStatus] = useState<WsStatus>("disconnected");
  const [messages, setMessages] = useState<string[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const url = clientEnv.NEXT_PUBLIC_REALTIME_WS_URL;
    let reconnectTimer: ReturnType<typeof setTimeout>;

    function connect() {
      setStatus("connecting");
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => setStatus("connected");
      ws.onmessage = (e) => {
        setMessages((prev) => [...prev.slice(-49), e.data]);
      };
      ws.onclose = () => {
        setStatus("disconnected");
        reconnectTimer = setTimeout(connect, 3000);
      };
      ws.onerror = () => {
        ws.close();
      };
    }

    connect();

    return () => {
      clearTimeout(reconnectTimer);
      wsRef.current?.close();
    };
  }, []);

  function send(data: string) {
    wsRef.current?.send(data);
  }

  return { status, messages, send };
}
