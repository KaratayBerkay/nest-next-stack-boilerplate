import { test, expect } from "@playwright/test";

test.describe("F48 — WebSocket consumed from NestJS", () => {
  test("page renders and handles connection gracefully", async ({ page }) => {
    await page.goto("/ws");

    await expect(
      page.getByRole("heading", { name: "WebSocket" }),
    ).toBeVisible();

    // Status element is present; without the NestJS backend the socket
    // will show "Disconnected" or "Connecting..." — never "Connected".
    const status = page.getByTestId("ws-status");
    await expect(status).toBeVisible();
  });
});
