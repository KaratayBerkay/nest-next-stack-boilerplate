import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { PlanSummaryCard } from "../PlanSummaryCard";

describe("PlanSummaryCard price display", () => {
  it("renders the real priceCents/currency it's given, not a static USD table", () => {
    render(
      <PlanSummaryCard targetTier="BASIC" currency="TRY" priceCents={34999} />,
    );
    expect(
      screen.getByText((text) => text.includes("349,99") && text.includes("₺")),
    ).toBeTruthy();
  });

  it("renders USD correctly too", () => {
    render(
      <PlanSummaryCard targetTier="PREMIUM" currency="USD" priceCents={4999} />,
    );
    expect(screen.getByText("$49.99/mo")).toBeTruthy();
  });
});
