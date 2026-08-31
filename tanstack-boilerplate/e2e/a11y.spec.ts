import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Smoke-level a11y gate (audit item #10): flags real regressions (missing labels, contrast,
// broken landmarks) on the two highest-traffic surfaces without trying to be a full audit.
test.describe("Accessibility smoke", () => {
  test("home page has no critical/serious a11y violations", async ({
    page,
  }) => {
    await page.goto("/");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();

    const blocking = results.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious",
    );
    expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([]);
  });

  test("feed page has no critical/serious a11y violations", async ({
    page,
  }) => {
    await page.goto("/v1/en/feed");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();

    const blocking = results.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious",
    );
    expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([]);
  });
});
