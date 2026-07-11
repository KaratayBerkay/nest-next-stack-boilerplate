import { test as setup, expect } from "@playwright/test";
import { E2E_EMAIL, E2E_PASSWORD, ensureTestUser } from "./helpers/auth";

const AUTH_FILE = "playwright/.auth/user.json";

/**
 * Global setup: registers/logs in via the BFF API.  Playwright's
 * APIRequestContext captures Set-Cookie headers from responses, so
 * storageState includes all httpOnly auth cookies.
 *
 * Skips if storageState already exists with valid cookies (avoids rate-limit
 * when multiple projects depend on this setup).
 */
setup("login and save storageState", async ({ request }) => {
  const fs = await import("node:fs/promises");
  try {
    const existing = JSON.parse(await fs.readFile(AUTH_FILE, "utf-8"));
    if (existing.cookies?.length > 0) return;
  } catch {
    // File doesn't exist or is invalid — proceed with login.
  }

  await ensureTestUser(request);

  const loginRes = await request.post("/api/auth/login", {
    data: { email: E2E_EMAIL, password: E2E_PASSWORD },
  });
  expect(loginRes.ok()).toBeTruthy();

  const loginData = await loginRes.json();
  expect(loginData.user).toBeTruthy();
  expect(loginData.mfaRequired).toBeFalsy();

  const setCookieHeaders = loginRes.headersArray().filter(
    (h) => h.name.toLowerCase() === "set-cookie",
  );
  expect(setCookieHeaders.length).toBeGreaterThan(0);

  const cookies = setCookieHeaders
    .map((h) => parseSetCookie(h.value))
    .map(({ path: _path, ...c }) => ({ ...c, url: "http://localhost:3100" }));

  await fs.mkdir("playwright/.auth", { recursive: true });
  await fs.writeFile(
    AUTH_FILE,
    JSON.stringify({ cookies, origins: [] }, null, 2),
  );
});

function parseSetCookie(setCookie: string) {
  const parts = setCookie.split(";").map((p) => p.trim());
  const [nameValue, ...attrs] = parts;
  const eqIdx = nameValue.indexOf("=");
  const name = nameValue.slice(0, eqIdx).trim();
  const value = nameValue.slice(eqIdx + 1).trim();

  const cookie: Record<string, unknown> = {
    name,
    value,
    httpOnly: false,
    secure: false,
    sameSite: "Lax" as const,
    path: "/",
  };

  for (const attr of attrs) {
    const [key, val] = attr.split("=").map((s) => s.trim());
    const lower = key.toLowerCase();
    if (lower === "httponly") cookie.httpOnly = true;
    else if (lower === "secure") cookie.secure = true;
    else if (lower === "path") cookie.path = val;
    else if (lower === "samesite") {
      const raw = (val || "Lax").toLowerCase();
      cookie.sameSite =
        raw === "strict" ? "Strict" : raw === "none" ? "None" : "Lax";
    }
    else if (lower === "max-age")
      cookie.expires = Date.now() / 1000 + Number(val);
    else if (lower === "domain") cookie.domain = val;
  }

  return cookie;
}
