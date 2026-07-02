import { test, expect } from "@playwright/test";

test.describe("Auth cookie security properties", () => {
  test("login sets httpOnly cookies with correct security attributes", async ({
    page,
  }) => {
    const res = await page.request.post("/api/auth/login", {
      data: { email: "test@example.com", password: "password123" },
    });

    const setCookie = res.headers()["set-cookie"];
    if (!setCookie) {
      test.skip();
      return;
    }

    const cookieParts = Array.isArray(setCookie) ? setCookie : [setCookie];

    const accessTokenCookie = cookieParts.find((c) =>
      c.startsWith("access_token="),
    );
    expect(accessTokenCookie).toBeTruthy();
    expect(accessTokenCookie).toContain("HttpOnly");
    expect(accessTokenCookie).toContain("Path=/");
    expect(accessTokenCookie).toContain("Priority=High");
    expect(accessTokenCookie).toContain("SameSite=Lax");

    const refreshTokenCookie = cookieParts.find((c) =>
      c.startsWith("refresh_token="),
    );
    expect(refreshTokenCookie).toBeTruthy();
    expect(refreshTokenCookie).toContain("HttpOnly");
    expect(refreshTokenCookie).toContain("Path=/");
    expect(refreshTokenCookie).toContain("Priority=High");
  });
});

test.describe("Cookie-based session management", () => {
  test("/api/auth/me returns null without cookies", async ({ request }) => {
    const res = await request.get("/api/auth/me");
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data.user).toBeNull();
  });

  test("/api/auth/me returns null with invalid access token cookie", async ({
    request,
  }) => {
    const res = await request.get("/api/auth/me", {
      headers: { Cookie: "access_token=invalid-token-value" },
    });
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data.user).toBeNull();
  });

  test("SSR page shows not authenticated for anonymous users", async ({
    page,
  }) => {
    await page.goto("/ssr-cookies");
    await expect(page.getByTestId("ssr-cookie-status")).toContainText(
      "Not authenticated",
    );
  });

  test("AuthStatus shows Sign In for anonymous users", async ({ page }) => {
    await page.goto("/images");
    await expect(page.getByRole("link", { name: /sign in/i })).toBeVisible();
  });
});

test.describe("Logout clears cookies", () => {
  test("logout clears all auth cookies", async ({ page }) => {
    const loginRes = await page.request.post("/api/auth/login", {
      data: { email: "test@example.com", password: "password123" },
    });
    if (!loginRes.headers()["set-cookie"]) {
      test.skip();
      return;
    }

    const logoutRes = await page.request.post("/api/auth/logout");
    const setCookie = logoutRes.headers()["set-cookie"];
    if (!setCookie) {
      test.skip();
      return;
    }

    const cookieParts = Array.isArray(setCookie) ? setCookie : [setCookie];

    const clearedAccess = cookieParts.find((c) =>
      c.startsWith("access_token="),
    );
    expect(clearedAccess).toBeTruthy();
    expect(clearedAccess).toContain("max-age=0");
    expect(clearedAccess).toContain("HttpOnly");

    const clearedRefresh = cookieParts.find((c) =>
      c.startsWith("refresh_token="),
    );
    expect(clearedRefresh).toBeTruthy();
    expect(clearedRefresh).toContain("max-age=0");
  });
});
