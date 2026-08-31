import { test, expect } from "@playwright/test";

test.describe("F51 — Scripts (next/script)", () => {
  test("afterInteractive and lazyOnload scripts execute", async ({ page }) => {
    const logs: string[] = [];
    page.on("console", (msg) => logs.push(msg.text()));

    await page.goto("/scripts");

    // afterInteractive runs after hydration.
    await expect
      .poll(() => logs.some((l) => l.includes("afterInteractive")), {
        timeout: 10_000,
      })
      .toBe(true);

    // lazyOnload runs during browser idle time.
    await expect
      .poll(() => logs.some((l) => l.includes("lazyOnload")), {
        timeout: 10_000,
      })
      .toBe(true);
  });
});
