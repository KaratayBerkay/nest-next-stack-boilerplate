import { test, expect } from "@playwright/test";

/**
 * Settings sub-pages render tier-gated views (Free/Basic/Medium/Premium),
 * see src/lib/tier-view.tsx. The e2e fixture user (e2e/helpers/auth.ts) is
 * always registered fresh on the FREE tier, so these tests target the
 * *PageView.tsx / PageContent.tsx components under src/views/settings/**
 * that render for a FREE-tier user.
 */
test.describe("Settings navigation", () => {
  test("settings index shows the current plan and an upgrade link", async ({
    page,
  }) => {
    await page.goto("/v1/en/settings");

    await expect(
      page.getByRole("heading", { name: "Current plan" }),
    ).toBeVisible();
    // "Free" renders twice for a FREE-tier user: the tier label and the
    // formatted price (formatPrice(0, ...) === "Free") — see
    // src/views/settings/PageContent.tsx.
    await expect(page.getByText("Free", { exact: true }).first()).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Upgrade plan" }),
    ).toBeVisible();
  });

  test("settings nav links to every sub-page", async ({ page }) => {
    await page.goto("/v1/en/settings");

    const nav = page.getByRole("navigation", { name: "Settings" });
    await expect(nav.getByRole("link", { name: "General" })).toHaveAttribute(
      "href",
      "/v1/en/settings/general",
    );
    await expect(nav.getByRole("link", { name: "Account" })).toHaveAttribute(
      "href",
      "/v1/en/settings/account",
    );
    await expect(nav.getByRole("link", { name: "Privacy" })).toHaveAttribute(
      "href",
      "/v1/en/settings/privacy",
    );
    await expect(nav.getByRole("link", { name: "Billing" })).toHaveAttribute(
      "href",
      "/v1/en/settings/billing",
    );
    await expect(nav.getByRole("link", { name: "API Keys" })).toHaveAttribute(
      "href",
      "/v1/en/settings/api-keys",
    );
    await expect(nav.getByRole("link", { name: "Sessions" })).toHaveAttribute(
      "href",
      "/v1/en/settings/sessions",
    );
  });

  test("clicking General in the nav navigates to the preferences form", async ({
    page,
  }) => {
    await page.goto("/v1/en/settings");

    await page
      .getByRole("navigation", { name: "Settings" })
      .getByRole("link", { name: "General" })
      .click();

    await expect(page).toHaveURL(/\/settings\/general$/);
    await expect(page.getByRole("heading", { name: "General" })).toBeVisible();
    // Scoped to the <label> tag: the page also mounts a (closed) PageInfo
    // dialog whose "Timezone" section heading is plain text matched by
    // getByText regardless of the dialog being visually hidden — see
    // src/components/ui/page-info/PageInfoButton.tsx and
    // src/constants/page-info/settings-general.ts.
    await expect(
      page.locator("label").filter({ hasText: "Language" }),
    ).toBeVisible();
    await expect(
      page.locator("label").filter({ hasText: "Timezone" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Save changes" }),
    ).toBeVisible();
  });

  test("Account settings shows the profile form", async ({ page }) => {
    await page.goto("/v1/en/settings/account");

    await expect(page.getByRole("heading", { name: "Account" })).toBeVisible();
    await expect(page.getByText("Username", { exact: true })).toBeVisible();
    await expect(page.getByText("Bio", { exact: true })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Change photo" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Save changes" }),
    ).toBeVisible();
  });

  test("Privacy settings renders toggles and a switch can be flipped", async ({
    page,
  }) => {
    await page.goto("/v1/en/settings/privacy");

    await expect(page.getByRole("heading", { name: "Privacy" })).toBeVisible();
    await expect(page.getByText("Don't show my profile picture")).toBeVisible();
    await expect(
      page.getByText("Two-factor authentication (2FA)"),
    ).toBeVisible();

    const switches = page.getByRole("switch");
    await expect(switches).toHaveCount(3);

    const twoFactorSwitch = switches.nth(2);
    await expect(twoFactorSwitch).not.toBeChecked();
    await twoFactorSwitch.click();
    await expect(twoFactorSwitch).toBeChecked();
  });

  test("Billing settings shows the plan summary and history section", async ({
    page,
  }) => {
    await page.goto("/v1/en/settings/billing");

    // exact: true — a substring match on "Billing" also hits the "Billing
    // history" <h3> below it.
    await expect(
      page.getByRole("heading", { name: "Billing", exact: true }),
    ).toBeVisible();
    await expect(page.getByText("Current plan")).toBeVisible();
    // exact: true (case-sensitive) — the page's closed PageInfo dialog has
    // a "Billing History" (title-case) section that a case-insensitive
    // match would also hit.
    await expect(
      page.getByText("Billing history", { exact: true }),
    ).toBeVisible();
  });

  test("API Keys settings shows key management UI", async ({ page }) => {
    await page.goto("/v1/en/settings/api-keys");

    await expect(page.getByRole("heading", { name: "API Keys" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "+ New API key" }),
    ).toBeVisible();
  });

  test("Sessions settings shows the sessions & devices heading", async ({
    page,
  }) => {
    await page.goto("/v1/en/settings/sessions");

    await expect(
      page.getByRole("heading", { name: "Sessions & Devices" }),
    ).toBeVisible();
  });
});
