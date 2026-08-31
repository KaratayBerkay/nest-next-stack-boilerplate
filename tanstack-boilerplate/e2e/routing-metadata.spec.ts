import { test, expect } from "@playwright/test";

test("root layout has the default title", async ({ page }) => {
  await page.goto("/");
  const title = await page.title();
  expect(title).toBe("Next.js Boilerplate");
});

test("static metadata page has custom title and OG tags", async ({ page }) => {
  await page.goto("/routing/metadata-demo");
  const title = await page.title();
  expect(title).toBe("Static metadata — Next.js Boilerplate");

  const ogTitle = page.locator('meta[property="og:title"]');
  await expect(ogTitle).toHaveAttribute("content", "Static OG title");
});

test("dynamic generateMetadata sets title per slug", async ({ page }) => {
  await page.goto("/routing/metadata-demo/hello-world");
  const title = await page.title();
  expect(title).toBe("hello-world — dynamic — Next.js Boilerplate");

  const ogTitle = page.locator('meta[property="og:title"]');
  await expect(ogTitle).toHaveAttribute("content", "hello-world — OG");
});
