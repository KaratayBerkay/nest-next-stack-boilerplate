"use client";

import { useState, useEffect } from "react";
import {
  CURRENCY_COOKIE,
  CURRENCIES,
  DEFAULT_CURRENCY,
} from "@/constants/currency";
import type { CurrencyCode } from "@/constants/currency";

function readCurrency(): CurrencyCode {
  const match = document.cookie.match(new RegExp(`${CURRENCY_COOKIE}=([^;]+)`));
  const val = match?.[1];
  if (val && (CURRENCIES as readonly string[]).includes(val)) {
    return val as CurrencyCode;
  }
  return DEFAULT_CURRENCY;
}

export function useCurrencyCookie() {
  // Always start at the default rather than eager-reading document.cookie:
  // several consumers (pricing, plans, checkout) paint real server-priced
  // amounts on the very first render, so an eager read here would mismatch
  // the server render for anyone who has already chosen a non-default
  // currency, producing a hydration mismatch. The effect below corrects to
  // the real value immediately post-mount instead — same fix already
  // applied to the sibling useDateDisplayCookie hook.
  const [currency, setCurrency] = useState<CurrencyCode>(DEFAULT_CURRENCY);

  useEffect(() => {
    const check = () => setCurrency(readCurrency());
    check();
    window.addEventListener("focus", check);
    return () => window.removeEventListener("focus", check);
  }, []);

  return currency;
}
