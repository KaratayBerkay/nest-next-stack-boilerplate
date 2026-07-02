import { test, expect } from "@playwright/test";

test.describe("TanStack Form — signup demo", () => {
  test("renders the form with initial values", async ({ page }) => {
    await page.goto("/form");
    await expect(page.getByTestId("field-name")).toHaveValue("");
    await expect(page.getByTestId("field-email")).toHaveValue("");
    await expect(page.getByTestId("field-age")).toHaveValue("0");
  });

  test("client-side validation shows errors on blur when empty", async ({
    page,
  }) => {
    await page.goto("/form");

    // Fill then clear to trigger onChange validation
    await page.getByTestId("field-name").fill("x");
    await page.getByTestId("field-name").fill("");
    await page.getByTestId("field-name").blur();
    await expect(page.getByText("Name is required")).toBeVisible();

    // Invalid email
    await page.getByTestId("field-email").fill("not-an-email");
    await page.getByTestId("field-email").blur();
    await expect(page.getByText("Invalid email")).toBeVisible();

    // Age too low
    await page.getByTestId("field-age").fill("10");
    await page.getByTestId("field-age").blur();
    await expect(page.getByText("Must be 18 or older")).toBeVisible();
  });

  test("clears errors when valid input is entered", async ({ page }) => {
    await page.goto("/form");

    await page.getByTestId("field-name").fill("");
    await page.getByTestId("field-name").blur();
    await expect(page.getByText("Name is required")).toBeVisible();

    await page.getByTestId("field-name").fill("Alice");
    await page.getByTestId("field-name").blur();
    await expect(page.getByText("Name is required")).not.toBeVisible();
  });

  test("submit button becomes enabled when form is valid", async ({ page }) => {
    await page.goto("/form");

    // Initially no errors = can submit (no validation has run yet)
    const submit = page.getByTestId("form-submit");
    await expect(submit).toBeEnabled();

    // Fill all fields with valid data
    await page.getByTestId("field-name").fill("Alice");
    await page.getByTestId("field-email").fill("alice@example.com");
    await page.getByTestId("field-age").fill("25");

    await expect(submit).toBeEnabled();
  });

  test("submitting valid data runs the server action and shows success", async ({
    page,
  }) => {
    await page.goto("/form");

    await page.getByTestId("field-name").fill("Alice");
    await page.getByTestId("field-email").fill("alice@example.com");
    await page.getByTestId("field-age").fill("25");

    await page.getByTestId("form-submit").click();

    await expect(page.getByTestId("form-success")).toBeVisible();
  });
});
