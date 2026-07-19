import { test, expect } from "@playwright/test";
import { E2E_EMAIL, E2E_PASSWORD, ensureTestUser } from "./helpers/auth";

test.describe("Cross-stack e2e", () => {
  test("auth round-trip: register → login → me → logout", async ({
    request,
  }) => {
    const email = `stack-e2e-${Date.now()}@test.com`;
    const password = "StackTest123!";

    const regRes = await request.post("/api/auth/register", {
      data: { email, password, name: "Stack E2E User" },
    });
    expect(regRes.ok()).toBeTruthy();

    const activateRes = await request.post("/api/auth/dev-activate", {
      data: { email },
    });
    expect(activateRes.ok()).toBeTruthy();

    const loginRes = await request.post("/api/auth/login", {
      data: { email, password },
    });
    expect(loginRes.ok()).toBeTruthy();
    const loginData = await loginRes.json();
    expect(loginData.user).toBeTruthy();
    expect(loginData.mfaRequired).toBeFalsy();

    const meRes = await request.get("/api/auth/me");
    expect(meRes.ok()).toBeTruthy();
    const meData = await meRes.json();
    expect(meData.user.email).toBe(email);

    const logoutRes = await request.post("/api/auth/logout");
    expect(logoutRes.ok()).toBeTruthy();

    const meAfter = await request.get("/api/auth/me");
    expect((await meAfter.json()).user).toBeNull();
  });

  test("existing user can login and access protected endpoint", async ({
    request,
  }) => {
    await ensureTestUser(request);

    const loginRes = await request.post("/api/auth/login", {
      data: { email: E2E_EMAIL, password: E2E_PASSWORD },
    });
    expect(loginRes.ok()).toBeTruthy();

    const meRes = await request.get("/api/auth/me");
    expect(meRes.ok()).toBeTruthy();
    const meData = await meRes.json();
    expect(meData.user).toBeTruthy();
  });

  test("WebSocket gateway responds on /ws", async ({ page }) => {
    const wsPromise = page.waitForEvent("websocket");
    await page.goto("/ws");
    const ws = await wsPromise;
    expect(ws.url()).toContain("/ws");
  });
});
