import { test, expect } from "@playwright/test";

const NONCE_RE = /'nonce-([^']+)'/;

test("proxy sets x-proxy:active on every matched route", async ({
  request,
}) => {
  const res = await request.get("/");
  expect(res.headers()["x-proxy"]).toBe("active");
});

test("proxy sets x-cookies-present header", async ({ request }) => {
  const res = await request.get("/");
  const header = res.headers()["x-cookies-present"];
  expect(header).toBeTruthy();
  const parsed = JSON.parse(header);
  expect(parsed).toHaveProperty("access_token");
  expect(parsed).toHaveProperty("device_token");
});

test("/security/* pages carry strict CSP with all directives", async ({
  request,
}) => {
  const res = await request.get("/security/csp");
  const csp = res.headers()["content-security-policy"];
  expect(csp).toBeTruthy();
  expect(csp).toContain("default-src 'self'");
  expect(csp).toContain("'strict-dynamic'");
  expect(csp).toContain("object-src 'none'");
  expect(csp).toContain("base-uri 'self'");
  expect(csp).toContain("form-action 'self'");
  expect(csp).toContain("frame-ancestors 'none'");
  expect(csp).toContain("upgrade-insecure-requests");
  expect(csp).toMatch(NONCE_RE);
});

test("non-security routes do not carry CSP header", async ({ request }) => {
  const res = await request.get("/");
  expect(res.headers()["content-security-policy"]).toBeUndefined();
});

test("nonce is unique per request on /security/*", async ({ request }) => {
  const a = (await request.get("/security/csp")).headers()[
    "content-security-policy"
  ];
  const b = (await request.get("/security/csp")).headers()[
    "content-security-policy"
  ];
  const na = a.match(NONCE_RE)?.[1];
  const nb = b.match(NONCE_RE)?.[1];
  expect(na).toBeTruthy();
  expect(nb).toBeTruthy();
  expect(na).not.toBe(nb);
});

test("x-nonce header is forwarded to the request on /security/*", async ({
  request,
}) => {
  const res = await request.get("/security/csp");
  const cspNonce = res
    .headers()
    ["content-security-policy"].match(NONCE_RE)?.[1];
  const html = await res.text();
  expect(cspNonce).toBeTruthy();
  expect(html).toContain(cspNonce!);
});

test("security headers are present on HTML responses", async ({ page }) => {
  const res = await page.request.get("/security/csp");
  const headers = res.headers();
  expect(headers["content-security-policy"]).toBeTruthy();
  expect(headers["x-proxy"]).toBe("active");
});

test("legacy redirect /old-about returns 308", async ({ request }) => {
  const res = await request.get("/old-about", { maxRedirects: 0 });
  expect(res.status()).toBe(308);
  expect(res.headers()["location"]).toBe("/about");
});

test("x-lang header is set on responses", async ({ request }) => {
  const res = await request.get("/");
  expect(res.headers()["x-lang"]).toBeTruthy();
});
