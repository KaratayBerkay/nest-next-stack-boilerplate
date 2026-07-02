import { test, expect } from "@playwright/test";

test.describe("F50 — Fonts (next/font)", () => {
  test("Geist Sans is the applied body font", async ({ page }) => {
    await page.goto("/fonts");
    const el = page.getByTestId("font-sans");

    // The font-family resolves to the CSS variable which maps to Geist.
    const fontFamily = await el.evaluate((e) =>
      getComputedStyle(e).getPropertyValue("font-family"),
    );
    expect(fontFamily.toLowerCase()).toContain("geist");
  });

  test("Geist Mono is the applied code font", async ({ page }) => {
    await page.goto("/fonts");
    const el = page.getByTestId("font-mono");

    const fontFamily = await el.evaluate((e) =>
      getComputedStyle(e).getPropertyValue("font-family"),
    );
    expect(fontFamily.toLowerCase()).toContain("geist");
  });
});
