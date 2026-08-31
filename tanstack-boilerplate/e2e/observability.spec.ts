import { test, expect } from "@playwright/test";

test.describe("F33 — instrumentation + OpenTelemetry", () => {
  test("startup hook ran and a trace was exported (API)", async ({
    request,
  }) => {
    const res = await request.get("/api/observability");
    expect(res.ok()).toBeTruthy();

    const body = await res.json();

    // `register()` ran at boot and recorded a startup marker.
    expect(typeof body.startedAt).toBe("number");
    expect(body.runtime).toBe("nodejs");
    expect(body.uptimeMs).toBeGreaterThanOrEqual(0);

    // OpenTelemetry exported spans into our in-memory processor, including the
    // explicit custom span this handler creates.
    expect(body.spanCount).toBeGreaterThan(0);
    expect(body.customSpanExported).toBe(true);
    expect(body.recentSpans).toContain("observability.check");
  });

  test("demo page surfaces the trace state", async ({ page }) => {
    await page.goto("/observability");

    await expect(page.getByTestId("obs-started")).toHaveText("yes");
    await expect(page.getByTestId("obs-runtime")).toHaveText("nodejs");
    await expect(page.getByTestId("obs-custom-span")).toHaveText("yes");

    const spanCount = await page.getByTestId("obs-span-count").innerText();
    expect(Number(spanCount)).toBeGreaterThan(0);
  });
});
