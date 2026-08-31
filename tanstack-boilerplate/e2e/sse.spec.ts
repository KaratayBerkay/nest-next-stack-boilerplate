import { test, expect } from "@playwright/test";

test.describe("F47 — SSE (Server-Sent Events)", () => {
  test("page connects and streams live events", async ({ page }) => {
    await page.goto("/sse");

    await expect(page.getByTestId("sse-status")).toHaveText("Connected", {
      timeout: 5_000,
    });

    const container = page.getByTestId("sse-events");
    await expect(container.locator("span")).toHaveCount(2, { timeout: 5_000 });

    const text = await container.innerText();
    expect(text).toMatch(/value=\d\.\d{4}/);
  });

  test("events stop after navigating away (connection closed)", async ({
    page,
  }) => {
    await page.goto("/sse");
    await expect(page.getByTestId("sse-status")).toHaveText("Connected", {
      timeout: 5_000,
    });

    // Navigate away via URL change.
    await page.goto("/");
    await expect(page.getByText("Next.js Boilerplate")).toBeVisible();
  });
});
