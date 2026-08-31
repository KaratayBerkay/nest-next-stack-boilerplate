import { test, expect } from "@playwright/test";

test.describe("Swipe navigation", () => {
  test("users list page renders user rows", async ({ page }) => {
    await page.goto("/v1/en/users/list");
    await expect(page.getByTestId("users-list")).toBeVisible();
    await expect(page.getByText("Alice Johnson")).toBeVisible();
    await expect(page.getByText("Bob Smith")).toBeVisible();
    await expect(page.getByText("Charlie Brown")).toBeVisible();
  });

  test("clicking a user row navigates to detail page", async ({ page }) => {
    await page.goto("/v1/en/users/list");
    await page.getByText("Alice Johnson").click();
    await expect(page).toHaveURL(/\/v1\/en\/users\/detail\/a1b2c3/);
    await expect(page.getByTestId("user-name")).toHaveText("Alice Johnson");
    await expect(page.getByTestId("user-uuid")).toContainText("a1b2c3");
  });

  test("detail page shows back link to users list", async ({ page }) => {
    await page.goto("/v1/en/users/detail/a1b2c3");
    await page.getByRole("link", { name: /back to users/i }).click();
    await expect(page).toHaveURL("/v1/en/users/list");
  });

  test("users nav link is visible in v1 navigation", async ({ page }) => {
    await page.goto("/v1/en");
    await page.getByRole("link", { name: "Users" }).click();
    await expect(page).toHaveURL("/v1/en/users/list");
  });

  test("home page has forward link to users", async ({ page }) => {
    await page.goto("/v1/en");
    const links = page.locator("nav a");
    const usersLink = links.filter({ hasText: "Users" });
    await expect(usersLink).toBeVisible();
    await expect(usersLink).toHaveAttribute("href", "/v1/en/users/list");
  });
});
