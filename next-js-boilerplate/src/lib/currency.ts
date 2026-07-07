import type { CurrencyCode } from "@/constants/currency";

const LOCALE_MAP: Record<CurrencyCode, string> = {
  USD: "en-US",
  EUR: "de-DE",
  TRY: "tr-TR",
};

export function formatPrice(cents: number, currency: CurrencyCode): string {
  if (cents === 0) return "Free";
  const locale = LOCALE_MAP[currency];
  const amount = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(cents / 100);
  return `${amount}/mo`;
}
