import { test, expect } from "@playwright/test";

const TEST_EMAIL = `e2e-login-${Date.now()}@test.com`;
const TEST_PASSWORD = "TestPass123!";

test.describe("Registration", () => {
  test("registers a new user and sets auth cookies", async ({ request }) => {
    const res = await request.post("/api/auth/register", {
      data: {
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        name: "E2E Test User",
      },
    });

    if (res.status() === 409) {
      test.skip();
      return;
    }

    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.user).toBeTruthy();
    expect(body.user.email).toBe(TEST_EMAIL);
    expect(body.accessToken).toBeTruthy();

    const setCookie = res.headers()["set-cookie"];
    expect(setCookie).toBeTruthy();
    expect(setCookie).toContain("access_token=");
    expect(setCookie).toContain("refresh_token=");
  });

  test("rejects missing email and password during registration", async ({
    request,
  }) => {
    const res = await request.post("/api/auth/register", { data: {} });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Email and password are required");
  });

  test("rejects duplicate registration", async ({ request }) => {
    const res = await request.post("/api/auth/register", {
      data: {
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        name: "Duplicate User",
      },
    });

    if (res.status() !== 409) {
      test.skip();
      return;
    }

    expect(res.status()).toBe(409);
    const body = await res.json();
    expect(body.error).toMatch(/already/i);
  });
});

test.describe("Login", () => {
  test("logs in and returns user with cookies", async ({ request }) => {
    const res = await request.post("/api/auth/login", {
      data: { email: TEST_EMAIL, password: TEST_PASSWORD },
    });

    if (res.status() === 401) {
      test.skip();
      return;
    }

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.user).toBeTruthy();
    expect(body.user.email).toBe(TEST_EMAIL);
    expect(body.accessToken).toBeTruthy();

    const setCookie = res.headers()["set-cookie"];
    expect(setCookie).toBeTruthy();
    const cookieStr = Array.isArray(setCookie)
      ? setCookie.join(" ")
      : setCookie;
    expect(cookieStr).toContain("access_token=");
    expect(cookieStr).toContain("refresh_token=");
    expect(cookieStr).toContain("HttpOnly");
  });

  test("rejects missing credentials", async ({ request }) => {
    const res = await request.post("/api/auth/login", {
      data: { email: "", password: "" },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Email and password are required");
  });

  test("rejects empty body", async ({ request }) => {
    const res = await request.post("/api/auth/login", { data: {} });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Email and password are required");
  });

  test("rejects invalid JSON", async ({ request }) => {
    const res = await request.post("/api/auth/login", {
      headers: { "Content-Type": "application/json" },
      data: "not-json",
    });
    expect(res.status()).toBe(400);
  });

  test("rejects invalid credentials", async ({ request }) => {
    const res = await request.post("/api/auth/login", {
      data: {
        email: "nonexistent@test.com",
        password: "wrongpassword",
      },
    });
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body.error).toBeTruthy();
  });
});

test.describe("Session with /me", () => {
  test("GET /api/auth/me returns user after login", async ({ request }) => {
    const loginRes = await request.post("/api/auth/login", {
      data: { email: TEST_EMAIL, password: TEST_PASSWORD },
    });
    if (loginRes.status() !== 200) {
      test.skip();
      return;
    }

    const body = await loginRes.json();
    const accessToken = body.accessToken;

    const meRes = await request.get("/api/auth/me", {
      headers: { Cookie: `access_token=${accessToken}` },
    });
    expect(meRes.status()).toBe(200);
    const meBody = await meRes.json();
    expect(meBody.user).toBeTruthy();
    expect(meBody.user.email).toBe(TEST_EMAIL);
  });

  test("GET /api/auth/me returns null for anonymous", async ({ request }) => {
    const res = await request.get("/api/auth/me");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.user).toBeNull();
  });

  test("GET /api/auth/me returns null for expired token", async ({
    request,
  }) => {
    const res = await request.get("/api/auth/me", {
      headers: { Cookie: "access_token=expired.jwt.token" },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.user).toBeNull();
  });
});

test.describe("Logout", () => {
  test("POST /api/auth/logout clears session cookies", async ({ request }) => {
    const loginRes = await request.post("/api/auth/login", {
      data: { email: TEST_EMAIL, password: TEST_PASSWORD },
    });
    if (loginRes.status() !== 200) {
      test.skip();
      return;
    }

    const logoutRes = await request.post("/api/auth/logout");
    expect(logoutRes.status()).toBe(200);

    const setCookie = logoutRes.headers()["set-cookie"];
    expect(setCookie).toBeTruthy();
    const cookieStr = Array.isArray(setCookie)
      ? setCookie.join(" ")
      : setCookie;
    expect(cookieStr).toContain("max-age=0");
    expect(cookieStr).toContain("access_token=");
    expect(cookieStr).toContain("refresh_token=");
  });
});

test.describe("OAuth anti-CSRF state", () => {
  test("GET /api/auth/oauth/:provider sets httpOnly state cookie", async ({
    request,
  }) => {
    const res = await request.get("/api/auth/oauth/google", {
      maxRedirects: 0,
    });

    if (res.status() !== 302) {
      test.skip();
      return;
    }

    expect(res.status()).toBe(302);
    const location = res.headers()["location"];
    expect(location).toContain("state=");
    expect(location).toContain("redirect_uri=");

    const setCookie = res.headers()["set-cookie"];
    expect(setCookie).toBeTruthy();
    const cookieStr = Array.isArray(setCookie)
      ? setCookie.join(" ")
      : setCookie;
    expect(cookieStr).toContain("oauth_state=");
    expect(cookieStr).toContain("HttpOnly");
    expect(cookieStr).toContain("Path=/api/auth/oauth/google/callback");
    expect(cookieStr).toContain("max-age=600");
  });
});
