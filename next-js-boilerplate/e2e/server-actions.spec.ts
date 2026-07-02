import { test, expect } from "@playwright/test";

test.describe("F29 — Server Actions & mutations", () => {
  test("form submits via Server Action and shows the result", async ({
    page,
  }) => {
    await page.goto("/server-actions");

    const input = page.getByTestId("name-input");
    const submitBtn = page.getByTestId("submit-btn");
    const greeting = page.getByTestId("greeting");

    // Initially no greeting.
    await expect(greeting).not.toBeVisible();
    await expect(submitBtn).toBeEnabled();

    // Fill in a name and submit.
    await input.fill("World");
    await submitBtn.click();

    // Wait for the greeting to appear.
    await expect(greeting).toBeVisible({ timeout: 10_000 });
    await expect(greeting).toHaveText("Hello, World!");
  });
});
