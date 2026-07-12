"use client";

import { useEffect, useRef, useState } from "react";
import { useRealtimeStatus } from "@/lib/realtime/RealtimeProvider";

export type ConnectionState = "online" | "connecting" | "unstable";

const GRACE_WINDOW_MS = 3_000;

export function useConnectionState(): ConnectionState {
  const status = useRealtimeStatus();
  const [state, setState] = useState<ConnectionState>("connecting");
  const graceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (status === "open") {
      if (graceRef.current) {
        clearTimeout(graceRef.current);
        graceRef.current = null;
      }
      setState("online"); // eslint-disable-line react-hooks/set-state-in-effect
    } else if (status === "backoff") {
      setState((prev) => {
        if (prev !== "online") return "unstable";
        if (!graceRef.current) {
          graceRef.current = setTimeout(() => {
            setState("unstable");
            graceRef.current = null;
          }, GRACE_WINDOW_MS);
        }
        return prev;
      });
    } else if (status === "down") {
      if (graceRef.current) {
        clearTimeout(graceRef.current);
        graceRef.current = null;
      }
      setState("unstable"); // eslint-disable-line react-hooks/set-state-in-effect
    } else {
      if (graceRef.current) {
        clearTimeout(graceRef.current);
        graceRef.current = null;
      }
      setState("connecting"); // eslint-disable-line react-hooks/set-state-in-effect
    }

    return () => {
      if (graceRef.current) {
        clearTimeout(graceRef.current);
        graceRef.current = null;
      }
    };
  }, [status]);

  return state;
}
