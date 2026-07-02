import { test, expect } from "@playwright/test";

// F13 — Loading UI & streaming (loading.tsx + <Suspense>).
//
// loading.tsx is the route-level fallback shown while the page's async work
// runs; <Suspense> streams a slow child in after the shell.

test("loading.tsx fallback shows on navigation, then the page replaces it", async ({
  page,
}) => {
  // Navigate with 'commit' to see the loading state before the page resolves.
  await page.goto("/routing/slow", { waitUntil: "commit" });

  // Route-level loading.tsx fallback appears immediately ...
  await expect(page.getByTestId("route-loading")).toBeVisible();
  // ... then the page shell replaces it.
  await expect(page.getByTestId("slow-shell")).toBeVisible();
  await expect(page.getByTestId("route-loading")).toHaveCount(0);
});

test("<Suspense> streams slow content in after its fallback", async ({
  page,
}) => {
  // 'commit' resolves as soon as the response starts, so we can observe the
  // streamed fallback before the slow child arrives.
  await page.goto("/routing/slow", { waitUntil: "commit" });

  // The Suspense fallback is shown first ...
  await expect(page.getByTestId("suspense-fallback")).toBeVisible();
  // ... then the streamed content arrives and the fallback is gone.
  await expect(page.getByTestId("slow-content")).toBeVisible();
  await expect(page.getByTestId("suspense-fallback")).toHaveCount(0);
});
