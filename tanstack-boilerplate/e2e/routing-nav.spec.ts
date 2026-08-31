import { test, expect } from "@playwright/test";

type SpaWindow = Window & { __spa?: string };

// F8 — Linking & navigating.
//
// <Link> and useRouter both perform client-side navigation: the URL changes and
// the page swaps without a full document reload. We prove "no full reload" by
// tagging `window` after the initial load and checking the tag survives each
// navigation (a real reload would discard it).
test("Link and useRouter navigate client-side without a full reload", async ({
  page,
}) => {
  await page.goto("/routing/a");
  await expect(page.getByTestId("current-path")).toHaveText("/routing/a");

  // Tag this document; a full reload would discard the tag.
  await page.evaluate(() => {
    (window as SpaWindow).__spa = "kept";
  });

  // <Link> navigation — NavLink also marks the active route.
  await page.getByRole("link", { name: "Page B" }).click();
  await expect(page.getByRole("heading", { name: "Demo B" })).toBeVisible();
  await expect(page).toHaveURL(/\/routing\/b$/);
  await expect(page.getByTestId("current-path")).toHaveText("/routing/b");
  await expect(page.getByRole("link", { name: "Page B" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  expect(await page.evaluate(() => (window as SpaWindow).__spa)).toBe("kept");

  // Programmatic navigation via useRouter.back() — also client-side.
  await page.getByTestId("router-back").click();
  await expect(page).toHaveURL(/\/routing\/a$/);
  await expect(page.getByTestId("current-path")).toHaveText("/routing/a");
  expect(await page.evaluate(() => (window as SpaWindow).__spa)).toBe("kept");

  // And useRouter.push() forward again — still the same document.
  await page.getByTestId("router-push-b").click();
  await expect(page).toHaveURL(/\/routing\/b$/);
  expect(await page.evaluate(() => (window as SpaWindow).__spa)).toBe("kept");
});
