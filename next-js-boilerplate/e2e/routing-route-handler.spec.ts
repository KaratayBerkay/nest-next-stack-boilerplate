import { test, expect } from "@playwright/test";

// F16 — Route Handlers (route.ts, Web Request/Response).

test("GET route handler returns JSON and echoes a query param", async ({
  request,
}) => {
  const res = await request.get("/api/echo?name=next");
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toContain("application/json");
  expect(await res.json()).toEqual({ method: "GET", hello: "next" });
});

test("POST route handler round-trips a JSON body", async ({ request }) => {
  const res = await request.post("/api/echo", { data: { ping: "pong" } });
  expect(res.status()).toBe(201);
  expect(await res.json()).toEqual({
    method: "POST",
    received: { ping: "pong" },
  });
});
