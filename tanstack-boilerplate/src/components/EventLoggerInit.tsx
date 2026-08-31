"use client";

import { useEffect } from "react";
import { useEventLogger } from "@/hooks/useEventLogger";
import { useNetworkLogger } from "@/hooks/useNetworkLogger";
import { usePerformanceLogger } from "@/hooks/usePerformanceLogger";

export function EventLoggerInit() {
  useEventLogger();
  useNetworkLogger();
  usePerformanceLogger();

  useEffect(() => {
    // flush remaining events on mount (page already loaded)
  }, []);

  return null;
}
