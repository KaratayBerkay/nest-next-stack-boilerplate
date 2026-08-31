import { test, expect } from "@playwright/test";

test("bare /i18n negotiates the locale from Accept-Language (tr)", async ({
  request,
}) => {
  const res = await request.get("/i18n", {
    headers: { "Accept-Language": "tr-TR,tr;q=0.9,en;q=0.8" },
  });
  // request.get follows the proxy's 307; the final URL + body prove negotiation.
  expect(res.url()).toContain("/i18n/tr");
  expect(await res.text()).toContain("Merhaba!");
});

test("bare /i18n falls back to English for an unsupported language", async ({
  request,
}) => {
  const res = await request.get("/i18n", {
    headers: { "Accept-Language": "fr-FR,fr;q=0.9" },
  });
  expect(res.url()).toContain("/i18n/en");
  expect(await res.text()).toContain("Hello!");
});

test("each locale is server-rendered from its own dictionary", async ({
  request,
}) => {
  const en = await (await request.get("/i18n/en")).text();
  expect(en).toContain('data-testid="i18n-greeting"');
  expect(en).toContain("Hello!");

  const tr = await (await request.get("/i18n/tr")).text();
  expect(tr).toContain("Merhaba!");
});

test("an unsupported locale is a 404 (dynamicParams = false)", async ({
  request,
}) => {
  const res = await request.get("/i18n/fr");
  expect(res.status()).toBe(404);
});

test("switching locale via the UI updates content without a full reload", async ({
  page,
}) => {
  await page.goto("/i18n/en");
  await expect(page.getByTestId("i18n-greeting")).toHaveText("Hello!");

  // Tag the window — a soft navigation keeps it; a full reload wipes it.
  await page.evaluate(() => {
    (window as unknown as { __keep?: boolean }).__keep = true;
  });

  await page.getByTestId("switch-tr").click();
  await expect(page).toHaveURL(/\/i18n\/tr$/);
  // After the soft nav, Next keeps the previous page's segment in the DOM (hidden)
  // for instant back-nav, so two `i18n-greeting` nodes exist — assert the visible one.
  await expect(
    page.getByTestId("i18n-greeting").filter({ visible: true }),
  ).toHaveText("Merhaba!");
  await expect(
    page.getByTestId("active-locale").filter({ visible: true }),
  ).toHaveText("tr");

  const kept = await page.evaluate(
    () => (window as unknown as { __keep?: boolean }).__keep,
  );
  expect(kept).toBe(true);
});
