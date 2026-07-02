import { test, expect } from "@playwright/test";

test.describe("F49 — Image optimization (next/image)", () => {
  test("local SVG renders with correct alt text", async ({ page }) => {
    await page.goto("/images");
    await expect(page.getByTestId("img-local")).toBeVisible();
    await expect(page.getByTestId("img-local")).toHaveAttribute(
      "alt",
      "Vercel logo",
    );
  });

  test("external image loads with optimized srcset", async ({ page }) => {
    await page.goto("/images");
    const img = page.getByTestId("img-external");
    await expect(img).toBeVisible({ timeout: 15_000 });

    // next/image generates a _next/image URL for external images.
    const src = await img.getAttribute("src");
    expect(src).toContain("/_next/image");
  });

  test("responsive image has sizes attribute", async ({ page }) => {
    await page.goto("/images");
    const img = page.getByTestId("img-responsive");
    await expect(img).toBeVisible({ timeout: 15_000 });

    const sizes = await img.getAttribute("sizes");
    expect(sizes).toContain("100vw");
  });
});
