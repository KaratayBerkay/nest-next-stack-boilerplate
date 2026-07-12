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
  const [currency, setCurrency] = useState<CurrencyCode>(() => {
    if (typeof document === "undefined") return DEFAULT_CURRENCY;
    return readCurrency();
  });

  useEffect(() => {
    const check = () => setCurrency(readCurrency());
    check();
    window.addEventListener("focus", check);
    return () => window.removeEventListener("focus", check);
  }, []);

  return currency;
}
