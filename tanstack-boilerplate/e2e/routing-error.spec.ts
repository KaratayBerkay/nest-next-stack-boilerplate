import { test, expect } from "@playwright/test";

// F14 — Error handling (error.tsx + not-found.tsx).

test("error.tsx catches a thrown render error and can reset", async ({
  page,
}) => {
  await page.goto("/routing/boom");
  await expect(page.getByTestId("trigger-error")).toBeVisible();

  await page.getByTestId("trigger-error").click();

  // The segment's error boundary renders (visible even behind the dev overlay).
  await expect(page.getByTestId("error-boundary")).toBeVisible();
  await expect(page.getByTestId("error-message")).toContainText("Boom");

  // Dismiss the Next dev error overlay (a no-op in production) so reset is clickable.
  await page.keyboard.press("Escape");

  // reset() re-renders the segment from scratch — back to the trigger button.
  await page.getByTestId("error-reset").click();
  await expect(page.getByTestId("trigger-error")).toBeVisible();
});

test("notFound() renders the segment not-found boundary with a 404", async ({
  page,
  request,
}) => {
  const res = await request.get("/routing/missing");
  expect(res.status()).toBe(404);

  await page.goto("/routing/missing");
  await expect(page.getByTestId("not-found")).toBeVisible();
});
