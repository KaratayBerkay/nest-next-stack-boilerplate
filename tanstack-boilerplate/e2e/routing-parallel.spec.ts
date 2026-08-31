import { test, expect } from "@playwright/test";

// F11 — Parallel routes (@slot).
//
// Named slots (@team, @analytics) are passed to the dashboard layout as props
// and render simultaneously alongside the implicit `children` slot.
test("parallel slots render together in one layout", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page.getByTestId("dashboard-main")).toBeVisible();
  await expect(page.getByTestId("slot-team")).toBeVisible();
  await expect(page.getByTestId("slot-analytics")).toBeVisible();
});
