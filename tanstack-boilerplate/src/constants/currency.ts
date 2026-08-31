export const CURRENCIES = ["USD", "EUR", "TRY"] as const;
export type CurrencyCode = (typeof CURRENCIES)[number];
export const DEFAULT_CURRENCY: CurrencyCode = "USD";
export const CURRENCY_COOKIE = "currency";
