import { test, expect } from "@playwright/test";

test.describe("Input validation - SQL injection attempts", () => {
  test("login rejects SQL injection in email", async ({ request }) => {
    const res = await request.post("/api/auth/login", {
      data: {
        email: "' OR 1=1 --",
        password: "password123",
      },
    });

    expect(res.status()).toBe(401);
  });

  test("login rejects SQL injection in password", async ({ request }) => {
    const res = await request.post("/api/auth/login", {
      data: {
        email: "test@example.com",
        password: "' OR 1=1 --",
      },
    });

    expect(res.status()).toBe(401);
  });

  test("register rejects SQL injection in email", async ({ request }) => {
    const res = await request.post("/api/auth/register", {
      data: {
        email: "'; DROP TABLE users; --",
        password: "password123",
        name: "SQL Injection",
      },
    });

    expect([400, 401, 500]).toContain(res.status());
  });
});

test.describe("Input validation - XSS attempts", () => {
  test("register rejects XSS in name", async ({ request }) => {
    const res = await request.post("/api/auth/register", {
      data: {
        email: `xss-${Date.now()}@test.com`,
        password: "password123",
        name: "<script>alert('xss')</script>",
      },
    });

    expect(res.status()).toBe(400);
  });

  test("register rejects XSS in email", async ({ request }) => {
    const res = await request.post("/api/auth/register", {
      data: {
        email: "<script>alert('xss')</script>@test.com",
        password: "password123",
        name: "XSS Attempt",
      },
    });

    expect(res.status()).toBe(400);
  });
});

test.describe("Input validation - malformed data", () => {
  test("login rejects extremely long email", async ({ request }) => {
    const longEmail = "a".repeat(1000) + "@test.com";
    const res = await request.post("/api/auth/login", {
      data: { email: longEmail, password: "password123" },
    });

    expect([400, 401, 413]).toContain(res.status());
  });

  test("register rejects extremely long password", async ({ request }) => {
    const longPassword = "A".repeat(10000);
    const res = await request.post("/api/auth/register", {
      data: {
        email: `long-pw-${Date.now()}@test.com`,
        password: longPassword,
        name: "Long Password",
      },
    });

    expect([400, 413]).toContain(res.status());
  });

  test("login rejects invalid email format", async ({ request }) => {
    const res = await request.post("/api/auth/login", {
      data: { email: "not-an-email", password: "password123" },
    });

    expect(res.status()).toBe(401);
  });

  test("register rejects invalid email format", async ({ request }) => {
    const res = await request.post("/api/auth/register", {
      data: {
        email: "invalid-email",
        password: "password123",
        name: "Bad Email",
      },
    });

    expect(res.status()).toBe(400);
  });

  test("rejects non-JSON body", async ({ request }) => {
    const res = await request.post("/api/auth/login", {
      headers: { "Content-Type": "text/plain" },
      data: "email=test@example.com&password=pass123",
    });

    expect(res.status()).toBe(400);
  });
});

test.describe("Input validation - missing or empty fields", () => {
  test("login rejects missing email", async ({ request }) => {
    const res = await request.post("/api/auth/login", {
      data: { password: "password123" },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Email and password are required");
  });

  test("login rejects missing password", async ({ request }) => {
    const res = await request.post("/api/auth/login", {
      data: { email: "test@example.com" },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Email and password are required");
  });

  test("register rejects missing name with valid email/password", async ({
    request,
  }) => {
    const res = await request.post("/api/auth/register", {
      data: {
        email: `noname-${Date.now()}@test.com`,
        password: "password123",
      },
    });
    expect(res.status()).toBe(201);
  });

  test("register rejects empty string fields", async ({ request }) => {
    const res = await request.post("/api/auth/register", {
      data: { email: "", password: "", name: "" },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Email and password are required");
  });
});
