import { describe, it, expect } from "vitest";
import {
  calcPrice,
  resolveCouponPercent,
  validateTaxId,
} from "./billing-utils";

describe("calcPrice", () => {
  it("returns the yearly price as-is with no discount badge when there is no coupon", () => {
    const price = calcPrice("basic", "yearly");
    expect(price).toEqual({
      subtotal: 86,
      discountPercent: 20,
      couponAmount: 0,
      total: 86,
    });
  });

  it("returns the monthly price with no yearly-savings badge", () => {
    const price = calcPrice("basic", "monthly");
    expect(price.discountPercent).toBeNull();
    expect(price.total).toBe(9);
  });

  it("deducts a valid coupon's amount from the total instead of only displaying it", () => {
    const price = calcPrice("basic", "monthly", 10);
    expect(price.couponAmount).toBe(1); // round(9 * 0.10)
    expect(price.total).toBe(8);
  });

  it("combines the yearly built-in price with a coupon deduction", () => {
    const price = calcPrice("pro", "yearly", 20);
    // pro yearly subtotal is 278; a 20% coupon must come off that, not off
    // the undiscounted monthly*12 figure.
    expect(price.subtotal).toBe(278);
    expect(price.couponAmount).toBe(56); // round(278 * 0.20)
    expect(price.total).toBe(222);
  });

  it("falls back to the first plan for an unknown plan value", () => {
    const price = calcPrice("not-a-real-plan", "monthly");
    expect(price.subtotal).toBe(0);
  });
});

describe("resolveCouponPercent", () => {
  it("resolves a known coupon case-insensitively", () => {
    expect(resolveCouponPercent("save10")).toBe(10);
    expect(resolveCouponPercent("WELCOME20")).toBe(20);
  });

  it("returns 0 for an unknown or empty coupon code", () => {
    expect(resolveCouponPercent("NOT-REAL")).toBe(0);
    expect(resolveCouponPercent("")).toBe(0);
  });
});

describe("validateTaxId", () => {
  it("allows an empty value (optional field)", () => {
    expect(validateTaxId("", "invalid")).toBeUndefined();
  });

  it("accepts a valid VAT-style id", () => {
    expect(validateTaxId("DE123456789", "invalid")).toBeUndefined();
  });

  it("rejects a malformed id", () => {
    expect(validateTaxId("123", "invalid")).toBe("invalid");
  });
});
