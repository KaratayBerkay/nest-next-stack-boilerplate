import { test, expect } from "@playwright/test";

// F10 — Route groups ((group)).
//
// A folder wrapped in parentheses organizes routes WITHOUT adding a URL
// segment. Both /about and /pricing live under app/(marketing)/ and share its
// layout, yet "marketing" never appears in the URL.
test("route group organizes routes without affecting the URL", async ({
  page,
  request,
}) => {
  for (const path of ["/about", "/pricing"]) {
    const res = await request.get(path);
    expect(res.status()).toBe(200);
  }

  await page.goto("/about");
  await expect(page.getByTestId("page-heading")).toHaveText("About");
  // The shared group layout wraps the page.
  await expect(page.getByTestId("marketing-shell")).toBeVisible();

  await page.goto("/pricing");
  await expect(page.getByTestId("page-heading")).toHaveText("Pricing");
  await expect(page.getByTestId("marketing-shell")).toBeVisible();

  // The group name is NOT a URL segment — the prefixed path does not exist.
  const grouped = await request.get("/marketing/about");
  expect(grouped.status()).toBe(404);
});
