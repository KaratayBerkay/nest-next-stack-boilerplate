import { describe, it, expect, vi, afterEach } from "vitest";
import { apiFetch, apiFetchJson } from "@/lib/api-client";

const REFRESH_URL = "/api/auth/refresh";

function response(status: number, body?: unknown): Response {
  return new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("apiFetch", () => {
  it("passes a non-401 response through without refreshing", async () => {
    const fetchMock = vi.fn(async () => response(200, { ok: true }));
    vi.stubGlobal("fetch", fetchMock);

    const res = await apiFetch("/api/thing");

    expect(res.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).not.toHaveBeenCalledWith(REFRESH_URL, expect.anything());
  });

  it("on 401: refreshes once, retries once, returns the retried response", async () => {
    const onRefreshed = vi.fn();
    window.addEventListener("auth:refreshed", onRefreshed);
    const seen: string[] = [];
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      seen.push(url);
      if (url === REFRESH_URL) return response(200);
      // first hit 401s, the retry succeeds
      return seen.filter((u) => u === url).length > 1
        ? response(200, { data: 1 })
        : response(401);
    });
    vi.stubGlobal("fetch", fetchMock);

    try {
      const res = await apiFetch("/api/thing");

      expect(res.status).toBe(200);
      expect(seen).toEqual(["/api/thing", REFRESH_URL, "/api/thing"]);
      // successful refresh announces itself so AuthProvider can rehydrate me
      expect(onRefreshed).toHaveBeenCalledTimes(1);
    } finally {
      window.removeEventListener("auth:refreshed", onRefreshed);
    }
  });

  it("coalesces N parallel 401s into exactly one refresh (single-flight)", async () => {
    let refreshCalls = 0;
    let releaseRefresh!: () => void;
    const refreshGate = new Promise<void>((r) => (releaseRefresh = r));
    const firstHit = new Set<string>();

    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url === REFRESH_URL) {
        refreshCalls += 1;
        await refreshGate; // hold the refresh open so all 401s coalesce on it
        return response(200);
      }
      if (firstHit.has(url)) return response(200);
      firstHit.add(url);
      return response(401);
    });
    vi.stubGlobal("fetch", fetchMock);

    const inFlight = [
      apiFetch("/api/a"),
      apiFetch("/api/b"),
      apiFetch("/api/c"),
    ];
    // let all three initial 401s land and reach the shared refresh promise
    await new Promise((r) => setTimeout(r, 0));
    releaseRefresh();
    const results = await Promise.all(inFlight);

    expect(refreshCalls).toBe(1);
    for (const res of results) expect(res.status).toBe(200);
  });

  it("on refresh failure: gives up, returns the 401, dispatches auth:logout", async () => {
    const onLogout = vi.fn();
    window.addEventListener("auth:logout", onLogout);
    const fetchMock = vi.fn(async (input: RequestInfo | URL) =>
      response(String(input) === REFRESH_URL ? 401 : 401),
    );
    vi.stubGlobal("fetch", fetchMock);

    try {
      const res = await apiFetch("/api/thing");

      expect(res.status).toBe(401);
      expect(onLogout).toHaveBeenCalledTimes(1);
      // original request + refresh only — no retry after a failed refresh
      expect(fetchMock).toHaveBeenCalledTimes(2);
    } finally {
      window.removeEventListener("auth:logout", onLogout);
    }
  });

  it("does not loop when the retried request 401s again", async () => {
    let refreshCalls = 0;
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      if (String(input) === REFRESH_URL) {
        refreshCalls += 1;
        return response(200);
      }
      return response(401);
    });
    vi.stubGlobal("fetch", fetchMock);

    const res = await apiFetch("/api/thing");

    expect(res.status).toBe(401);
    expect(refreshCalls).toBe(1);
    // original + refresh + one retry = 3, then give up
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});

describe("apiFetchJson", () => {
  it("parses the JSON body on success", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => response(200, { hello: "world" })),
    );
    await expect(apiFetchJson("/api/thing")).resolves.toEqual({
      hello: "world",
    });
  });

  it("throws on a non-ok response", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => response(500)));
    await expect(apiFetchJson("/api/thing")).rejects.toThrow("500");
  });
});
