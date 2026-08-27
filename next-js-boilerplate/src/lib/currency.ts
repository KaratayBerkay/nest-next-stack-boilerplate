import { CURRENCIES, type CurrencyCode } from "@/constants/currency";

const LOCALE_MAP: Record<CurrencyCode, string> = {
  USD: "en-US",
  EUR: "de-DE",
  TRY: "tr-TR",
};

/** Narrows a currency string from an API response to a known CurrencyCode,
 * falling back to USD for anything this app doesn't have a locale for. */
export function toCurrencyCode(currency: string): CurrencyCode {
  const upper = currency.toUpperCase();
  return (CURRENCIES as readonly string[]).includes(upper)
    ? (upper as CurrencyCode)
    : "USD";
}

export function formatCurrency(cents: number, currency: CurrencyCode): string {
  const locale = LOCALE_MAP[currency];
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(cents / 100);
}

/** A recurring plan price — same formatting as formatCurrency, plus the
 * "/mo" cadence and a "Free" special case. Not for one-time amounts like
 * invoice line items; use formatCurrency for those. */
export function formatPrice(
  cents: number,
  currency: CurrencyCode,
  freeLabel: string,
): string {
  if (cents === 0) return freeLabel;
  return `${formatCurrency(cents, currency)}/mo`;
}
