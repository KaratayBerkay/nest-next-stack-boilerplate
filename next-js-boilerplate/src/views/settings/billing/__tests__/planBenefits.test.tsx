import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactElement } from "react";

// useTierFeatures now reads the backend feature list through react-query
// (CROSS-031); with no data cached it falls back to the i18n arrays above.
function withQuery(ui: ReactElement) {
  return (
    <QueryClientProvider client={new QueryClient()}>{ui}</QueryClientProvider>
  );
}

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
vi.mock("@/hooks/useCurrencyCookie", () => ({
  useCurrencyCookie: () => "USD",
}));
vi.mock("@/hooks/useComponentVariant", () => ({
  useComponentVariant: () => "default",
}));

function openAccordion() {
  fireEvent.click(screen.getByText("Plan benefits"));
}

describe("PlanBenefits self-referential line", () => {
  it("does not show the user's own tier as an excluded/crossed-out benefit", () => {
    render(withQuery(<PlanBenefits currentTier="FREE" />));
    openAccordion();

    expect(screen.queryByText("Everything in Free")).toBeNull();
  });

  it("still shows the rest of the next tier's real features as not-included", () => {
    render(withQuery(<PlanBenefits currentTier="FREE" />));
    openAccordion();

    expect(screen.getByText("Priority support")).toBeTruthy();
  });

  it("shows the current tier's own features as included", () => {
    render(withQuery(<PlanBenefits currentTier="BASIC" />));
    openAccordion();

    expect(screen.getByText("Priority support")).toBeTruthy();
    expect(screen.queryByText("Everything in Basic")).toBeNull();
    expect(screen.getByText("VIP room access")).toBeTruthy();
  });
});
