import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { PlanDetails } from "../PlanDetails";

vi.mock("@/lib/i18n/MessagesProvider", () => ({
  useMessages: () => ({
    planDetails: "Plan details",
    currentPlan: "Current plan",
    price: "Price",
    renewalDate: "Renews on",
    cancelsOn: "Cancels on",
    planChangesOn: "Plan changes on",
    planChangeScheduled: "Your plan will change to {tier} on {date}.",
    upgradePlan: "Upgrade plan",
    cancelSubscription: "Cancel subscription",
    cancelPendingChange:
      "You have a change to {tier} scheduled for {date} — cancel that first",
    cancelSubscriptionConfirm: "Confirm?",
    cancelSubscriptionSuccess: "Cancelled",
    cancelSubscriptionFailed: "Failed",
    cancelPendingChangeSuccess: "Pending plan change cancelled",
    cancelPendingChangeFailed: "Failed to cancel pending plan change",
  }),
}));

vi.mock("@/components/ui/Toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
}));

vi.mock("@/api/client/billing/actions", () => ({
  useBillingActions: () => ({ subscribe: vi.fn() }),
}));

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe("PlanDetails pending-change gating", () => {
  it("replaces Upgrade and Cancel with the pending-change affordance when pendingTier is set", () => {
    render(
      <PlanDetails
        tier="BASIC"
        priceCents={999}
        currency="USD"
        periodEnd="Aug 1, 2026"
        cancelAtPeriodEnd={false}
        pendingTier="PREMIUM"
        pendingTierEffectiveAt="Sep 1, 2026"
      />,
    );
    expect(
      screen.getByRole("button", {
        name: /You have a change to Premium scheduled for Sep 1, 2026/,
      }),
    ).toBeTruthy();
    expect(
      screen.queryByRole("button", { name: "Cancel subscription" }),
    ).toBeNull();
    expect(screen.queryByRole("link", { name: "Upgrade plan" })).toBeNull();
  });

  it("shows Upgrade and Cancel as usual when no change is pending", () => {
    render(
      <PlanDetails
        tier="BASIC"
        priceCents={999}
        currency="USD"
        periodEnd="Aug 1, 2026"
        cancelAtPeriodEnd={false}
      />,
    );
    expect(screen.getByRole("link", { name: "Upgrade plan" })).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Cancel subscription" }),
    ).toBeTruthy();
    expect(
      screen.queryByRole("button", { name: /cancel that first/i }),
    ).toBeNull();
  });
});

describe("PlanDetails price display", () => {
  it("renders the real subscription price/currency, not a static USD table", () => {
    render(
      <PlanDetails
        tier="MEDIUM"
        priceCents={1899}
        currency="EUR"
        periodEnd="Aug 1, 2026"
        cancelAtPeriodEnd={false}
      />,
    );
    expect(
      screen.getByText((text) => text.includes("18,99") && text.includes("€")),
    ).toBeTruthy();
  });
});
