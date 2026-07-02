import { test, expect } from "@playwright/test";

test.describe("F52 — Lazy loading (next/dynamic)", () => {
  test("lazy component loads and renders its content", async ({ page }) => {
    await page.goto("/lazy-loading");

    // The lazy component eventually renders.
    await expect(page.getByTestId("lazy-component")).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByTestId("lazy-component")).toContainText(
      "Loaded lazily via next/dynamic!",
    );
  });
});
