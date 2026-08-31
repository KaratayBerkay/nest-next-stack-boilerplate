import { test, expect } from "@playwright/test";

// F15 — Redirecting (redirect / permanentRedirect).
//
// redirect() issues a 307 and permanentRedirect() a 308, each with a Location
// header pointing at the target. We assert the raw status + header (no follow),
// then confirm following the redirect lands on the target page.

test("redirect() responds 307 with the target Location", async ({
  request,
}) => {
  const res = await request.get("/routing/redirect-temp", { maxRedirects: 0 });
  expect(res.status()).toBe(307);
  expect(res.headers()["location"]).toContain("/routing/a");
});

test("permanentRedirect() responds 308 with the target Location", async ({
  request,
}) => {
  const res = await request.get("/routing/redirect-perm", { maxRedirects: 0 });
  expect(res.status()).toBe(308);
  expect(res.headers()["location"]).toContain("/routing/b");
});

test("following the redirect lands on the target page", async ({ page }) => {
  await page.goto("/routing/redirect-temp");
  await expect(page).toHaveURL(/\/routing\/a$/);
  await expect(page.getByRole("heading", { name: "Demo A" })).toBeVisible();
});
