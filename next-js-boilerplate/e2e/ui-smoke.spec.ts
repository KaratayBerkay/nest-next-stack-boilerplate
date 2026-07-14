import { test, expect } from "@playwright/test";
import { UI_COMPONENTS } from "../src/constants/ui-gallery";

// Walks every ui demo page (ui-upgrade-4 C8): the page renders, every
// ExampleTabs tab is clickable and non-empty (the Part E regression), and
// nothing lands in the console. Content integrity is browser-agnostic, so
// this runs on desktop chromium only to keep the matrix flat.
test.skip(
  ({ browserName, isMobile }) => browserName !== "chromium" || Boolean(isMobile),
  "content smoke is chromium-only",
);

for (const { name, slug } of UI_COMPONENTS) {
  test(`ui/${slug} renders with non-empty tabs and a clean console`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    page.on("pageerror", (err) => errors.push(String(err)));

    await page.goto(`/v1/en/ui/${slug}`);

    // When no backend is available (CI), pages redirect to /sign-in.
    // Skip gracefully instead of failing.
    if (page.url().includes("/sign-in") || page.url().includes("/auth/")) {
      test.skip();
      return;
    }

    // The tablist is the ExampleTabs anchor: it auto-waits through the
    // client mount and cannot false-positive on the sign-in redirect.
    await expect(
      page.getByRole("tablist").first(),
      `${name} should render the ExampleTabs tablist (auth redirect or missing convention?)`,
    ).toBeVisible();

    const tabs = page.getByRole("tab");
    const tabCount = await tabs.count();
    expect(tabCount, `${name} should have at least one tab`).toBeGreaterThan(0);

    for (let i = 0; i < tabCount; i++) {
      const tab = tabs.nth(i);
      const tabName = (await tab.innerText()).trim();
      await tab.click();
      const panel = page.locator('[role="tabpanel"]').first();
      await expect(panel, `tab "${tabName}" should show a panel`).toBeVisible();
      // The demo container is the panel child after the description <p>.
      // An empty Part-E-style stub has no child elements and no text.
      const demo = panel.locator(":scope > div").last();
      const childElements = await demo.locator("*").count();
      const text = (await demo.innerText()).trim();
      expect(
        childElements > 0 || text.length > 0,
        `tab "${tabName}" on ${slug} renders an empty demo`,
      ).toBe(true);
    }

    expect(errors, `console errors on ${slug}:\n${errors.join("\n")}`).toEqual([]);
  });
}
