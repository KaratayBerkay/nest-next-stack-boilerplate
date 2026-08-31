import { test, expect } from "@playwright/test";

test("proxy.ts adds x-proxy header to matched routes", async ({ request }) => {
  const res = await request.get("/");
  expect(res.headers()["x-proxy"]).toBe("active");
});

test("proxy.ts legacy redirect: /old-about → 308 → /about", async ({
  request,
}) => {
  const res = await request.get("/old-about", { maxRedirects: 0 });
  expect(res.status()).toBe(308);
  expect(res.headers()["location"]).toBe("/about");
});

test("proxy.ts does not block /api routes", async ({ request }) => {
  const res = await request.get("/api/echo?name=test");
  expect(res.status()).toBe(200);
});
