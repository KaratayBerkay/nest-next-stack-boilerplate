import { test, expect } from "@playwright/test";

test("home page responds 200 and renders the boilerplate landing", async ({
  page,
  request,
}) => {
  const res = await request.get("/");
  expect(res.status()).toBe(200);

  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Next.js Boilerplate" }),
  ).toBeVisible();
  await expect(page.getByText("Next.js 16 · Tailwind v4")).toBeVisible();
});
