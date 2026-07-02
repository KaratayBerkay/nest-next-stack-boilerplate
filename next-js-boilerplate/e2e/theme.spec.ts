import { test, expect } from "@playwright/test";

test.describe("Theme toggle", () => {
  test("defaults to system preference and toggle switches class", async ({
    page,
  }) => {
    await page.goto("/theme");

    const current = page.getByTestId("current-theme");
    const initial = (await current.textContent()) ?? "";
    expect(["light", "dark"]).toContain(initial);
  });

  test("clicking toggle switches theme", async ({ page }) => {
    await page.goto("/theme");

    const toggle = page.getByTestId("theme-toggle");
    const current = page.getByTestId("current-theme");
    const before = (await current.textContent()) ?? "";

    await toggle.click();
    const after = (await current.textContent()) ?? "";
    expect(after).not.toBe(before);
  });

  test("persists theme choice across navigation", async ({ page }) => {
    await page.goto("/theme");

    const toggle = page.getByTestId("theme-toggle");
    const current = page.getByTestId("current-theme");

    await toggle.click();
    const chosen = (await current.textContent()) ?? "";

    await page.goto("/seo");
    await page.goto("/theme");

    await expect(current).toHaveText(chosen);
  });

  test("explicit setTheme buttons work", async ({ page }) => {
    await page.goto("/theme");

    await page.getByTestId("set-light").click();
    await expect(page.getByTestId("current-theme")).toHaveText("light");

    await page.getByTestId("set-dark").click();
    await expect(page.getByTestId("current-theme")).toHaveText("dark");
  });

  test("dark class is on html element", async ({ page }) => {
    await page.goto("/theme");

    await page.getByTestId("set-dark").click();
    const hasClass = await page.evaluate(() =>
      document.documentElement.classList.contains("dark"),
    );
    expect(hasClass).toBe(true);

    await page.getByTestId("set-light").click();
    const hasNotClass = await page.evaluate(() =>
      document.documentElement.classList.contains("dark"),
    );
    expect(hasNotClass).toBe(false);
  });

  test("ThemeToggle is visible on all demo pages", async ({ page }) => {
    await page.goto("/theme");
    await expect(page.getByTestId("theme-toggle")).toBeVisible();

    await page.goto("/images");
    await expect(page.getByTestId("theme-toggle")).toBeVisible();
  });
});
