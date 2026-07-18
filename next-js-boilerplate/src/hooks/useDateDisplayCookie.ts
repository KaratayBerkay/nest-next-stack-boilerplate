"use client";

import { useState, useEffect } from "react";
import {
  DATE_DISPLAY_COOKIE,
  DATE_DISPLAY_FORMATS,
  DEFAULT_DATE_DISPLAY,
} from "@/constants/date-display";
import type { DateDisplayFormat } from "@/constants/date-display";

function readDateDisplay(): DateDisplayFormat {
  const match = document.cookie.match(new RegExp(`${DATE_DISPLAY_COOKIE}=([^;]+)`));
  const val = match?.[1];
  if (val && (DATE_DISPLAY_FORMATS as readonly string[]).includes(val)) {
    return val as DateDisplayFormat;
  }
  return DEFAULT_DATE_DISPLAY;
}

export function useDateDisplayCookie() {
  // Always start at the default rather than eager-reading document.cookie:
  // several consumers (feed, post detail) paint real server-fetched dates on
  // the very first render, so an eager read here would mismatch the server
  // render for anyone who has already chosen "iso"/"short", producing a
  // hydration warning. The effect below corrects to the real value
  // immediately post-mount instead.
  const [dateDisplay, setDateDisplay] = useState<DateDisplayFormat>(
    DEFAULT_DATE_DISPLAY,
  );

  useEffect(() => {
    const check = () => setDateDisplay(readDateDisplay());
    check();
    window.addEventListener("focus", check);
    return () => window.removeEventListener("focus", check);
  }, []);

  return dateDisplay;
}
