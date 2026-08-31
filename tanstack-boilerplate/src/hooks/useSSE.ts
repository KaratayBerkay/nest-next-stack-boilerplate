"use client";

import { useEffect, useState } from "react";

interface SSEEvent {
  time: number;
  value: number;
}

export function useSSE(url: string) {
  const [events, setEvents] = useState<SSEEvent[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const es = new EventSource(url);

    es.onopen = () => setConnected(true);
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data) as SSEEvent;
        setEvents((prev) => [...prev.slice(-49), data]);
      } catch {
        // skip malformed frame
      }
    };
    es.onerror = () => {
      setConnected(false);
    };

    return () => {
      es.close();
      setConnected(false);
    };
  }, [url]);

  return { events, connected };
}
