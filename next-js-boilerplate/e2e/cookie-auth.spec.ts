import { test, expect } from "@playwright/test";

test.describe("BFF auth endpoints", () => {
  test("/api/auth/me returns null when no cookie", async ({ request }) => {
    const res = await request.get("/api/auth/me");
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data.user).toBeNull();
  });

  test("/api/auth/me returns null on expired access token", async ({
    request,
  }) => {
    const res = await request.get("/api/auth/me", {
      headers: {
        Cookie: "access_token=eyJhbGciOiJIUzI1NiJ9.eyJleHAiOjB9.invalid",
      },
    });
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data.user).toBeNull();
  });

  test("/api/auth/me returns null on malformed access token", async ({
    request,
  }) => {
    const res = await request.get("/api/auth/me", {
      headers: { Cookie: "access_token=not-a-jwt" },
    });
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data.user).toBeNull();
  });

  test("/api/auth/me returns null on tampered access token", async ({
    request,
  }) => {
    const res = await request.get("/api/auth/me", {
      headers: {
        Cookie: "access_token=eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjF9.tampered",
      },
    });
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data.user).toBeNull();
  });

  test("/api/auth/login rejects missing body", async ({ request }) => {
    const res = await request.post("/api/auth/login", {
      data: {},
    });
    expect(res.status()).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Email and password are required");
  });

  test("/api/auth/register rejects missing body", async ({ request }) => {
    const res = await request.post("/api/auth/register", {
      data: {},
    });
    expect(res.status()).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Email and password are required");
  });

  test("/api/auth/login rejects invalid JSON", async ({ request }) => {
    const res = await request.post("/api/auth/login", {
      headers: { "Content-Type": "application/json" },
      data: "{invalid json}",
    });
    expect(res.status()).toBe(400);
  });

  test("/api/auth/register rejects invalid JSON", async ({ request }) => {
    const res = await request.post("/api/auth/register", {
      headers: { "Content-Type": "application/json" },
      data: "{invalid json}",
    });
    expect(res.status()).toBe(400);
  });

  test("/api/auth/refresh returns 401 without tokens", async ({ request }) => {
    const res = await request.post("/api/auth/refresh");
    expect(res.status()).toBe(401);
  });

  test("/api/auth/refresh returns 401 with expired refresh token", async ({
    request,
  }) => {
    const res = await request.post("/api/auth/refresh", {
      headers: {
        Cookie: "refresh_token=eyJhbGciOiJIUzI1NiJ9.eyJleHAiOjB9.invalid",
      },
    });
    expect(res.status()).toBe(401);
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
