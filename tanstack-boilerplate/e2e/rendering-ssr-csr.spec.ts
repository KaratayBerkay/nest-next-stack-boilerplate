import { test, expect } from "@playwright/test";

test.describe("F20 — SSR: data in initial HTML", () => {
  test("server-rendered timestamp appears before JS executes", async ({
    request,
  }) => {
    const res = await request.get("/ssr");
    const html = await res.text();

    expect(html).toContain("This data was rendered on the server");
    expect(html).toMatch(/Rendered at:.*?\d{4}-\d{2}-\d{2}T/);
  });

  test("server-rendered page displays data on load", async ({ page }) => {
    await page.goto("/ssr");
    await expect(page.getByTestId("ssr-message")).toHaveText(
      "This data was rendered on the server. It appears in the initial HTML.",
    );
    await expect(page.getByTestId("ssr-timestamp")).toBeVisible();
  });
});

test.describe("F21 — CSR: data fetched after hydration", () => {
  test("initial HTML does not contain the fetched data", async ({
    request,
  }) => {
    const res = await request.get("/csr");
    const html = await res.text();

    // The initial HTML should NOT contain the API response — it's fetched later.
    expect(html).not.toContain("Server says:");
  });

  test("client component loads data after mount", async ({ page, request }) => {
    // Verify the initial HTML contains the loading placeholder (server-rendered).
    const res = await request.get("/csr");
    const html = await res.text();
    expect(html).toContain("Loading...");

    // After JS hydrates, the fetch completes and data replaces the placeholder.
    await page.goto("/csr");
    await expect(page.getByTestId("csr-data")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId("csr-data")).toContainText("CSR");
  });
});
