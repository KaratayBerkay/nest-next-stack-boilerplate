import { test, expect } from "@playwright/test";

test.describe("Search Params (searchParams prop + useSearchParams)", () => {
  test("server reads searchParams from the prop", async ({ page }) => {
    await page.goto("/search-params?name=alice&category=books");

    const server = page.getByTestId("server-params");
    await expect(server).toContainText("name=alice, category=books");
  });

  test("client reads searchParams via useSearchParams", async ({ page }) => {
    await page.goto("/search-params?name=bob&category=games");

    const client = page.getByTestId("client-params");
    await expect(client).toContainText("name=bob, category=games");
  });

  test("links update search params without full reload", async ({ page }) => {
    await page.goto("/search-params");

    await page.getByRole("link", { name: "alice / books" }).click();
    await expect(page).toHaveURL(/name=alice/);
    await expect(page.getByTestId("server-params")).toContainText("name=alice");
  });
});
