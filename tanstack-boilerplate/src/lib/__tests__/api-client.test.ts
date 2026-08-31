import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { apiFetch } from "../api-client";
import { AUTH_REFRESH_URL } from "@/constants/api/urls";

type FetchCall = [RequestInfo | URL, RequestInit | undefined];

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("apiFetch 401 handling", () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  let logoutSpy: ReturnType<typeof vi.fn>;
  let sentBodies: unknown[];
  let fetchCalls: FetchCall[];

  beforeEach(() => {
    fetchMock = vi.fn();
    sentBodies = [];
    fetchCalls = [];
    vi.stubGlobal("fetch", fetchMock);
    logoutSpy = vi.fn();
    window.addEventListener("auth:logout", logoutSpy as EventListener);
  });

  afterEach(() => {
    window.removeEventListener("auth:logout", logoutSpy as EventListener);
    vi.unstubAllGlobals();
  });

  /** Serve each URL a queue of statuses (last status repeats forever). */
  function queueMock(routes: Record<string, number[]>, delayRefresh = 0): void {
    fetchMock.mockImplementation((url: string, init?: RequestInit) => {
      fetchCalls.push([url, init]);
      sentBodies.push(init?.body ?? null);
      const queue = routes[url];
      const status = queue && queue.length ? queue.shift()! : 200;
      const respond = () => Promise.resolve(jsonResponse({}, status));
      return url === AUTH_REFRESH_URL && delayRefresh > 0
        ? new Promise((resolve) =>
            setTimeout(() => resolve(respond()), delayRefresh),
          )
        : respond();
    });
  }

  it("passes non-401 responses through untouched", async () => {
    queueMock({ "/api/anything": [200] });
    const res = await apiFetch("/api/anything");
    expect(res.status).toBe(200);
    expect(fetchCalls).toHaveLength(1);
    expect(logoutSpy).not.toHaveBeenCalled();
  });

  it("silently refreshes once and retries the original request on 401", async () => {
    queueMock({ [AUTH_REFRESH_URL]: [200], "/api/feed/posts": [401, 200] });

    const res = await apiFetch("/api/feed/posts", { method: "GET" });
    expect(res.status).toBe(200);
    const urls = fetchCalls.map((c) => String(c[0]));
    expect(urls).toEqual([
      "/api/feed/posts",
      AUTH_REFRESH_URL,
      "/api/feed/posts",
    ]);
    expect(logoutSpy).not.toHaveBeenCalled();
  });

  it("dispatches auth:logout when the refresh itself fails (no loop)", async () => {
    queueMock({ [AUTH_REFRESH_URL]: [401], "/api/feed/posts": [401] });

    const res = await apiFetch("/api/feed/posts");
    expect(res.status).toBe(401);
    // Original request + one refresh attempt, but NO retry and NO repeat
    // dispatch storm — exactly one logout event.
    const urls = fetchCalls.map((c) => String(c[0]));
    expect(urls).toEqual(["/api/feed/posts", AUTH_REFRESH_URL]);
    expect(logoutSpy).toHaveBeenCalledTimes(1);
  });

  it("dispatches auth:logout when the retry still 401s", async () => {
    queueMock({ [AUTH_REFRESH_URL]: [200], "/api/feed/posts": [401, 401] });

    const res = await apiFetch("/api/feed/posts");
    expect(res.status).toBe(401);
    expect(logoutSpy).toHaveBeenCalledTimes(1);
  });

  it("collapses concurrent 401s into a single refresh attempt", async () => {
    queueMock(
      {
        [AUTH_REFRESH_URL]: [200],
        "/api/a": [401, 200],
        "/api/b": [401, 200],
        "/api/c": [401, 200],
      },
      10,
    );

    const results = await Promise.all([
      apiFetch("/api/a"),
      apiFetch("/api/b"),
      apiFetch("/api/c"),
    ]);
    expect(results.map((r) => r.status)).toEqual([200, 200, 200]);
    expect(
      fetchCalls.filter((c) => String(c[0]) === AUTH_REFRESH_URL),
    ).toHaveLength(1);
  });

  it("re-issues POST bodies unchanged on retry", async () => {
    queueMock({ [AUTH_REFRESH_URL]: [200], "/api/comment": [401, 200] });

    const res = await apiFetch("/api/comment", {
      method: "POST",
      body: JSON.stringify({ text: "hi" }),
      headers: { "Content-Type": "application/json" },
    });
    expect(res.status).toBe(200);
    // [POST /api/comment, POST /api/auth/refresh, retried POST /api/comment]
    expect(sentBodies).toEqual([
      JSON.stringify({ text: "hi" }),
      null,
      JSON.stringify({ text: "hi" }),
    ]);
  });
});
