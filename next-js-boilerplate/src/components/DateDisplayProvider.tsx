"use client";

import { useEffect } from "react";
import { DATE_DISPLAY_COOKIE, DEFAULT_DATE_DISPLAY } from "@/constants/date-display";
import type { DateDisplayProviderProps } from "@/types/components/DateDisplayProvider-types";

export function DateDisplayProvider({ children }: DateDisplayProviderProps) {
  useEffect(() => {
    const match = document.cookie.match(
      new RegExp(`${DATE_DISPLAY_COOKIE}=([^;]+)`),
    );
    if (!match) {
      document.cookie = `${DATE_DISPLAY_COOKIE}=${DEFAULT_DATE_DISPLAY};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
    }
  }, []);

  return <>{children}</>;
}
