import { describe, it, expect } from "vitest";
import {
  resolveChangeType,
  buildSuccessMessage,
} from "@/lib/checkout/plan-change";

const t = {
  changeScheduled: "Your plan will change to {tier} on {date}.",
  planChanged: "Plan changed!",
  upgradeSuccess: "Upgrade successful!",
};

describe("resolveChangeType", () => {
  it("returns immediate for FREE users upgrading", () => {
    expect(resolveChangeType("FREE", "BASIC")).toBe("immediate");
  });

  it("returns immediate when the user has no tier", () => {
    expect(resolveChangeType(undefined, "PREMIUM")).toBe("immediate");
  });

  it("returns scheduled for paid users switching paid tiers", () => {
    expect(resolveChangeType("BASIC", "PREMIUM")).toBe("scheduled");
    expect(resolveChangeType("PREMIUM", "BASIC")).toBe("scheduled");
  });

  it("returns cancel for paid users downgrading to FREE", () => {
    expect(resolveChangeType("BASIC", "FREE")).toBe("cancel");
  });
});

describe("buildSuccessMessage", () => {
  it("renders upgrade copy for a FREE -> paid response", () => {
    const msg = buildSuccessMessage("immediate", null, "BASIC", "en", t);
    expect(msg).toBe("Upgrade successful!");
  });

  it("renders the scheduled-change copy with the response date for paid -> paid", () => {
    const msg = buildSuccessMessage(
      "scheduled",
      "2026-08-01T00:00:00.000Z",
      "PREMIUM",
      "en",
      t,
    );
    expect(msg).toMatch(
      /^Your plan will change to Premium on \d{1,2}\/\d{1,2}\/\d{4}\.$/,
    );
    expect(msg).not.toContain("{date}");
  });

  it("falls back to plan changed for a scheduled change without a date", () => {
    const msg = buildSuccessMessage("scheduled", null, "PREMIUM", "en", t);
    expect(msg).toBe("Plan changed!");
  });

  it("renders downgrade copy for a paid -> FREE cancellation", () => {
    const msg = buildSuccessMessage("cancel", null, "FREE", "en", t);
    expect(msg).toBe("Plan changed!");
  });
});
