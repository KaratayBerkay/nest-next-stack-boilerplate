import { test, expect } from "@playwright/test";

// /v1/[lang] — versioned + localized app surface: a persistent layout, custom
// error.tsx / not-found.tsx boundaries, and proxy redirects that send any
// unknown version or locale to a sensible default instead of a dead end.

test.describe("redirects (version + lang params)", () => {
  test("bare /v1 negotiates the locale from Accept-Language", async ({
    request,
  }) => {
    const res = await request.get("/v1", {
      maxRedirects: 0,
      headers: { "Accept-Language": "tr-TR,tr;q=0.9,en;q=0.8" },
    });
    expect(res.status()).toBe(307);
    expect(res.headers()["location"]).toContain("/v1/tr");
  });

  test("unsupported locale /v1/fr redirects to the default locale", async ({
    request,
  }) => {
    const res = await request.get("/v1/fr", { maxRedirects: 0 });
    expect(res.status()).toBe(307);
    expect(res.headers()["location"]).toContain("/v1/en");
  });

  test("unsupported locale keeps the rest of the path", async ({ request }) => {
    const res = await request.get("/v1/fr/boom", { maxRedirects: 0 });
    expect(res.status()).toBe(307);
    expect(res.headers()["location"]).toContain("/v1/en/boom");
  });

  test("unknown version /v2/tr redirects (308) to the default version", async ({
    request,
  }) => {
    const res = await request.get("/v2/tr/boom", { maxRedirects: 0 });
    expect(res.status()).toBe(308);
    expect(res.headers()["location"]).toContain("/v1/tr/boom");
  });

  test("any version/lang combination ultimately lands on a valid page", async ({
    request,
  }) => {
    // /v2 (bad version, no lang) → /v1 → /v1/{negotiated}; request follows both.
    const res = await request.get("/v2", {
      headers: { "Accept-Language": "de-DE,de;q=0.9" },
    });
    expect(res.url()).toContain("/v1/de");
    expect(await res.text()).toContain("Hallo!"); // German greeting from the dictionary
  });
});

test("v1/layout persists across navigation between sibling pages", async ({
  page,
}) => {
  await page.goto("/v1/en");

  // Bump the layout's counter, then navigate to a sibling page via the nav.
  const counter = page.getByTestId("counter-layout");
  await counter.click();
  await counter.click();
  await expect(counter).toContainText("2");

  await page.getByRole("link", { name: "Error", exact: true }).click();
  await expect(page).toHaveURL(/\/v1\/en\/boom$/);

  // The layout stayed mounted, so its counter kept its value.
  await expect(counter).toContainText("2");
});

test("v1/error.tsx catches a thrown render error and can reset", async ({
  page,
}) => {
  await page.goto("/v1/en/boom");
  await expect(page.getByTestId("trigger-error")).toBeVisible();

  await page.getByTestId("trigger-error").click();

  // The segment's error boundary renders (visible even behind the dev overlay).
  await expect(page.getByTestId("error-boundary")).toBeVisible();
  await expect(page.getByTestId("error-message")).toContainText("Boom");

  // Dismiss the Next dev error overlay (a no-op in production) so reset is clickable.
  await page.keyboard.press("Escape");

  // reset() re-renders the segment from scratch — back to the trigger button.
  await page.getByTestId("error-reset").click();
  await expect(page.getByTestId("trigger-error")).toBeVisible();
});

test("v1 notFound() renders the segment not-found boundary with a 404", async ({
  page,
  request,
}) => {
  const res = await request.get("/v1/en/missing");
  expect(res.status()).toBe(404);

  await page.goto("/v1/en/missing");
  await expect(page.getByTestId("not-found")).toBeVisible();
});
