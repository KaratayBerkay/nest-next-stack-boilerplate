import {
  CURRENCIES,
  CURRENCY_COOKIE,
  DEFAULT_CURRENCY,
} from "@/constants/currency";
import type { CurrencyCode } from "@/constants/currency";
import {
  DATE_DISPLAY_FORMATS,
  DATE_DISPLAY_COOKIE,
  DEFAULT_DATE_DISPLAY,
} from "@/constants/date-display";
import type { DateDisplayFormat } from "@/constants/date-display";

export function readCurrencyCookie(): CurrencyCode {
  if (typeof document === "undefined") return DEFAULT_CURRENCY;
  const match = document.cookie.match(new RegExp(`${CURRENCY_COOKIE}=([^;]+)`));
  const val = match?.[1];
  if (val && (CURRENCIES as readonly string[]).includes(val)) {
    return val as CurrencyCode;
  }
  return DEFAULT_CURRENCY;
}

export function readDateDisplayCookie(): DateDisplayFormat {
  if (typeof document === "undefined") return DEFAULT_DATE_DISPLAY;
  const match = document.cookie.match(
    new RegExp(`${DATE_DISPLAY_COOKIE}=([^;]+)`),
  );
  const val = match?.[1];
  if (val && (DATE_DISPLAY_FORMATS as readonly string[]).includes(val)) {
    return val as DateDisplayFormat;
  }
  return DEFAULT_DATE_DISPLAY;
}
