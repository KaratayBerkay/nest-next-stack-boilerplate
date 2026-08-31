import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { PlanDetails } from "../PlanDetails";

const subscribeMock = vi.fn();

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
  useBillingActions: () => ({ subscribe: subscribeMock }),
}));

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Button renders through useComponentVariant, which needs a ThemeProvider
// this unit test doesn't set up — stub it to the default variant.
vi.mock("@/hooks/useComponentVariant", () => ({
  useComponentVariant: () => "default",
}));

// The real ConfirmDialog renders Dialog/Button, which need a ThemeProvider
// this unit test doesn't set up (same gap as this repo's other component-
// tree tests). PlanDetails' own behavior under test is just "renders the
// trigger, wires onConfirm to the cancel flow" — not the dialog's own open/
// close UI, which is that component's own concern — so the trigger firing
// onConfirm directly is a faithful enough stand-in here.
vi.mock("@/components/ui/ConfirmDialog", () => ({
  ConfirmDialog: ({
    onConfirm,
    children,
  }: {
    onConfirm: () => void;
    children: (open: () => void) => React.ReactNode;
  }) => children(onConfirm),
}));

describe("PlanDetails pending-change gating", () => {
  it("replaces Upgrade and Cancel with the pending-change affordance when pendingTier is set", () => {
    render(
      <PlanDetails
        tier="BASIC"
        priceCents={999}
        currency="USD"
        periodEnd="2026-08-01T12:00:00.000Z"
        cancelAtPeriodEnd={false}
        pendingTier="PREMIUM"
        pendingTierEffectiveAt="2026-09-01T12:00:00.000Z"
      />,
    );
    expect(
      screen.getByRole("button", {
        name: /You have a change to Premium scheduled for September 1, 2026/,
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
        periodEnd="2026-08-01T12:00:00.000Z"
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

describe("PlanDetails pending-change cancellation", () => {
  it("sends a non-empty idempotency key and disables the button while the request is in flight", async () => {
    let resolveSubscribe!: () => void;
    subscribeMock.mockReset();
    subscribeMock.mockReturnValue(
      new Promise<void>((resolve) => {
        resolveSubscribe = resolve;
      }),
    );

    render(
      <PlanDetails
        tier="BASIC"
        priceCents={999}
        currency="USD"
        periodEnd="2026-08-01T12:00:00.000Z"
        cancelAtPeriodEnd={false}
        pendingTier="PREMIUM"
        pendingTierEffectiveAt="2026-09-01T12:00:00.000Z"
      />,
    );

    const button = screen.getByRole("button", {
      name: /You have a change to Premium scheduled for September 1, 2026/,
    });
    fireEvent.click(button);

    expect(subscribeMock).toHaveBeenCalledTimes(1);
    const [, , idempotencyKey] = subscribeMock.mock.calls[0] as [
      string,
      string | undefined,
      string | undefined,
      string,
    ];
    expect(idempotencyKey).toBeTruthy();
    expect((button as HTMLButtonElement).disabled).toBe(true);

    // A second click while the first request is still in flight must not
    // fire a second mutation — this is exactly the double-submit this fix
    // closes.
    fireEvent.click(button);
    expect(subscribeMock).toHaveBeenCalledTimes(1);

    resolveSubscribe();
    await waitFor(() =>
      expect((button as HTMLButtonElement).disabled).toBe(false),
    );
  });
});

describe("PlanDetails date formatting", () => {
  it("formats the raw ISO renewal date instead of showing it verbatim", () => {
    render(
      <PlanDetails
        tier="BASIC"
        priceCents={999}
        currency="USD"
        periodEnd="2026-08-01T12:00:00.000Z"
        cancelAtPeriodEnd={false}
      />,
    );

    expect(screen.getByText("August 1, 2026")).toBeTruthy();
    expect(screen.queryByText("2026-08-01T12:00:00.000Z")).toBeNull();
  });
});

describe("PlanDetails price display", () => {
  it("renders the real subscription price/currency, not a static USD table", () => {
    render(
      <PlanDetails
        tier="MEDIUM"
        priceCents={1899}
        currency="EUR"
        periodEnd="2026-08-01T12:00:00.000Z"
        cancelAtPeriodEnd={false}
      />,
    );
    expect(
      screen.getByText((text) => text.includes("18,99") && text.includes("€")),
    ).toBeTruthy();
  });
});
