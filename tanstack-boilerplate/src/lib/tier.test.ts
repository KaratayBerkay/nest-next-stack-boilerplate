import { describe, it, expect } from "vitest";
import { TIERS, TIER_ORDER, tierAtLeast, tierLabel } from "@/lib/tier";

describe("tier ordering", () => {
  it("orders FREE < BASIC < MEDIUM < PREMIUM", () => {
    expect(TIERS).toEqual(["FREE", "BASIC", "MEDIUM", "PREMIUM"]);
    expect(TIER_ORDER.FREE).toBeLessThan(TIER_ORDER.BASIC);
    expect(TIER_ORDER.BASIC).toBeLessThan(TIER_ORDER.MEDIUM);
    expect(TIER_ORDER.MEDIUM).toBeLessThan(TIER_ORDER.PREMIUM);
  });

  it("every tier passes its own minimum", () => {
    for (const tier of TIERS) {
      expect(tierAtLeast(tier, tier)).toBe(true);
    }
  });

  it("higher tiers pass lower minimums, lower tiers fail higher ones", () => {
    expect(tierAtLeast("PREMIUM", "FREE")).toBe(true);
    expect(tierAtLeast("MEDIUM", "BASIC")).toBe(true);
    expect(tierAtLeast("FREE", "BASIC")).toBe(false);
    expect(tierAtLeast("BASIC", "PREMIUM")).toBe(false);
  });

  it("rejects null, undefined and unknown tiers", () => {
    expect(tierAtLeast(null, "FREE")).toBe(false);
    expect(tierAtLeast(undefined, "FREE")).toBe(false);
    expect(tierAtLeast("GOLD", "FREE")).toBe(false);
    expect(tierAtLeast("", "FREE")).toBe(false);
  });
});

describe("tierLabel", () => {
  it("title-cases the tier name", () => {
    expect(tierLabel("FREE")).toBe("Free");
    expect(tierLabel("PREMIUM")).toBe("Premium");
  });
});
