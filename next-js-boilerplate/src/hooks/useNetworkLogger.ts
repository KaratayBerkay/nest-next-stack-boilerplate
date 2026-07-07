"use client";

import { useEffect, useRef } from "react";
import { eventLogger } from "@/lib/event-logger";

export function useNetworkLogger(): void {
  const wasOffline = useRef(false);

  useEffect(() => {
    const onOnline = () => {
      if (wasOffline.current) {
        wasOffline.current = false;
        eventLogger.emit({
          eventType: "network.online",
          url: window.location.pathname,
          category: "network",
          event: "network.online",
        });
      }
    };

    const onOffline = () => {
      wasOffline.current = true;
      eventLogger.emit({
        eventType: "network.offline",
        url: window.location.pathname,
        category: "network",
        event: "network.offline",
      });
    };

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);
}
