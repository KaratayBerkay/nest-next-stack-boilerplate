import { test, expect } from "@playwright/test";

// F9 — Dynamic routes ([id], async params).
//
// The [id] segment matches any value; the async Server Component awaits
// `params` (a Promise in Next 16) and renders the id into the initial HTML.
test("dynamic [id] segment reflects the param in server-rendered output", async ({
  page,
  request,
}) => {
  // The param is present in the *initial* HTML (server-rendered, not client-filled).
  const res = await request.get("/routing/items/42");
  expect(res.status()).toBe(200);
  expect(await res.text()).toContain('item-id">42');

  await page.goto("/routing/items/alpha");
  await expect(page.getByTestId("item-id")).toHaveText("alpha");

  // A different value resolves independently.
  await page.goto("/routing/items/7");
  await expect(page.getByTestId("item-id")).toHaveText("7");
});
