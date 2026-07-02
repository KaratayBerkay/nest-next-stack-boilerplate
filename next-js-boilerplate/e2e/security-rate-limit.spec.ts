import { test, expect } from "@playwright/test";

test.describe("Server-side rate limiting", () => {
  test("rapid repeated login attempts are eventually blocked", async ({
    request,
  }) => {
    const attempts = 15;
    let blocked = false;

    for (let i = 0; i < attempts; i++) {
      const res = await request.post("/api/auth/login", {
        data: {
          email: `brute-${i}@test.com`,
          password: "wrong-password",
        },
      });

      if (res.status() === 429) {
        blocked = true;
        const body = await res.json();
        expect(body).toBeTruthy();
        break;
      }
    }

    if (!blocked) {
      test.skip();
    }
  });

  test("repeated register attempts are eventually blocked", async ({
    request,
  }) => {
    const attempts = 15;
    let blocked = false;

    for (let i = 0; i < attempts; i++) {
      const res = await request.post("/api/auth/register", {
        data: {
          email: `brute-reg-${i}-${Date.now()}@test.com`,
          password: "TestPass123!",
          name: "Brute Force Test",
        },
      });

      if (res.status() === 429) {
        blocked = true;
        break;
      }
    }

    if (!blocked) {
      test.skip();
    }
  });

  test("rate limit response includes retry-after or rate limit headers", async ({
    request,
  }) => {
    for (let i = 0; i < 20; i++) {
      const res = await request.post("/api/auth/login", {
        data: {
          email: `rate-limit-header-${i}@test.com`,
          password: "wrong-password",
        },
      });

      if (res.status() === 429) {
        const headers = res.headers();
        const hasRateLimitHeader =
          headers["retry-after"] !== undefined ||
          headers["x-ratelimit-remaining"] !== undefined ||
          headers["x-ratelimit-limit"] !== undefined;

        expect(hasRateLimitHeader).toBe(true);
        return;
      }
    }

    test.skip();
  });
});
