"use client";

import { useEffect } from "react";
import { useEventLogger } from "@/hooks/useEventLogger";

export function EventLoggerInit() {
  useEventLogger();

  useEffect(() => {
    // flush remaining events on mount (page already loaded)
  }, []);

  return null;
}
