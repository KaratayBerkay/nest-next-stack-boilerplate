import { test, expect } from "@playwright/test";

test.describe("Auth UI", () => {
  test("login page renders the form", async ({ page }) => {
    await page.goto("/auth/login");
    await expect(page.getByTestId("login-email")).toBeVisible();
    await expect(page.getByTestId("login-password")).toBeVisible();
    await expect(page.getByTestId("login-submit")).toBeVisible();
  });

  test("register page renders the form", async ({ page }) => {
    await page.goto("/auth/register");
    await expect(page.getByTestId("reg-email")).toBeVisible();
    await expect(page.getByTestId("reg-password")).toBeVisible();
    await expect(page.getByTestId("reg-name")).toBeVisible();
    await expect(page.getByTestId("reg-submit")).toBeVisible();
  });

  test("/api/auth/me returns user:null when not authenticated", async ({
    request,
  }) => {
    const res = await request.get("/api/auth/me");
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data.user).toBeNull();
  });

  test("login page links to register page and vice versa", async ({ page }) => {
    await page.goto("/auth/login");
    const registerLink = page
      .locator("p")
      .filter({ hasText: "No account?" })
      .getByRole("link");
    await registerLink.click();
    await expect(page).toHaveURL("/auth/register");

    const signInLink = page
      .locator("p")
      .filter({ hasText: "Already have an account?" })
      .getByRole("link");
    await signInLink.click();
    await expect(page).toHaveURL("/auth/login");
  });
});

test.describe("unauthenticated UI checks", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("Sign In / Sign Out link is visible in demos header", async ({
    page,
  }) => {
    await page.goto("/theme");
    const link = page.getByRole("link", { name: /sign in/i });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", "/auth/login");
  });
});
