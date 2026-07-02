import { test, expect } from "@playwright/test";

test.describe("F26 — Server data fetching (fetch in RSC)", () => {
  test("fetched data appears in the initial HTML before JS", async ({
    page,
  }) => {
    await page.goto("/data-fetching");

    const container = page.getByTestId("server-data");
    await expect(container).toBeVisible();

    // The Route Handler returns these exact values, rendered in the RSC.
    await expect(container).toContainText("name: Data from Server");
    await expect(container).toContainText("id: 1");
    await expect(container).toContainText("nested.value: 42");

    // The static shell (heading, description) is rendered outside <Suspense>.
    await expect(
      page.getByText("This data was fetched from a Route Handler"),
    ).toBeVisible();
  });
});
