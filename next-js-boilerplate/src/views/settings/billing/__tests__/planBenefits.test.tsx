import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { PlanBenefits } from "../PlanBenefits";

vi.mock("@/lib/i18n/MessagesProvider", () => ({
  useMessages: () => ({
    planBenefits: "Plan benefits",
    featuresFree: ["Basic access", "Community support"],
    featuresBasic: ["Everything in Free", "Priority support"],
    featuresMedium: ["Everything in Basic", "VIP room access"],
    featuresPremium: ["Everything in Medium", "Crown badge"],
  }),
}));
vi.mock("@/hooks/useComponentVariant", () => ({
  useComponentVariant: () => "default",
}));

function openAccordion() {
  fireEvent.click(screen.getByText("Plan benefits"));
}

describe("PlanBenefits self-referential line", () => {
  it("does not show the user's own tier as an excluded/crossed-out benefit", () => {
    render(<PlanBenefits currentTier="FREE" />);
    openAccordion();

    expect(screen.queryByText("Everything in Free")).toBeNull();
  });

  it("still shows the rest of the next tier's real features as not-included", () => {
    render(<PlanBenefits currentTier="FREE" />);
    openAccordion();

    expect(screen.getByText("Priority support")).toBeTruthy();
  });

  it("shows the current tier's own features as included", () => {
    render(<PlanBenefits currentTier="BASIC" />);
    openAccordion();

    expect(screen.getByText("Priority support")).toBeTruthy();
    expect(screen.queryByText("Everything in Basic")).toBeNull();
    expect(screen.getByText("VIP room access")).toBeTruthy();
  });
});
