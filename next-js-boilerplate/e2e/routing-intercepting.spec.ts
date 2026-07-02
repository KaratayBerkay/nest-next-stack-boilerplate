import { test, expect } from "@playwright/test";

// F12 — Intercepting routes ((.)).
//
// Clicking a photo in the gallery soft-navigates to /gallery/[id]; the
// @modal/(.)[id] interceptor renders it as a modal overlaying the list. A hard
// navigation (or refresh) to the same URL bypasses the interceptor and shows
// the full page instead.
test("soft navigation is intercepted into a modal; hard navigation is not", async ({
  page,
}) => {
  // Hard navigation → full page, no modal.
  await page.goto("/gallery/1");
  await expect(page.getByTestId("photo-page")).toBeVisible();
  await expect(page.getByTestId("photo-modal")).toHaveCount(0);

  // Soft navigation from the gallery → intercepted modal overlaying the list.
  await page.goto("/gallery");
  await expect(page.getByRole("heading", { name: "Gallery" })).toBeVisible();
  await page.getByRole("link", { name: "photo 2" }).click();

  await expect(page).toHaveURL(/\/gallery\/2$/);
  await expect(page.getByTestId("photo-modal")).toBeVisible();
  // The list is still mounted underneath — it's an overlay, not a full nav ...
  await expect(page.getByRole("heading", { name: "Gallery" })).toBeVisible();
  // ... and the full page did NOT render in the children slot.
  await expect(page.getByTestId("photo-page")).toHaveCount(0);
});
