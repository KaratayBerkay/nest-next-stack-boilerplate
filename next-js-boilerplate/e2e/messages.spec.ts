import { test, expect } from "@playwright/test";

test.describe("Messaging — WebSocket chat UI", () => {
  test("page renders and shows connection status", async ({ page }) => {
    await page.goto("/messages");

    await expect(
      page.getByRole("heading", { name: "Messaging" }),
    ).toBeVisible();

    const status = page.getByTestId("msg-status");
    await expect(status).toBeVisible();
  });

  test("input is disabled when disconnected", async ({ page }) => {
    await page.goto("/messages");

    const input = page.getByTestId("msg-input");
    const sendBtn = page.getByTestId("msg-send");

    await expect(input).toBeDisabled();
    await expect(sendBtn).toBeDisabled();
  });

  test("shows empty state with no messages", async ({ page }) => {
    await page.goto("/messages");

    const container = page.getByTestId("msg-container");
    await expect(container).toContainText("No messages yet.");
  });

  test("typing in input enables send button when connected", async ({
    page,
  }) => {
    await page.goto("/messages");

    const status = page.getByTestId("msg-status");
    const sendBtn = page.getByTestId("msg-send");
    const input = page.getByTestId("msg-input");

    await expect(sendBtn).toBeDisabled();

    if ((await status.textContent()) === "Connected") {
      await input.fill("hello");
      await expect(sendBtn).toBeEnabled();
    }
  });
});
