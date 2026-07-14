import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { UI_COMPONENTS } from "../src/constants/ui-gallery";

// Axe pass over every ui demo page (ui-upgrade-4 C8), blocking on
// critical/serious violations — same bar as e2e/a11y.spec.ts. Axe results
// don't vary by engine, so chromium-only keeps the matrix flat.
test.skip(
  ({ browserName, isMobile }) => browserName !== "chromium" || Boolean(isMobile),
  "axe pass is chromium-only",
);

for (const { name, slug } of UI_COMPONENTS) {
  test(`ui/${slug} has no critical/serious a11y violations`, async ({
    page,
  }) => {
    await page.goto(`/v1/en/ui/${slug}`);

    // When no backend is available (CI), pages redirect to /sign-in.
    // Skip gracefully instead of failing.
    if (page.url().includes("/sign-in") || page.url().includes("/auth/")) {
      test.skip();
      return;
    }

    await expect(
      page.getByRole("tablist").first(),
      `${name} demo should render before the axe pass (auth redirect?)`,
    ).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();

    const blocking = results.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious",
    );
    expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([]);
  });
}
