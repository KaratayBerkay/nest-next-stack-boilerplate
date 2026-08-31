"use client";

import { useEffect } from "react";
import { CURRENCY_COOKIE, DEFAULT_CURRENCY } from "@/constants/currency";
import type { CurrencyProviderProps } from "@/types/components/CurrencyProvider-types";

export function CurrencyProvider({ children }: CurrencyProviderProps) {
  useEffect(() => {
    const match = document.cookie.match(
      new RegExp(`${CURRENCY_COOKIE}=([^;]+)`),
    );
    if (!match) {
      document.cookie = `${CURRENCY_COOKIE}=${DEFAULT_CURRENCY};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
    }
  }, []);

  return <>{children}</>;
}
