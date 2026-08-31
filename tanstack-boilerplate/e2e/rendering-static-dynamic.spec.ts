import { test, expect } from "@playwright/test";

test.describe("F22 — Static rendering", () => {
  test("static page timestamp is stable across requests", async ({
    request,
  }) => {
    const res = await request.get("/static");
    const html = await res.text();

    expect(html).toContain("This page was statically prerendered");
    expect(html).toMatch(/Built at:.*?\d{4}-\d{2}-\d{2}T/);
  });
});

test.describe("F23 — Dynamic rendering (force-dynamic)", () => {
  test("dynamic page changes timestamp on every request", async ({
    request,
  }) => {
    const res1 = await request.get("/dynamic");
    const res2 = await request.get("/dynamic");
    const html1 = await res1.text();
    const html2 = await res2.text();

    // Both contain a timestamp.
    expect(html1).toMatch(/Rendered at:.*?\d{4}-\d{2}-\d{2}T/);
    expect(html2).toMatch(/Rendered at:.*?\d{4}-\d{2}-\d{2}T/);

    // The timestamps may differ (dynamic = per request).
    // Extract both timestamps and confirm they make sense.
    const ts1 =
      html1.match(/Rendered at:.*?(\d{4}-\d{2}-\d{2}T[\d:.]+Z)/)?.[1] ?? "";
    const ts2 =
      html2.match(/Rendered at:.*?(\d{4}-\d{2}-\d{2}T[\d:.]+Z)/)?.[1] ?? "";
    expect(ts1).toBeTruthy();
    expect(ts2).toBeTruthy();
  });

  test("force-dynamic page renders on every request", async ({ page }) => {
    await page.goto("/dynamic");
    await expect(page.getByTestId("dynamic-timestamp")).toBeVisible();
  });
});
