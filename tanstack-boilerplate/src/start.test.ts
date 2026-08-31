import { describe, expect, it, vi, beforeEach } from "vitest";

// Unwrap the middleware factory so proxyRequestMiddleware exports the raw
// server handler, directly callable with { request, next, handlerType }.
vi.mock("@tanstack/react-start", () => ({
  createMiddleware: () => ({
    server: (fn: unknown) => fn,
  }),
  createStart: (fn: unknown) => fn,
}));

const setResponseHeader = vi.fn();
const setCookie = vi.fn();
vi.mock("@tanstack/react-start/server", () => ({
  setResponseHeader: (...args: unknown[]) => setResponseHeader(...args),
  setCookie: (...args: unknown[]) => setCookie(...args),
}));

import { proxyRequestMiddleware } from "./start";

type Handler = (ctx: {
  request: Request;
  next: () => Promise<Response>;
  handlerType: string;
}) => Promise<Response>;

const handler = proxyRequestMiddleware as unknown as Handler;

function run(path: string, cookie?: string) {
  const next = vi.fn(async () => new Response("page"));
  const request = new Request(`http://localhost${path}`, {
    headers: cookie ? { cookie } : {},
  });
  return { next, result: handler({ request, next, handlerType: "request" }) };
}

describe("proxyRequestMiddleware /dashboard gate (parity with next-js proxy.ts)", () => {
  beforeEach(() => {
    setResponseHeader.mockClear();
    setCookie.mockClear();
  });

  it("redirects a logged-out /dashboard request to /auth/login — regression: this block was missing from the initial port, leaving /dashboard reachable without a session", async () => {
    const { result, next } = run("/dashboard");
    const res = await result;

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe("/auth/login");
  });

  it("gates /dashboard subpaths too", async () => {
    const { result } = run("/dashboard/reports");
    const res = await result;
    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe("/auth/login");
  });

  it("lets an authenticated /dashboard request through to the page", async () => {
    const { result, next } = run("/dashboard", "access_token=tok");
    const res = await result;

    expect(next).toHaveBeenCalledTimes(1);
    expect(await res.text()).toBe("page");
  });

  it("does not gate unrelated pages (e.g. /about) on the cookie", async () => {
    const { result, next } = run("/about");
    await result;
    expect(next).toHaveBeenCalledTimes(1);
  });
});
