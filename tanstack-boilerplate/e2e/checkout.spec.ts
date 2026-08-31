import { test, expect } from "@playwright/test";

/**
 * The default e2e fixture user (see e2e/helpers/auth.ts) is registered
 * fresh and is always on the FREE tier. That lets us exercise the
 * "already on this plan" branch of the checkout page with zero mocking
 * (no Stripe calls are made for that branch).
 *
 * For the upgrade branch we intercept the setup-intent creation request
 * so the test never talks to Stripe or requires a live backend/Stripe
 * key — see StripeCardForm (src/features/billing/ui/StripeCardForm.tsx),
 * which POSTs to STRIPE_CREATE_SETUP_INTENT_URL on mount and only loads
 * Stripe.js once it receives a clientSecret back.
 */
test.describe("Checkout", () => {
  test("shows the already-on-plan state for the user's current tier", async ({
    page,
  }) => {
    await page.goto("/v1/en/checkout/FREE");

    await expect(
      page.getByRole("heading", { name: /checkout to free/i }),
    ).toBeVisible();
    // "You are already on this plan." renders twice when isCurrent is true
    // (the subtitle under the heading, and the status line further down) —
    // see src/views/checkout/CheckoutContent.tsx.
    await expect(
      page.getByText("You are already on this plan.").first(),
    ).toBeVisible();

    // Neither the Stripe payment form nor the downgrade button should
    // render when the target tier equals the current tier.
    await expect(page.getByTestId("confirm-downgrade")).toHaveCount(0);
    await expect(page.getByTestId("checkout-error")).toHaveCount(0);
  });

  test("free tier plan card has no feature list (TIER_FEATURES has no FREE entry)", async ({
    page,
  }) => {
    await page.goto("/v1/en/checkout/FREE");

    // TIER_FEATURES (src/lib/checkout/tier-features.ts) only defines
    // BASIC/MEDIUM/PREMIUM, so the feature <ul> for the FREE plan card
    // renders with zero <li> children.
    const featureList = page.locator("ul").filter({ hasText: "•" });
    await expect(featureList).toHaveCount(0);
  });

  test("renders the upgrade UI and plan features for a higher tier, without contacting Stripe", async ({
    page,
  }) => {
    // Intercept the setup-intent call so the page never receives a real
    // Stripe clientSecret and therefore never loads Stripe.js or renders
    // a live payment form — this is a pure test double for the payment
    // provider, not a live payment attempt.
    await page.route("**/api/billing/create-setup-intent", (route) =>
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({
          statusCode: 500,
          exc: "EX_MOCKED",
          msg: "e2e mock: no live payment provider in tests",
          key: "mocked",
        }),
      }),
    );

    await page.goto("/v1/en/checkout/BASIC");

    await expect(
      page.getByRole("heading", { name: /upgrade to basic/i }),
    ).toBeVisible();
    await expect(
      page.getByText("Enter your card details to upgrade."),
    ).toBeVisible();
    await expect(page.getByText("Access to basic features")).toBeVisible();
    await expect(page.getByText("Standard support")).toBeVisible();

    // The mocked failure surfaces through the same error path a real
    // Stripe failure would use — data-testid="checkout-error".
    await expect(page.getByTestId("checkout-error")).toBeVisible();
    await expect(page.getByTestId("checkout-error")).toContainText(
      "e2e mock: no live payment provider in tests",
    );
  });
});
