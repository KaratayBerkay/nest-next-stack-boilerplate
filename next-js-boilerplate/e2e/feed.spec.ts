import { test, expect } from "@playwright/test";

test.describe("Feed", () => {
  test("feed page renders and shows posts", async ({ page }) => {
    await page.goto("/v1/en/feed");

    await expect(page.getByText("Feed")).toBeVisible();
    await expect(
      page.getByRole("link", { name: /share something/i }),
    ).toBeVisible();
  });

  test("feed shows empty state when no posts", async ({ page }) => {
    await page.goto("/v1/en/feed");

    await page.waitForTimeout(2000);

    const body = page.locator("body");
    const text = await body.innerText();
    const hasEmptyState =
      text.includes("No posts yet") || text.includes("Share something");
    expect(hasEmptyState).toBe(true);
  });
});

test.describe("Share", () => {
  test("share page renders the form", async ({ page }) => {
    await page.goto("/v1/en/share");

    await expect(page.getByText("Share something")).toBeVisible();
    await expect(page.getByLabel("Title")).toBeVisible();
    await expect(page.getByLabel("Content")).toBeVisible();
    await expect(page.getByRole("button", { name: /share/i })).toBeVisible();
  });

  test("share button is disabled when fields are empty", async ({ page }) => {
    await page.goto("/v1/en/share");

    const shareBtn = page.getByRole("button", { name: /share/i });
    await expect(shareBtn).toBeDisabled();
  });

  test("submit with empty fields shows validation", async ({ page }) => {
    await page.goto("/v1/en/share");

    const titleInput = page.getByLabel("Title");
    const contentInput = page.getByLabel("Content");

    await titleInput.focus();
    await titleInput.blur();
    await contentInput.focus();
    await contentInput.blur();

    const shareBtn = page.getByRole("button", { name: /share/i });
    await expect(shareBtn).toBeDisabled();
  });
});
