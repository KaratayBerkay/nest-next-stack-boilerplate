import { test, expect } from "@playwright/test";

test.describe("F24 — Partial Prerendering (PPR)", () => {
  test("static shell is served immediately (heading present)", async ({
    request,
  }) => {
    const res = await request.get("/ppr");
    const html = await res.text();

    expect(html).toContain("Partial Prerendering (PPR)");
    expect(html).toContain("This static shell is served immediately");
  });

  test("dynamic greeting renders with cookie value", async ({ page }) => {
    await page.goto("/ppr");
    await expect(page.getByTestId("ppr-greeting")).toHaveText("Hello, Guest!");
  });

  test("dynamic greeting renders a custom name when cookie is set", async ({
    page,
    context,
  }) => {
    await context.addCookies([
      { name: "name", value: "Alice", path: "/", domain: "localhost" },
    ]);
    await page.goto("/ppr");
    await expect(page.getByTestId("ppr-greeting")).toHaveText("Hello, Alice!");
  });
});
