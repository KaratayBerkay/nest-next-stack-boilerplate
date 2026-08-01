import { describe, it, expect } from "vitest";
import { formatCurrency, formatPrice, toCurrencyCode } from "@/lib/currency";

describe("toCurrencyCode", () => {
  it("passes through known currency codes, case-insensitively", () => {
    expect(toCurrencyCode("USD")).toBe("USD");
    expect(toCurrencyCode("eur")).toBe("EUR");
    expect(toCurrencyCode("Try")).toBe("TRY");
  });

  it("falls back to USD for an unrecognized currency", () => {
    expect(toCurrencyCode("GBP")).toBe("USD");
    expect(toCurrencyCode("")).toBe("USD");
  });
});

describe("formatCurrency", () => {
  it("formats a one-time amount with no recurring suffix", () => {
    expect(formatCurrency(1999, "USD")).toBe("$19.99");
    expect(formatCurrency(0, "USD")).toBe("$0.00");
  });

  it("formats non-USD currencies in their own locale", () => {
    expect(formatCurrency(1899, "EUR")).toContain("18,99");
    expect(formatCurrency(34999, "TRY")).toContain("349,99");
  });
});

describe("formatPrice", () => {
  it("appends a /mo cadence for a non-zero recurring price", () => {
    expect(formatPrice(999, "USD")).toBe("$9.99/mo");
  });

  it("special-cases zero as Free, no cadence suffix", () => {
    expect(formatPrice(0, "USD")).toBe("Free");
  });
});
