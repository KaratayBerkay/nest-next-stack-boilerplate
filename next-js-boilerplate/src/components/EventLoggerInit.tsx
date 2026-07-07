"use client";

import { useEffect } from "react";
import { useEventLogger } from "@/hooks/useEventLogger";
import { useNetworkLogger } from "@/hooks/useNetworkLogger";

export function EventLoggerInit() {
  useEventLogger();
  useNetworkLogger();

  useEffect(() => {
    // flush remaining events on mount (page already loaded)
  }, []);

  return null;
}
