import { test, expect } from "@playwright/test";

test.describe("F27 — Request memoization (React.cache)", () => {
  test("React.cache deduplicates calls with the same argument", async ({
    page,
  }) => {
    await page.goto("/request-memoization");

    // The uncached function runs its body on every call —
    // same argument yields different callCount values.
    const uncachedA = page.getByTestId("uncached-a");
    const uncachedB = page.getByTestId("uncached-b");
    await expect(uncachedA).toBeVisible();
    const aVal = parseInt((await uncachedA.textContent()) ?? "", 10);
    const bVal = parseInt((await uncachedB.textContent()) ?? "", 10);
    expect(bVal).toBeGreaterThan(aVal);

    // The React.cache'd function deduplicates identical-argument calls —
    // both get the same callCount (body ran once).
    const cachedA = page.getByTestId("cached-a");
    const cachedB = page.getByTestId("cached-b");
    await expect(cachedA).toBeVisible();
    const cVal = parseInt((await cachedA.textContent()) ?? "", 10);
    const dVal = parseInt((await cachedB.textContent()) ?? "", 10);
    expect(dVal).toBe(cVal);
  });
});
