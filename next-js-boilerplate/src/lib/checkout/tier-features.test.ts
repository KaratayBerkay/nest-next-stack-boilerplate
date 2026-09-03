import { describe, it, expect } from "vitest";
import { featuresFromPlanPrices, tierFeatureLabel } from "./tier-features";

const labels = {
  basicAccess: "Basic access",
  everythingIn: "Everything in {tier}",
  callMinutes: "Calls up to {value} min",
  storageMultiplier: "{value}× storage",
};
const fallback = {
  FREE: ["fb-free"],
  BASIC: ["fb-basic"],
  MEDIUM: ["fb-medium"],
  PREMIUM: ["fb-premium"],
};

// CROSS-031: the list comes from the backend, the wording from i18n.
describe("tierFeatureLabel", () => {
  it("interpolates values and resolves everythingIn to the tier label", () => {
    expect(tierFeatureLabel({ key: "basicAccess" }, labels)).toBe(
      "Basic access",
    );
    expect(tierFeatureLabel({ key: "callMinutes", value: "45" }, labels)).toBe(
      "Calls up to 45 min",
    );
    expect(
      tierFeatureLabel({ key: "everythingIn", value: "BASIC" }, labels),
    ).toBe("Everything in Basic");
  });

  it("never drops an unknown key from a newer backend", () => {
    expect(tierFeatureLabel({ key: "teleport" }, labels)).toBe("teleport");
    expect(tierFeatureLabel({ key: "teleport", value: "3" }, labels)).toBe(
      "teleport: 3",
    );
  });
});

describe("featuresFromPlanPrices", () => {
  it("uses the backend list per tier and the fallback only where none arrived", () => {
    const result = featuresFromPlanPrices(
      [
        {
          tier: "FREE",
          priceCents: 0,
          currency: "USD",
          features: [
            { key: "basicAccess" },
            { key: "callMinutes", value: "10" },
          ],
        },
        { tier: "BASIC", priceCents: 999, currency: "USD", features: [] },
      ],
      labels,
      fallback,
    );
    expect(result.FREE).toEqual(["Basic access", "Calls up to 10 min"]);
    expect(result.BASIC).toEqual(["fb-basic"]);
    expect(result.PREMIUM).toEqual(["fb-premium"]);
  });

  it("returns the fallback verbatim before the query resolves", () => {
    expect(featuresFromPlanPrices(undefined, labels, fallback)).toEqual(
      fallback,
    );
  });
});
