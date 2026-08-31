import { test, expect } from "@playwright/test";

// F7 — Layouts & pages.
//
// A nested layout (routing/layout.tsx) wraps the pages of the /routing segment.
// On navigation between sibling pages the App Router keeps the shared layout
// mounted. With cacheComponents enabled, React's <Activity> preserves page
// component state, so navigating back to a previous page restores its state.
// See https://nextjs.org/docs/api-reference/config/next-config-js/cacheComponents
test("nested layout persists state across navigation while pages remount", async ({
  page,
}) => {
  await page.goto("/routing/a");
  await expect(page.getByRole("heading", { name: "Demo A" })).toBeVisible();

  const layoutCounter = page.getByTestId("counter-layout");
  const pageCounter = page.getByTestId("counter-page");

  // Build up some state in both the layout and page A.
  await layoutCounter.click();
  await layoutCounter.click();
  await layoutCounter.click();
  await pageCounter.click();
  await expect(layoutCounter).toHaveText(/clicked 3 times/);
  await expect(pageCounter).toHaveText(/clicked 1 times/);

  // Client-side navigate to the sibling page within the same layout.
  await page.getByRole("link", { name: "Page B" }).click();
  await expect(page.getByRole("heading", { name: "Demo B" })).toBeVisible();

  // The layout kept its state (it never unmounted).
  await expect(layoutCounter).toHaveText(/clicked 3 times/);

  // Activity preserves Page A's state. Navigate back and confirm state
  // is restored rather than starting fresh.
  await page.getByRole("link", { name: "Page A" }).click();
  await expect(page.getByRole("heading", { name: "Demo A" })).toBeVisible();
  await expect(layoutCounter).toHaveText(/clicked 3 times/);
  // With Activity the restored page (first in DOM order) keeps its state.
  await expect(page.getByTestId("counter-page").first()).toHaveText(
    /clicked 1 times/,
  );
});
