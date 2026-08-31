import { test, expect } from "@playwright/test";

test.describe("F30 — Client data (TanStack Query)", () => {
  test("fetches and displays data from the API", async ({ page, request }) => {
    // The initial HTML contains the loading placeholder (Client Component SSR).
    const res = await request.get("/client-data");
    const html = await res.text();
    expect(html).toContain("Loading...");

    // After JS hydrates, the query resolves and data appears.
    await page.goto("/client-data");
    await expect(page.getByTestId("tq-data")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId("tq-data")).toContainText("TanStack Query");
  });
});
