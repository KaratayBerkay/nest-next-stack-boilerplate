import { type APIRequestContext } from "@playwright/test";

export const E2E_EMAIL = process.env.E2E_EMAIL || "playwright-e2e@test.com";
export const E2E_PASSWORD = process.env.E2E_PASSWORD || "Playwright123!";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Ensure the test user exists and is ACTIVE.  Strategy:
 *  1. Try login first (cheapest path — user usually already exists).
 *  2. If login succeeds → done.
 *  3. If ACCOUNT_INACTIVE → activate and retry.
 *  4. If invalid credentials → register → activate.
 *  5. If EX_AUTH_EMAIL_TAKEN → user exists but password/status issue → activate → retry.
 */
export async function ensureTestUser(request: APIRequestContext) {
  // Fast path: try login first.
  let loginRes = await request.post("/api/auth/login", {
    data: { email: E2E_EMAIL, password: E2E_PASSWORD },
  });

  if (loginRes.ok()) {
    const data = await loginRes.json();
    if (!data.mfaRequired) return;
    throw new Error("Test user has MFA enabled — disable it for e2e");
  }

  const loginBody = await loginRes.json().catch(() => ({}));

  // Throttled — wait and retry once.
  if (loginRes.status() === 429 || loginBody?.exc?.includes("THROTTL")) {
    await delay(5000);
    loginRes = await request.post("/api/auth/login", {
      data: { email: E2E_EMAIL, password: E2E_PASSWORD },
    });
    if (loginRes.ok()) {
      const data = await loginRes.json();
      if (!data.mfaRequired) return;
      throw new Error("Test user has MFA enabled — disable it for e2e");
    }
  }

  // Account inactive → activate, then retry login.
  const needsActivation =
    loginBody?.exc === "EX_AUTH_ACCOUNT_INACTIVE" || loginRes.status() === 403;

  if (needsActivation) {
    await request.post("/api/auth/dev-activate", {
      data: { email: E2E_EMAIL },
    });
    await delay(200);
    const retry = await request.post("/api/auth/login", {
      data: { email: E2E_EMAIL, password: E2E_PASSWORD },
    });
    if (retry.ok()) return;
  }

  // Invalid credentials → register new user.
  const registerRes = await request.post("/api/auth/register", {
    data: {
      email: E2E_EMAIL,
      password: E2E_PASSWORD,
      name: "E2E Test User",
    },
  });

  if (registerRes.ok()) {
    // New user created with PENDING_VERIFICATION — activate.
    await request.post("/api/auth/dev-activate", {
      data: { email: E2E_EMAIL },
    });
    return;
  }

  const registerBody = await registerRes.json().catch(() => ({}));
  const alreadyExists =
    registerRes.status() === 409 ||
    registerBody?.exc === "EX_AUTH_EMAIL_TAKEN" ||
    registerBody?.field === "email";

  if (!alreadyExists) {
    // Throttled on register — wait and try login again.
    if (registerRes.status() === 429) {
      await delay(5000);
      const retry = await request.post("/api/auth/login", {
        data: { email: E2E_EMAIL, password: E2E_PASSWORD },
      });
      if (retry.ok()) return;
    }
    throw new Error(
      `Register failed (${registerRes.status()}): ${JSON.stringify(registerBody)}`,
    );
  }

  // User exists (409) but login failed above — likely inactive.
  await request.post("/api/auth/dev-activate", {
    data: { email: E2E_EMAIL },
  });
  await delay(200);
  const finalLogin = await request.post("/api/auth/login", {
    data: { email: E2E_EMAIL, password: E2E_PASSWORD },
  });
  if (!finalLogin.ok()) {
    const body = await finalLogin.json().catch(() => ({}));
    throw new Error(
      `Final login failed (${finalLogin.status()}): ${JSON.stringify(body)}`,
    );
  }
}
