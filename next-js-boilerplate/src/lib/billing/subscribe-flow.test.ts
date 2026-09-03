import { describe, it, expect, vi } from "vitest";
import {
  completeSubscribeWithAuthentication,
  declineMessage,
} from "./subscribe-flow";

const t = {
  declinedInsufficientFunds: "NO_FUNDS",
  declinedCard: "DECLINED",
  authenticationRequired: "AUTH_REQUIRED",
  subscriptionFailed: "FAILED",
};

// BE-019: Stripe 3DS recovery on first subscribe.
describe("completeSubscribeWithAuthentication", () => {
  it("passes a plain success straight through", async () => {
    const confirm = vi.fn();
    const finalize = vi.fn();
    const ok = {
      ok: true,
      periodEnd: null,
      pendingTier: null,
      pendingTierEffectiveAt: null,
    };
    const result = await completeSubscribeWithAuthentication(ok, {
      confirm,
      finalize,
      authenticationFailedMessage: "AUTH_FAILED",
    });
    expect(result).toBe(ok);
    expect(confirm).not.toHaveBeenCalled();
    expect(finalize).not.toHaveBeenCalled();
  });

  it("confirms the PaymentIntent, then finalizes the subscription", async () => {
    const confirm = vi.fn().mockResolvedValue(null);
    const finalize = vi.fn().mockResolvedValue({
      ok: true,
      periodEnd: "2026-10-03",
      pendingTier: null,
      pendingTierEffectiveAt: null,
    });
    const result = await completeSubscribeWithAuthentication(
      {
        ok: false,
        periodEnd: null,
        pendingTier: null,
        pendingTierEffectiveAt: null,
        requiresAction: true,
        clientSecret: "pi_1_secret_x",
        stripeSubscriptionId: "sub_1",
      },
      { confirm, finalize, authenticationFailedMessage: "AUTH_FAILED" },
    );
    expect(confirm).toHaveBeenCalledWith("pi_1_secret_x");
    expect(finalize).toHaveBeenCalledWith("sub_1");
    expect(result.ok).toBe(true);
  });

  it("surfaces Stripe's own error when the customer fails 3DS and never finalizes", async () => {
    const confirm = vi.fn().mockResolvedValue("Your card was declined.");
    const finalize = vi.fn();
    await expect(
      completeSubscribeWithAuthentication(
        {
          ok: false,
          periodEnd: null,
          pendingTier: null,
          pendingTierEffectiveAt: null,
          requiresAction: true,
          clientSecret: "pi_1_secret_x",
          stripeSubscriptionId: "sub_1",
        },
        { confirm, finalize, authenticationFailedMessage: "AUTH_FAILED" },
      ),
    ).rejects.toThrow("Your card was declined.");
    expect(finalize).not.toHaveBeenCalled();
  });

  it("gives up with the authentication-failed message if Stripe keeps asking", async () => {
    const pending = {
      ok: false,
      periodEnd: null,
      pendingTier: null,
      pendingTierEffectiveAt: null,
      requiresAction: true,
      clientSecret: "pi_1_secret_x",
      stripeSubscriptionId: "sub_1",
    };
    const confirm = vi.fn().mockResolvedValue(null);
    const finalize = vi.fn().mockResolvedValue(pending);
    await expect(
      completeSubscribeWithAuthentication(pending, {
        confirm,
        finalize,
        authenticationFailedMessage: "AUTH_FAILED",
      }),
    ).rejects.toThrow("AUTH_FAILED");
    expect(finalize).toHaveBeenCalledTimes(2);
  });
});

describe("declineMessage", () => {
  const err = (key: string, reason?: string) =>
    Object.assign(new Error("Payment declined"), {
      exception: { key, reason },
    });

  it("maps backend reasons to readable copy instead of the raw code", () => {
    expect(
      declineMessage(
        err("billing.errors.insufficientFunds", "insufficient_funds"),
        t,
      ),
    ).toBe("NO_FUNDS");
    expect(declineMessage(err("billing.errors.declined", "declined"), t)).toBe(
      "DECLINED",
    );
    expect(
      declineMessage(err("billing.errors.authenticationRequired"), t),
    ).toBe("AUTH_REQUIRED");
  });

  it("falls back to the error message, then the generic copy", () => {
    expect(declineMessage(new Error("boom"), t)).toBe("boom");
    expect(declineMessage({}, t)).toBe("FAILED");
  });
});
