import { test, expect } from "@playwright/test";

test.describe("F28+F31 — Caching, revalidating & ISR", () => {
  test("revalidatePath purges the cache and serves fresh content", async ({
    page,
  }) => {
    await page.goto("/caching");

    const timestamp = page.getByTestId("cached-timestamp");
    await expect(timestamp).toBeVisible();
    const before = await timestamp.textContent();

    // Trigger revalidation via Server Action.
    await page.getByTestId("revalidate-path").click();

    // Wait for the action to complete (Server Actions submit the form).
    await page.waitForTimeout(500);

    // Reload — should see a new timestamp.
    await page.reload();
    await expect(timestamp).toBeVisible();
    const after = await timestamp.textContent();
    expect(after).not.toBe(before);
  });

  test("revalidateTag purges tagged cache entries", async ({ page }) => {
    await page.goto("/caching");

    const timestamp = page.getByTestId("cached-timestamp");
    await expect(timestamp).toBeVisible();
    const before = await timestamp.textContent();

    await page.getByTestId("revalidate-tag").click();
    await page.waitForTimeout(500);
    await page.reload();
    await expect(timestamp).toBeVisible();
    const after = await timestamp.textContent();
    expect(after).not.toBe(before);
  });
});
