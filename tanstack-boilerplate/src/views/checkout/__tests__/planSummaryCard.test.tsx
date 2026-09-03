import { render, screen } from "@testing-library/react";
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

import { PlanSummaryCard } from "../PlanSummaryCard";

// useTierFeatures reads the "pricing" namespace's feature-list copy, which
// this price-display test doesn't otherwise need — no MessagesProvider is
// mounted here, so stub it directly.
vi.mock("@/lib/i18n/MessagesProvider", () => ({
  useMessages: () => ({
    free: "FREE_LABEL",
    featuresFree: [],
    featuresBasic: [],
    featuresMedium: [],
    featuresPremium: [],
  }),
}));

vi.mock("@/hooks/useCurrencyCookie", () => ({
  useCurrencyCookie: () => "USD",
}));

describe("PlanSummaryCard price display", () => {
  it("renders the real priceCents/currency it's given, not a static USD table", () => {
    render(
      withQuery(
        <PlanSummaryCard
          targetTier="BASIC"
          currency="TRY"
          priceCents={34999}
        />,
      ),
    );
    expect(
      screen.getByText((text) => text.includes("349,99") && text.includes("₺")),
    ).toBeTruthy();
  });

  it("renders USD correctly too", () => {
    render(
      withQuery(
        <PlanSummaryCard
          targetTier="PREMIUM"
          currency="USD"
          priceCents={4999}
        />,
      ),
    );
    expect(screen.getByText("$49.99/mo")).toBeTruthy();
  });

  it("shows the translated free label for a zero-cents tier, not hardcoded English", () => {
    // Note: tierLabel("FREE") itself renders as "Free" in the card's own
    // heading — that's the tier's name, not the price, and is expected
    // regardless of this fix. This test only checks the price line.
    render(
      withQuery(
        <PlanSummaryCard targetTier="FREE" currency="USD" priceCents={0} />,
      ),
    );
    expect(screen.getByText("FREE_LABEL")).toBeTruthy();
  });
});
