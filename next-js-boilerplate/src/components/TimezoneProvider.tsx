"use client";

import { useEffect } from "react";
import { TIMEZONE_COOKIE } from "@/constants/i18n";

function getBrowserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "UTC";
  }
}

export function TimezoneProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const match = document.cookie.match(
      new RegExp(`${TIMEZONE_COOKIE}=([^;]+)`),
    );
    if (!match) {
      const tz = getBrowserTimezone();
      document.cookie = `${TIMEZONE_COOKIE}=${tz};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
    }
  }, []);

  return <>{children}</>;
}
